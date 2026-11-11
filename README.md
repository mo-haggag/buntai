# ownvoice

Point it at someone's blog. It reads every essay, builds a training set from them, fine-tunes a small open model on your own GPU, and tells you how close the result writes to the author. The model and the data never leave the machine.

Built in one evening at c0mpiled-18 (YC Startup School hackathon, Taipei) against two Winter 2027 Requests for Startups:

- **LLMs That Write Well** (Jared Friedman): frontier models write in one flat house voice. ownvoice gives you a model that writes in a specific person's voice.
- **Own Your Intelligence** (Jon Xu): turn expertise into training data and own the model. The voice lives in a 33M-parameter adapter on your disk, on top of a 4B open-weights model that runs on a laptop.

Demo voice: Garry Tan, from the 388 posts on [blog.garrytan.com](https://blog.garrytan.com).

## Results

Garry Tan voice, trained on this laptop (RTX 5090 Laptop GPU, 24 GB) in 3 minutes 16 seconds:

| | Base Qwen3-VL-4B | GPT-5.5 asked to imitate him | ownvoice (tuned 4B) |
|---|---|---|---|
| Blind judge picks the closest voice to his real passage (20 held-out requests, each judged twice) | 0 of 40 | 13 of 40 | **27 of 40** |
| Perplexity of his real held-out passages (lower = closer) | 19.15 | n/a | **10.79** (44% lower) |

- Corpus: 388 posts, 161,000 words. 16 interview and podcast posts dropped. 381 training pairs, 33 held-out pairs from posts the model never saw.
- Adapter: 33M parameters (0.74% of the model), LoRA rank 16, 2 epochs, 96 steps.
- GPT-5.5 sometimes opened with a disclaimer that it can't write in his exact style. With a rented model, the provider decides what it will imitate.

## How it works

| Step | What happens | Code |
|---|---|---|
| Collect | Crawls the blog's index pages, extracts each post's text, drops pages under 80 words. | `pipeline/collect.py` |
| Build | Drops interviews and podcast transcripts (other people's words). Splits each post into passages of 120 to 380 words at paragraph breaks. An LLM writes the request a person would give to get a passage with that content: topic, points, examples, length, never wording or style. | `pipeline/build.py` |
| Train | LoRA (rank 16, all attention and MLP projections) on Qwen3-VL-4B in bf16. The loss covers only the author's words, never the request. | `pipeline/train.py` |
| Evaluate | Perplexity of the author's real held-out passages before and after training. Then a blind test on held-out requests: base model, tuned model and GPT-5.5 asked to imitate the author each write a passage, and a judge picks the one whose voice is closest to the author's real passage. | `pipeline/evaluate.py` |
| Serve | Local API: start a voice from a URL, watch each step, stream base and tuned outputs side by side. | `pipeline/serve.py`, `web/` |

Choices that keep the numbers honest:

- **Held-out by post.** Train and eval are split by a hash of the post URL, so no evaluated passage shares a post with a training passage.
- **The model learns phrasing only from the author.** The LLM-written requests describe content, so everything stylistic in the targets is the author's.
- **The judge is biased against us.** The judge (gpt-5.4) is from the same family as the GPT-5.5 competitor, and models tend to prefer their own family's writing. Each sample is judged twice with the candidates in different orders.

## Run it

Needs an NVIDIA GPU with 16 GB or more, the Qwen3-VL-4B weights in `models/qwen3vl-4b/`, and `OPENAI_API_KEY` (used to write the training requests and for the GPT-5.5 comparison). Everything installs inside the project; `env.sh` keeps every cache in `.cache/`.

```bash
source env.sh
python pipeline/serve.py              # API on :8765
cd web && npm install && npm run dev  # UI on :5175
```

Or step by step:

```bash
python pipeline/collect.py  --voice garry --source https://blog.garrytan.com
python pipeline/build.py    --voice garry
python pipeline/train.py    --voice garry
python pipeline/evaluate.py --voice garry --name "Garry Tan"
```

## What is not in this repo

The collected essays, the training pairs and the trained adapter. They are the author's writing and derived from it, so they stay on the machine that made them (`data/` and `runs/` are git-ignored).
