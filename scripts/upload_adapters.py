"""Publish the trained adapters to the Hugging Face Hub, one public model repo per style, with a model card.

Usage (needs a write token in HF_TOKEN or HUGGINGFACE_API_KEY):
  source env.sh && .venv/bin/python scripts/upload_adapters.py [--user mo-haggag] [--style garry ...]

For each style it uploads the active run's adapter (or the run named in RUNS below), plus metrics.json and info.json.
"""
from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path

from huggingface_hub import HfApi

ROOT = Path(__file__).resolve().parent.parent
STYLES = {
    "garry": ("Garry Tan", "buntai-garry-tan", "https://blog.garrytan.com"),
    "sam": ("Sam Altman", "buntai-sam-altman", "https://blog.samaltman.com"),
    "pg": ("Paul Graham", "buntai-paul-graham", "https://paulgraham.com"),
}
RUNS = {"garry": "20261111-1935"}  # the run the README reports, where it is not the active one


def card(name: str, repo: str, src: str, user: str, m: dict) -> str:
    j = m.get("judge") or {}
    return f"""---
license: apache-2.0
base_model: Qwen/Qwen3-VL-4B-Instruct
library_name: peft
tags: [lora, writing-style, buntai]
---
# Buntai style adapter: {name}

A LoRA adapter (rank 16, 33M parameters) for Qwen/Qwen3-VL-4B-Instruct that writes in the style of {name}, trained from the public posts at {src} by [Buntai](https://github.com/{user}/buntai) at the c0mpiled-18 hackathon (YC Startup School, Taipei, 2026-11-11).

Held-out perplexity {m.get("ppl_base")} (base) to {m.get("ppl_tuned")} (adapter). Blind judge (gpt-5.4), adapter vs GPT-5.5 imitating the author vs the base model: {j.get("tuned_wins")} / {j.get("frontier_wins")} / {j.get("base_wins")} of {j.get("n")}.

It learns how the author writes, not what is true. Load with `PeftModel.from_pretrained(base, "{user}/{repo}")`. Shared as a research artifact; taken down on the author's request.
"""


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--user", default="mo-haggag")
    ap.add_argument("--style", nargs="*", default=list(STYLES))
    a = ap.parse_args()
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_API_KEY")
    api = HfApi(token=token)
    for vid in a.style:
        name, repo, src = STYLES[vid]
        rid = RUNS.get(vid) or json.loads((ROOT / "runs" / vid / "active.json").read_text())["run"]
        run = ROOT / "runs" / vid / "runs" / rid
        m = json.loads((run / "metrics.json").read_text())
        (run / "adapter" / "README.md").write_text(card(name, repo, src, a.user, m))
        t0 = time.time()
        api.create_repo(repo_id=f"{a.user}/{repo}", repo_type="model", exist_ok=True)
        api.upload_folder(repo_id=f"{a.user}/{repo}", folder_path=str(run / "adapter"), path_in_repo=".", commit_message="Buntai adapter")
        for f in ("metrics.json", "info.json"):
            api.upload_file(repo_id=f"{a.user}/{repo}", path_or_fileobj=str(run / f), path_in_repo=f)
        print("%s: https://huggingface.co/%s/%s (%.0fs)" % (name, a.user, repo, time.time() - t0), flush=True)


if __name__ == "__main__":
    main()
