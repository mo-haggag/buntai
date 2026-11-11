"""Blind evaluation on held-out requests: base 4B vs tuned 4B vs GPT-5.5 imitating the author.

For each held-out request the three systems write a passage. A judge model (gpt-5.4 by
default; any gemini-* model also works) sees the author's real passage and the three candidates in shuffled order,
and picks the one whose voice is closest. Each sample is judged twice with different orders
to cancel position bias.

Usage: python pipeline/evaluate.py --voice garry --name "Garry Tan"
Writes runs/<voice>/samples.json and adds "judge" to runs/<voice>/metrics.json.
"""
from __future__ import annotations

import argparse
import json
import os
import random
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import torch
from peft import PeftModel
from transformers import AutoModelForImageTextToText, AutoTokenizer

ROOT = Path(__file__).resolve().parent.parent

JUDGE_PROMPT = """Below is a real passage written by an author, followed by {k} candidate passages written for the same request by other writers.

Which candidate's voice is closest to the author's? Judge the voice only: word choice, sentence length and rhythm, how ideas are framed and argued, tone and personality. Ignore which candidate has better content, more polish, or more accurate facts.

Author's real passage:
\"\"\"
{reference}
\"\"\"

{candidates}

Reply with the single letter of the closest candidate."""


def post_json(url: str, payload: dict, headers: dict, retries: int = 4) -> dict:
    data = json.dumps(payload).encode()
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", **headers})
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except Exception as e:
            if attempt == retries - 1:
                raise
            print("retry: %s" % e, file=sys.stderr)
            time.sleep(2 ** attempt)
    raise RuntimeError("unreachable")


def gpt(prompt: str, model: str = "gpt-5.5") -> str:
    r = post_json("https://api.openai.com/v1/chat/completions",
                  {"model": model, "messages": [{"role": "user", "content": prompt}], "reasoning_effort": "low"},
                  {"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"]})
    return r["choices"][0]["message"]["content"].strip()


def gemini(prompt: str, model: str) -> str:
    r = post_json("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s"
                  % (model, os.environ["GEMINI_API_KEY"]), {"contents": [{"parts": [{"text": prompt}]}]}, {})
    return "".join(p.get("text", "") for p in r["candidates"][0]["content"]["parts"]).strip()


def frontier_prompt(name: str, instruction: str) -> str:
    return ("Write a blog passage in the style of %s's essays: his word choice, rhythm and way of arguing. "
            "Plain text, no title, no preamble.\n\n%s" % (name, instruction))


def pick(items: list[dict], n: int) -> list[dict]:
    """At most two passages per post, spread across posts, in a fixed order."""
    per: dict[str, int] = {}
    out = []
    for it in sorted(items, key=lambda r: (r["url"], r["messages"][1]["content"][:40])):
        if per.get(it["url"], 0) < 2:
            per[it["url"]] = per.get(it["url"], 0) + 1
            out.append(it)
    random.Random(0).shuffle(out)
    return out[:n]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--name", required=True, help="author's name, for the GPT-5.5 imitation prompt")
    ap.add_argument("--n", type=int, default=20)
    ap.add_argument("--judge-model", default="gpt-5.4")
    ap.add_argument("--model-dir", default=str(ROOT / "models" / "qwen3vl-4b"))
    a = ap.parse_args()

    run = ROOT / "runs" / a.voice
    held = [json.loads(l) for l in open(ROOT / "data" / "train" / a.voice / "eval.jsonl")]
    samples = pick(held, a.n)

    # GPT-5.5 runs in threads while the GPU writes the local outputs.
    pool = ThreadPoolExecutor(8)
    frontier = [pool.submit(gpt, frontier_prompt(a.name, s["messages"][0]["content"])) for s in samples]

    tok = AutoTokenizer.from_pretrained(a.model_dir)
    base = AutoModelForImageTextToText.from_pretrained(a.model_dir, dtype=torch.bfloat16, device_map="cuda")
    model = PeftModel.from_pretrained(base, str(run / "adapter"))
    model.eval()

    def write(instruction: str, ref_words: int, tuned: bool, seed: int) -> str:
        ids = tok.apply_chat_template([{"role": "user", "content": instruction}], add_generation_prompt=True,
                                      return_tensors="pt", return_dict=True).to("cuda")
        torch.manual_seed(seed)
        kw = dict(max_new_tokens=min(800, int(ref_words * 2.0) + 80), do_sample=True, temperature=0.7,
                  top_p=0.9, repetition_penalty=1.05)
        if tuned:
            out = model.generate(**ids, **kw)
        else:
            with model.disable_adapter():
                out = model.generate(**ids, **kw)
        return tok.decode(out[0, ids["input_ids"].shape[1]:], skip_special_tokens=True).strip()

    rows = []
    for i, s in enumerate(samples):
        ins, ref = s["messages"][0]["content"], s["messages"][1]["content"]
        w = len(ref.split())
        rows.append({"instruction": ins, "reference": ref, "url": s["url"], "title": s["title"],
                     "base": write(ins, w, False, i), "tuned": write(ins, w, True, i)})
        print("generated %d/%d" % (i + 1, len(samples)), file=sys.stderr, flush=True)
    for r, f in zip(rows, frontier):
        try:
            r["frontier"] = f.result()
        except Exception as e:
            print("frontier failed: %s" % e, file=sys.stderr)
            r["frontier"] = ""
    del model, base
    torch.cuda.empty_cache()

    systems = ["base", "tuned", "frontier"]

    def judge(r: dict, order_seed: int) -> str | None:
        names = [s for s in systems if r.get(s)]
        random.Random(order_seed).shuffle(names)
        letters = "ABC"[: len(names)]
        cands = "\n\n".join('Candidate %s:\n"""\n%s\n"""' % (l, r[n]) for l, n in zip(letters, names))
        prompt = JUDGE_PROMPT.format(k=len(names), reference=r["reference"], candidates=cands)
        try:
            ans = gemini(prompt, a.judge_model) if a.judge_model.startswith("gemini") else gpt(prompt, a.judge_model)
        except Exception as e:
            print("judge failed: %s" % e, file=sys.stderr)
            return None
        m = re.search(r"\b([A-C])\b", ans)
        return names[letters.index(m.group(1))] if m and m.group(1) in letters else None

    jobs = [(i, k) for i in range(len(rows)) for k in range(2)]
    verdicts = list(pool.map(lambda ik: (ik[0], judge(rows[ik[0]], 1000 * ik[0] + ik[1])), jobs))
    wins = {s: 0 for s in systems}
    n = 0
    for i, v in verdicts:
        rows[i].setdefault("votes", []).append(v)
        if v:
            wins[v] += 1
            n += 1

    (run / "samples.json").write_text(json.dumps(rows, indent=1, ensure_ascii=False))
    judge_stats = {"tuned_wins": wins["tuned"], "base_wins": wins["base"], "frontier_wins": wins["frontier"],
                   "n": n, "judge_model": a.judge_model, "frontier_model": "gpt-5.5", "samples": len(rows)}
    old = json.loads((run / "metrics.json").read_text()) if (run / "metrics.json").exists() else {}
    (run / "metrics.json").write_text(json.dumps({**old, "judge": judge_stats}, indent=1))
    print(json.dumps(judge_stats))


if __name__ == "__main__":
    main()
