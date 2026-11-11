# Buntai (文体, "writing style")

Point it at someone's writing: a blog URL, a folder of files, or pasted text. It collects the essays, builds a training set from them, fine-tunes a small open model on your own GPU, and tells you how close the result writes to the author. Every style is a 33M-parameter adapter on the same 4B model. The model, the data and the adapters never leave the machine.

Built in one evening at c0mpiled-18 (YC Startup School hackathon, Taipei) against two Winter 2027 Requests for Startups:

- **LLMs That Write Well** (Jared Friedman): frontier models write in one flat house voice. Buntai gives you a model that writes like a specific person.
- **Own Your Intelligence** (Jon Xu): turn expertise into training data and own the model. The style lives in an adapter on your disk, on top of open weights that run on a laptop.

Demo styles: Garry Tan ([blog.garrytan.com](https://blog.garrytan.com)), Sam Altman ([blog.samaltman.com](https://blog.samaltman.com)) and Paul Graham ([paulgraham.com](https://paulgraham.com)). Same base model, three adapters, three voices.

## Results

Trained on one laptop (RTX 5090 Laptop GPU, 24 GB). "Judge" is a blind test: for 20 held-out requests, the base model, the tuned model and GPT-5.5 (asked to imitate the author) each write a passage, and gpt-5.4 picks the one whose voice is closest to the author's real passage. Each request is judged twice with the candidates in different orders. Perplexity is measured on the author's real held-out passages, from posts the model never saw; lower means the writing is more predictable to the model.

RESULTS_TABLE

What keeps the numbers honest:

- **Held-out by post.** Train and eval are split by a hash of the post URL, so no evaluated passage shares a post with a training passage.
- **The model learns phrasing only from the author.** An LLM writes the requests (what to cover, how long), so everything stylistic in the targets is the author's. Interviews, transcripts and show notes are cut out first.
- **The judge is biased against us.** gpt-5.4 is from the same family as the GPT-5.5 competitor, and models tend to prefer their own family's writing.
- **The best epoch is kept.** Held-out perplexity is measured after every epoch and the adapter from the best one is saved, so more epochs cannot make the result worse.
- **It learns how someone writes, not what is true.** A 4B model invents facts and anecdotes in the author's voice.

## The app

Two modes, because there are two jobs: writing with a style, and making one.

**Use**

- **Write.** Pick a style, say what to write (and paste notes or a draft to work from), choose a length. The draft streams in and renders as markdown. Edit it in place, copy it, write it again. Recent drafts are kept. No comparisons, no numbers: a writing tool.

**Train**

- **Styles.** One page per style with four tabs. *Overview*: the pipeline and the headline numbers. *Data*: the posts used and dropped, the passages with their generated requests, an Exclude button per post, then "Rebuild and retrain". *Training*: every run with its loss curve, the held-out perplexity after each epoch, and "Use this run" to switch adapters. *Evaluation*: perplexity, the judge result, a blind test you take yourself, and every judged sample with all three outputs.
- **New style.** A name and the writing: a blog URL (Posthaven, Substack, WordPress, Ghost, or any site with a sitemap or feed), uploaded .txt/.md/.docx files, or pasted text. Everything else runs on its own.
- **Benchmark.** One prompt written by the base model, one or two styles, and GPT-5.5 imitating the author, side by side as they stream.
- **Machine.** The GPU and its memory, free disk, which base models are on disk and which is active, what training and serving each needs, and a download button for the ones that fit this GPU.

`web/DESIGN.md` describes the tokens and primitives the screens are built from.

## How it works

| Step | What happens | Code |
|---|---|---|
| Collect | Crawls the blog's index pages, sitemap or feed, extracts each post's text, or reads uploaded files. | `pipeline/collect.py` |
| Build | Drops interviews and transcripts, cuts show notes, de-duplicates. Splits each post into passages of 120 to 380 words at paragraph breaks. An LLM writes two requests per passage: a detailed one and a one-line one, content only, never style. Large corpora are sampled down to 600 passages. | `pipeline/build.py` |
| Train | LoRA (rank 16, all attention and MLP projections) on Qwen3-VL-4B in bf16, loss on the author's words only, up to 4 epochs with the best epoch kept. Small corpora get more epochs so every run has at least 160 steps. | `pipeline/train.py` |
| Evaluate | Perplexity before and after, then the blind judge test against GPT-5.5. | `pipeline/evaluate.py` |
| Serve | Local API: styles, runs, data, exclusions, the pipeline runner (one GPU job at a time), and streaming generation. | `pipeline/serve.py`, `web/` |

## Run it

Needs an NVIDIA GPU with 16 GB or more, the Qwen3-VL-4B weights in `models/qwen3vl-4b/`, and `OPENAI_API_KEY` (it writes the training requests, and GPT-5.5 is the comparison). Everything installs inside the project; `env.sh` keeps every cache in `.cache/`.

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

The collected essays, the training pairs and the trained adapters. They are the authors' writing and derived from it, so they stay on the machine that made them (`data/` and `runs/` are git-ignored).
