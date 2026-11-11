"""LoRA fine-tune of the local Qwen3-VL-4B on instruction -> passage pairs.

Loss is taken on the passage tokens only (the author's words), never on the request.
At the end of every epoch the script measures perplexity on the held-out passages: how
predictable the author's real, unseen writing is to the model (lower = closer). The
adapter from the best epoch is the one kept, so extra epochs cannot make the result worse.
Small corpora get more epochs so every run has at least MIN_STEPS optimizer steps.

Each run lives in runs/<voice>/runs/<run id>/ (adapter/, train_log.jsonl, train_state.json,
metrics.json, info.json) and becomes the voice's active run (runs/<voice>/active.json).

Usage: python pipeline/train.py --voice garry [--run-id 20261111-2030]
"""
from __future__ import annotations

import argparse
import json
import math
import random
import time
from pathlib import Path

import torch
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForImageTextToText, AutoTokenizer

ROOT = Path(__file__).resolve().parent.parent
TARGETS = r".*language_model.*\.(q_proj|k_proj|v_proj|o_proj|gate_proj|up_proj|down_proj)"
MIN_STEPS = 160
MAX_EPOCHS = 8


def encode(tok, rec: dict, max_len: int) -> tuple[list[int], list[int]]:
    """Prompt tokens are masked (-100); the passage and its end token carry the loss."""
    prompt = tok.apply_chat_template(rec["messages"][:1], add_generation_prompt=True, tokenize=False)
    p_ids = tok(prompt, add_special_tokens=False)["input_ids"]
    a_ids = tok(rec["messages"][1]["content"] + "<|im_end|>", add_special_tokens=False)["input_ids"]
    ids = (p_ids + a_ids)[:max_len]
    labels = ([-100] * len(p_ids) + a_ids)[:max_len]
    return ids, labels


