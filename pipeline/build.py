"""Turn a corpus into instruction -> passage training pairs (instruction back-translation).

Each post is split into passages at paragraph boundaries. An LLM writes the request a
user would give to get a passage with that content (topic, points, examples, length),
never its wording. The model is then trained to answer the request with the author's
real passage, so everything it learns about phrasing comes from the author.

Posts are split into train and eval by a hash of their URL, so no eval passage shares
a post with a training passage.

Usage: python pipeline/build.py --voice garry
Writes data/train/<voice>/{train,eval}.jsonl and runs/<voice>/build.json (stats).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

INSTRUCTION_PROMPT = """You are building a writing dataset. Below is a passage from a blog post titled "{title}".

Write the request a person would give a writer to get a passage with the same content. Say what to cover: the topic, the points made, any story, example or advice in it, and the length (about {words} words). Do not describe the style or tone, do not name the author, and do not reuse distinctive phrases from the passage. Write one to three sentences in the imperative, as the person would type it.

Passage:
\"\"\"
{passage}
\"\"\"

Reply with the request only."""

TRANSCRIPT_TITLE = re.compile(r"(?i)\b(conversation with|interview|podcast|episode|transcript|q&a|ama)\b")
SPEAKER_LINE = re.compile(r"^[A-Z][A-Za-z .'-]{1,30}:\s")


def is_transcript(post: dict) -> bool:
    """Interviews and podcast notes carry other people's words: keep them out of a voice."""
    if TRANSCRIPT_TITLE.search(post["title"]):
        return True
    paras = post["text"].split("\n\n")
    return sum(bool(SPEAKER_LINE.match(p)) for p in paras) >= max(3, len(paras) // 6)


def passages(text: str, lo: int = 120, hi: int = 380) -> list[str]:
    """Group whole paragraphs into passages of lo..hi words; paragraphs are never split."""
    out, cur, n = [], [], 0
    for p in text.split("\n\n"):
        w = len(p.split())
        if cur and n + w > hi:
            if n >= lo:
                out.append("\n\n".join(cur))
            cur, n = [], 0
        cur.append(p)
        n += w
    if n >= lo:
        out.append("\n\n".join(cur))
    return out


def in_eval(url: str, frac: float) -> bool:
    return int(hashlib.sha1(url.encode()).hexdigest(), 16) % 1000 < frac * 1000


def openai_chat(prompt: str, model: str, retries: int = 4) -> str:
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "reasoning_effort": "low",
    }).encode()
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions", data=body,
                headers={"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"], "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)["choices"][0]["message"]["content"].strip()
        except Exception as e:
            if attempt == retries - 1:
                raise
            print("retry after: %s" % e, file=sys.stderr)
            time.sleep(2 ** attempt)
    raise RuntimeError("unreachable")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--model", default="gpt-5.4-mini")
    ap.add_argument("--eval-frac", type=float, default=0.08)
    ap.add_argument("--workers", type=int, default=24)
    ap.add_argument("--limit", type=int, default=0, help="cap on passages, 0 = all")
    a = ap.parse_args()

    posts = [json.loads(l) for l in open(ROOT / "data" / "corpus" / a.voice / "posts.jsonl")]
    kept = [p for p in posts if not is_transcript(p)]
    items = []
    for p in kept:
        split = "eval" if in_eval(p["url"], a.eval_frac) else "train"
        for i, psg in enumerate(passages(p["text"])):
            items.append({"split": split, "url": p["url"], "title": p["title"], "i": i, "passage": psg})
    if a.limit:
        items = items[: a.limit]
    print("posts %d, kept %d (dropped %d transcripts), passages %d" % (
        len(posts), len(kept), len(posts) - len(kept), len(items)), file=sys.stderr)

    done = [0]

    def one(it: dict) -> dict | None:
        try:
            it["instruction"] = openai_chat(INSTRUCTION_PROMPT.format(
                title=it["title"], words=round(len(it["passage"].split()), -1), passage=it["passage"]), a.model)
        except Exception as e:
            print("skip passage: %s" % e, file=sys.stderr)
            return None
        done[0] += 1
        if done[0] % 25 == 0:
            print("instructions %d/%d" % (done[0], len(items)), file=sys.stderr)
        return it

    with ThreadPoolExecutor(a.workers) as ex:
        built = [it for it in ex.map(one, items) if it]

    out = ROOT / "data" / "train" / a.voice
    out.mkdir(parents=True, exist_ok=True)
    counts = {"train": 0, "eval": 0}
    files = {s: open(out / ("%s.jsonl" % s), "w") for s in counts}
    for it in built:
        rec = {
            "messages": [
                {"role": "user", "content": it["instruction"]},
                {"role": "assistant", "content": it["passage"]},
            ],
            "url": it["url"], "title": it["title"],
        }
        files[it["split"]].write(json.dumps(rec, ensure_ascii=False) + "\n")
        counts[it["split"]] += 1
    for f in files.values():
        f.close()

    stats = {
        "voice": a.voice, "posts": len(posts), "posts_kept": len(kept),
        "passages": len(built), "train": counts["train"], "eval": counts["eval"],
        "train_words": sum(len(it["passage"].split()) for it in built if it["split"] == "train"),
        "instruction_model": a.model,
    }
    run = ROOT / "runs" / a.voice
    run.mkdir(parents=True, exist_ok=True)
    (run / "build.json").write_text(json.dumps(stats, indent=1))
    print(json.dumps(stats))


if __name__ == "__main__":
    main()
