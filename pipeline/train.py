"""LoRA fine-tune of the local Qwen3-VL-4B on instruction -> passage pairs.

Loss is taken on the passage tokens only (the author's words), never on the request.
Before and after training, the script measures perplexity on the held-out passages:
how predictable the author's real, unseen writing is to the model. Lower = closer.

Usage: python pipeline/train.py --voice garry
Writes runs/<voice>/adapter/, train_log.jsonl (one line per step), train_state.json, metrics.json.
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
    model.eval()
    nll, n = 0.0, 0
    for ids, labels in data:
        x = torch.tensor([ids], device="cuda")
        y = torch.tensor([labels], device="cuda")
        out = model(input_ids=x, labels=y)
        k = int((y[:, 1:] != -100).sum())
        nll += float(out.loss) * k
        n += k
    return math.exp(nll / max(n, 1))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--model-dir", default=str(ROOT / "models" / "qwen3vl-4b"))
    ap.add_argument("--epochs", type=float, default=2.0)
    ap.add_argument("--lr", type=float, default=2e-4)
    ap.add_argument("--rank", type=int, default=16)
    ap.add_argument("--accum", type=int, default=8)
    ap.add_argument("--max-len", type=int, default=1024)
    ap.add_argument("--seed", type=int, default=0)
    a = ap.parse_args()

    random.seed(a.seed)
    torch.manual_seed(a.seed)
    run = ROOT / "runs" / a.voice
    run.mkdir(parents=True, exist_ok=True)
    data_dir = ROOT / "data" / "train" / a.voice
    log = open(run / "train_log.jsonl", "w")

    tok = AutoTokenizer.from_pretrained(a.model_dir)
    model = AutoModelForImageTextToText.from_pretrained(a.model_dir, dtype=torch.bfloat16, device_map="cuda")
    model.config.use_cache = False

    train = [encode(tok, json.loads(l), a.max_len) for l in open(data_dir / "train.jsonl")]
    held = [encode(tok, json.loads(l), a.max_len) for l in open(data_dir / "eval.jsonl")]

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
    total = max(1, math.ceil(len(train) * a.epochs / a.accum))
    warm = max(1, total // 20)

    def lr_at(s: int) -> float:
        if s < warm:
            return a.lr * (s + 1) / warm
        return a.lr * 0.5 * (1 + math.cos(math.pi * (s - warm) / max(1, total - warm)))

    order: list[int] = []
    step, micro, run_loss, run_n = 0, 0, 0.0, 0
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
               "epoch": round(micro / len(train), 3), "seconds": round(time.time() - t0, 1)}
        log.write(json.dumps(rec) + "\n")
        log.flush()
        (run / "train_state.json").write_text(json.dumps({"step": step, "total_steps": total, **rec}))
        print("step %d/%d loss %.4f" % (step, total, rec["loss"]), flush=True)
        run_loss, run_n = 0.0, 0

    model.save_pretrained(run / "adapter")
    t1 = time.time()
    ppl_tuned = perplexity(model, held)
    metrics = {"ppl_base": round(ppl_base, 3), "ppl_tuned": round(ppl_tuned, 3),
               "eval_passages": len(held), "train_pairs": len(train), "steps": total,
               "train_seconds": round(t1 - t0, 1), "rank": a.rank, "epochs": a.epochs, "lr": a.lr}
    old = json.loads((run / "metrics.json").read_text()) if (run / "metrics.json").exists() else {}
    (run / "metrics.json").write_text(json.dumps({**old, **metrics}, indent=1))
    print(json.dumps(metrics), flush=True)


if __name__ == "__main__":
    main()