@torch.no_grad()
def perplexity(model, data: list[tuple[list[int], list[int]]]) -> float:
    was_training = model.training
    model.eval()
    nll, n = 0.0, 0
    for ids, labels in data:
        x = torch.tensor([ids], device="cuda")
        y = torch.tensor([labels], device="cuda")
        out = model(input_ids=x, labels=y)
        k = int((y[:, 1:] != -100).sum())
        nll += float(out.loss) * k
        n += k
    if was_training:
        model.train()
    return math.exp(nll / max(n, 1))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--run-id", default=time.strftime("%Y%m%d-%H%M%S"))
    ap.add_argument("--model-dir", default=str(ROOT / "models" / "qwen3vl-4b"))
    ap.add_argument("--epochs", type=int, default=4)
    ap.add_argument("--lr", type=float, default=2e-4)
    ap.add_argument("--rank", type=int, default=16)
    ap.add_argument("--accum", type=int, default=8)
    ap.add_argument("--max-len", type=int, default=1024)
    ap.add_argument("--seed", type=int, default=0)
    a = ap.parse_args()

    random.seed(a.seed)
    torch.manual_seed(a.seed)
    voice_dir = ROOT / "runs" / a.voice
    run = voice_dir / "runs" / a.run_id
    run.mkdir(parents=True, exist_ok=True)
    data_dir = ROOT / "data" / "train" / a.voice
    log = open(run / "train_log.jsonl", "w")

    tok = AutoTokenizer.from_pretrained(a.model_dir)
    model = AutoModelForImageTextToText.from_pretrained(a.model_dir, dtype=torch.bfloat16, device_map="cuda")
    model.config.use_cache = False

    train = [encode(tok, json.loads(l), a.max_len) for l in open(data_dir / "train.jsonl")]
    held = [encode(tok, json.loads(l), a.max_len) for l in open(data_dir / "eval.jsonl")]

    steps_per_epoch = max(1, math.ceil(len(train) / a.accum))
    epochs = a.epochs
    if steps_per_epoch * epochs < MIN_STEPS:  # a small corpus still gets enough optimizer steps
        epochs = min(MAX_EPOCHS, math.ceil(MIN_STEPS / steps_per_epoch))
    total = steps_per_epoch * epochs
    warm = max(1, total // 20)
    info = {"id": a.run_id, "created": time.time(), "epochs": epochs, "epochs_requested": a.epochs,
            "rank": a.rank, "lr": a.lr, "accum": a.accum, "train_pairs": len(train), "eval_passages": len(held),
            "total_steps": total}
    (run / "info.json").write_text(json.dumps(info, indent=1))

    t0 = time.time()
    ppl_base = perplexity(model, held)
    print("held-out perplexity, base: %.3f (%.0fs)" % (ppl_base, time.time() - t0), flush=True)

    model = get_peft_model(model, LoraConfig(
        r=a.rank, lora_alpha=2 * a.rank, lora_dropout=0.05, target_modules=TARGETS, task_type="CAUSAL_LM"))
    model.print_trainable_parameters()
    model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={"use_reentrant": False})
    model.enable_input_require_grads()

    params = [p for p in model.parameters() if p.requires_grad]
    opt = torch.optim.AdamW(params, lr=a.lr, weight_decay=0.0, betas=(0.9, 0.99))

    def lr_at(s: int) -> float:
        if s < warm:
            return a.lr * (s + 1) / warm
        return a.lr * 0.5 * (1 + math.cos(math.pi * (s - warm) / max(1, total - warm)))

    def state(extra: dict) -> None:
        (run / "train_state.json").write_text(json.dumps({"step": step, "total_steps": total, "epochs": epochs,
                                                           "ppl_by_epoch": ppl_by_epoch, "best_epoch": best_epoch,
                                                           **extra}))

    order: list[int] = []
    step, micro, run_loss, run_n = 0, 0, 0.0, 0
    ppl_by_epoch: list[float] = []
    best_ppl, best_epoch = ppl_base, 0
    t0 = time.time()
    model.train()
    while step < total:
        if not order:
            order = list(range(len(train)))
            random.shuffle(order)
        ids, labels = train[order.pop()]
        out = model(input_ids=torch.tensor([ids], device="cuda"), labels=torch.tensor([labels], device="cuda"))
        (out.loss / a.accum).backward()
        run_loss += out.loss.detach().item()
        run_n += 1
        micro += 1
        if micro % a.accum:
            continue
        for g in opt.param_groups:
            g["lr"] = lr_at(step)
        torch.nn.utils.clip_grad_norm_(params, 1.0)
        opt.step()
        opt.zero_grad(set_to_none=True)
        step += 1
        rec = {"step": step, "loss": round(run_loss / run_n, 4), "lr": lr_at(step - 1),
               "epoch": round(step / steps_per_epoch, 3), "seconds": round(time.time() - t0, 1)}
        log.write(json.dumps(rec) + "\n")
        log.flush()
        state(rec)
        print("step %d/%d loss %.4f" % (step, total, rec["loss"]), flush=True)
        run_loss, run_n = 0.0, 0

        if step % steps_per_epoch == 0 or step == total:
            epoch = math.ceil(step / steps_per_epoch)
            ppl = perplexity(model, held)
            ppl_by_epoch.append(round(ppl, 3))
            log.write(json.dumps({"epoch_end": epoch, "ppl": round(ppl, 3), "step": step}) + "\n")
            log.flush()
            if ppl < best_ppl:
                best_ppl, best_epoch = ppl, epoch
                model.save_pretrained(run / "adapter")
                print("epoch %d: held-out perplexity %.3f, best so far, adapter saved" % (epoch, ppl), flush=True)
            else:
                print("epoch %d: held-out perplexity %.3f, not better than %.3f" % (epoch, ppl, best_ppl), flush=True)
            state(rec)

    if best_epoch == 0:  # never beat the base model: keep the last epoch so the run has an adapter
        model.save_pretrained(run / "adapter")
        best_ppl = ppl_by_epoch[-1]
    metrics = {"ppl_base": round(ppl_base, 3), "ppl_tuned": round(best_ppl, 3), "ppl_by_epoch": ppl_by_epoch,
               "best_epoch": best_epoch, "eval_passages": len(held), "train_pairs": len(train), "steps": total,
               "epochs": epochs, "train_seconds": round(time.time() - t0, 1), "rank": a.rank, "lr": a.lr}
    (run / "metrics.json").write_text(json.dumps(metrics, indent=1))
    (voice_dir / "active.json").write_text(json.dumps({"run": a.run_id}))
    print(json.dumps(metrics), flush=True)


if __name__ == "__main__":
    main()
