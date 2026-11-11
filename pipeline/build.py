"""Turn a corpus into instruction -> passage training pairs (instruction back-translation).

Each post is split into passages at paragraph boundaries. An LLM writes two requests a
user could give to get a passage with that content: a detailed one (topic, points,
examples, length) and a one-line one, as people type in a chat box. Never its wording.
Training uses both; evaluation uses the detailed one. The model is then trained to answer the request with the author's
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
import random
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

INSTRUCTION_PROMPT = """You are building a writing dataset. Below is a passage from a blog post titled "{title}".

Write two requests a person could give a writer to get a passage with the same content:
- "long": say what to cover: the topic, the points made, any story, example or advice in it, and the length (about {words} words). One to three sentences in the imperative.
- "short": the way someone would casually type it into a chat box, 6 to 20 words, naming only the topic or angle (for example "Write a short post on why founders should talk to users every week").
In both: do not describe the style or tone, do not name the author, and do not reuse distinctive phrases from the passage.

Passage:
\"\"\"
{passage}
\"\"\"

Reply with JSON only: {{"long": "...", "short": "..."}}"""

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


def clean(text: str) -> str:
    """Residue a crawl can leave in a passage: HTML comment markers and stray tokens."""
    return re.sub(r"[ \t]*(<!--|-->)[ \t]*", " ", text).replace("  ", " ").strip()


def dedupe(posts: list[dict]) -> list[dict]:
    """One copy per post: the same page linked as http and https, or the same text under two URLs."""
    seen: set[str] = set()
    out = []
    for p in posts:
        key_url = re.sub(r"^https?://", "", p["url"]).rstrip("/")
        key_text = hashlib.sha1(p["text"][:2000].encode()).hexdigest()
        if key_url in seen or key_text in seen:
            continue
        seen.update((key_url, key_text))
        out.append(p)
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
    ap.add_argument("--max-passages", type=int, default=600,
                    help="a large corpus is sampled down to this many passages so a run stays minutes long")
    a = ap.parse_args()

    run = ROOT / "runs" / a.voice
    run.mkdir(parents=True, exist_ok=True)
    posts = dedupe([json.loads(l) for l in open(ROOT / "data" / "corpus" / a.voice / "posts.jsonl")])
    excluded_file = run / "excluded.json"
    excluded = set(json.loads(excluded_file.read_text())) if excluded_file.exists() else set()
    dropped = [{"title": p["title"], "url": p["url"], "words": len(p["text"].split()),
                "why": "excluded by you" if p["url"] in excluded else "interview or transcript"}
               for p in posts if p["url"] in excluded or is_transcript(p)]
    kept = [p for p in posts if p["url"] not in excluded and not is_transcript(p)]
    items = []
    for p in kept:
        split = "eval" if in_eval(p["url"], a.eval_frac) else "train"
        for i, psg in enumerate(passages(clean(p["text"]))):
            if "\ufffd" in psg:  # undecodable characters from the crawl: not the author's text
                continue
            items.append({"split": split, "url": p["url"], "title": p["title"], "i": i, "passage": psg})
    total_passages = len(items)
    if a.max_passages and len(items) > a.max_passages:
        random.Random(0).shuffle(items)
        items = items[: a.max_passages]
    print("posts %d, kept %d (dropped %d), passages %d of %d" % (
        len(posts), len(kept), len(dropped), len(items), total_passages), file=sys.stderr)

    done = [0]

    def one(it: dict) -> dict | None:
        try:
            raw = openai_chat(INSTRUCTION_PROMPT.format(
                title=it["title"], words=round(len(it["passage"].split()), -1), passage=it["passage"]), a.model)
            req = json.loads(raw[raw.find("{"): raw.rfind("}") + 1])
            it["instruction"], it["short"] = req["long"].strip(), req["short"].strip()
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
        if it["split"] == "train" and it.get("short"):
            # The same passage behind a one-line request, the way people type in a chat box.
            short = {**rec, "messages": [{"role": "user", "content": it["short"]}, rec["messages"][1]]}
            files["train"].write(json.dumps(short, ensure_ascii=False) + "\n")
            counts["train"] += 1
    for f in files.values():
        f.close()

    stats = {
        "voice": a.voice, "posts": len(posts), "posts_kept": len(kept),
        "kept_posts": [{"title": p["title"], "url": p["url"], "words": len(p["text"].split())} for p in kept],
        "dropped_posts": dropped,
        "passages": len(built), "passages_total": total_passages, "train": counts["train"], "eval": counts["eval"],
        "train_words": sum(len(it["passage"].split()) for it in built if it["split"] == "train"),
        "instruction_model": a.model,
    }
    (run / "build.json").write_text(json.dumps(stats, indent=1))
    print(json.dumps(stats))


if __name__ == "__main__":
    main()
