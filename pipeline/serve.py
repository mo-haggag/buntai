"""Local API: voices (styles), the pipeline runner, runs, and streaming generation on the local GPU.

Usage: python pipeline/serve.py   (http://127.0.0.1:8765, serves web/dist if built)

Layout on disk, per voice, under runs/<voice>/:
  stage.json, collect.json, build.json, pipeline.log      the voice and its data
  active.json {"run": id}                                 which training run is in use
  runs/<id>/ adapter/, info.json, train_log.jsonl, train_state.json, metrics.json, samples.json

One model sits on the GPU and serves one generation at a time; LoRA adapters are loaded per
voice on top of it ("base" runs with the adapter switched off). Training and evaluation jobs
queue on one lock, and while one runs the server frees the GPU and refuses local generation.
"""
from __future__ import annotations

import asyncio
import contextlib
import gc
import json
import os
import re
import sys
import threading
import time
from pathlib import Path

from aiohttp import ClientSession, ClientTimeout, web

ROOT = Path(__file__).resolve().parent.parent
RUNS = ROOT / "runs"
DATA = ROOT / "data"
MODEL_DIR = ROOT / "models" / "qwen3vl-4b"
VOICES_FILE = RUNS / "voices.json"
PY = sys.executable
PORT = int(os.environ.get("OWNVOICE_PORT", "8765"))
UPLOAD_TYPES = (".txt", ".md", ".markdown", ".docx")

progress: dict[str, dict] = {}       # live progress per voice, in memory only
stage_started: dict[str, float] = {}  # voice -> when its current stage began
JOBS_LOG = RUNS / "jobs.jsonl"


def log_job(**rec) -> None:
    RUNS.mkdir(parents=True, exist_ok=True)
    with open(JOBS_LOG, "a") as f:
        f.write(json.dumps({"at": time.time(), **rec}) + "\n")
running: set[str] = set()
tasks: dict[str, asyncio.Task] = {}  # voice -> the pipeline task, so a job can be cancelled
training_run: dict[str, str] = {}    # voice -> run id while a run is in progress
jobs = asyncio.Lock()                # one GPU job (train or eval) at a time


# ---------- voices and their files ----------

def load_voices() -> dict[str, dict]:
    return json.loads(VOICES_FILE.read_text()) if VOICES_FILE.exists() else {}


def save_voices(v: dict[str, dict]) -> None:
    RUNS.mkdir(parents=True, exist_ok=True)
    VOICES_FILE.write_text(json.dumps(v, indent=1))


def read_json(p: Path, default=None):
    try:
        return json.loads(p.read_text())
    except Exception:
        return default


def set_stage(vid: str, stage: str, error: str | None = None) -> None:
    d = RUNS / vid
    d.mkdir(parents=True, exist_ok=True)
    (d / "stage.json").write_text(json.dumps({"stage": stage, "error": error, "at": time.time()}))


def active_run(vid: str) -> str | None:
    return (read_json(RUNS / vid / "active.json", {}) or {}).get("run")


def run_dir(vid: str, rid: str) -> Path:
    return RUNS / vid / "runs" / rid


def adapter_path(vid: str) -> Path | None:
    rid = active_run(vid)
    if not rid:
        return None
    p = run_dir(vid, rid) / "adapter" / "adapter_model.safetensors"
    return p if p.exists() else None


def run_summary(vid: str, rid: str) -> dict:
    d = run_dir(vid, rid)
    info = read_json(d / "info.json", {}) or {}
    m = read_json(d / "metrics.json", {}) or {}
    return {
        "id": rid, "created": info.get("created"), "epochs": info.get("epochs"), "rank": info.get("rank"),
        "lr": info.get("lr"), "train_pairs": info.get("train_pairs"), "total_steps": info.get("total_steps"),
        "has_adapter": (d / "adapter" / "adapter_model.safetensors").exists(),
        "metrics": {k: m[k] for k in ("ppl_base", "ppl_tuned", "ppl_by_epoch", "best_epoch", "judge", "train_seconds") if k in m},
        "judged": (d / "samples.json").exists(),
    }


def list_runs(vid: str) -> list[dict]:
    d = RUNS / vid / "runs"
    if not d.exists():
        return []
    runs = [run_summary(vid, p.name) for p in d.iterdir() if p.is_dir()]
    return sorted(runs, key=lambda r: r["created"] or 0, reverse=True)


def train_view(vid: str, rid: str | None) -> dict:
    if not rid:
        return {"steps": [], "total_steps": 0}
    d = run_dir(vid, rid)
    steps, epochs = [], []
    if (d / "train_log.jsonl").exists():
        for line in (d / "train_log.jsonl").read_text().splitlines():
            with contextlib.suppress(Exception):
                r = json.loads(line)
                if "epoch_end" in r:
                    epochs.append({"epoch": r["epoch_end"], "ppl": r["ppl"], "step": r["step"]})
                else:
                    steps.append({"step": r["step"], "loss": r["loss"]})
    ts = read_json(d / "train_state.json", {}) or {}
    return {"run": rid, "steps": steps, "epoch_ends": epochs, "total_steps": ts.get("total_steps", 0),
            "epoch": ts.get("epoch"), "epochs": ts.get("epochs"), "seconds": ts.get("seconds"),
            "best_epoch": ts.get("best_epoch")}


def voice_view(vid: str, meta: dict) -> dict:
    d = RUNS / vid
    st = read_json(d / "stage.json", {}) or {}
    stage = st.get("stage")
    rid = training_run.get(vid) or active_run(vid)
    if not stage:
        stage = "ready" if adapter_path(vid) else "idle"
    stats = {**(read_json(d / "collect.json", {}) or {}), **(read_json(d / "build.json", {}) or {})}
    metrics = read_json(run_dir(vid, rid) / "metrics.json", {}) if rid else {}
    out = {
        "id": vid, "name": meta.get("name", vid), "source": meta.get("source", ""),
        "source_kind": meta.get("source_kind", "url"), "stage": stage,
        "stats": {k: stats[k] for k in ("posts", "words", "posts_kept", "passages", "train", "eval", "train_words") if k in stats},
        "active_run": active_run(vid),
        "train": train_view(vid, rid),
        "metrics": {k: metrics[k] for k in ("ppl_base", "ppl_tuned", "ppl_by_epoch", "best_epoch", "judge", "train_seconds") if k in (metrics or {})},
        "runs": list_runs(vid),
    }
    if vid in progress:
        out["progress"] = progress[vid]
    if st.get("error"):
        out["error"] = st["error"]
    return out


# ---------- the GPU ----------

class Gpu:
    def __init__(self) -> None:
        self.model = None
        self.tok = None
        self.adapters: dict[str, tuple[str, float]] = {}   # voice -> (adapter file, mtime) as loaded
        self.lock = asyncio.Lock()
        self.busy: str | None = None   # voice whose job holds the GPU

    def load(self) -> None:
        if self.model is not None:
            return
        import torch
        from transformers import AutoModelForImageTextToText, AutoTokenizer
        self.tok = AutoTokenizer.from_pretrained(str(MODEL_DIR))
        self.model = AutoModelForImageTextToText.from_pretrained(str(MODEL_DIR), dtype=torch.bfloat16, device_map="cuda")
        self.model.eval()
        self.adapters = {}

    def use_adapter(self, vid: str) -> None:
        from peft import PeftModel
        file = adapter_path(vid)
        if not file:
            raise RuntimeError("No trained adapter for %s yet." % vid)
        key = (str(file), file.stat().st_mtime)
        if isinstance(self.model, PeftModel) and vid in self.adapters and self.adapters[vid] != key:
            self.model.delete_adapter(vid)
            del self.adapters[vid]
        if vid not in self.adapters:
            if isinstance(self.model, PeftModel):
                self.model.load_adapter(str(file.parent), adapter_name=vid)
            else:
                self.model = PeftModel.from_pretrained(self.model, str(file.parent), adapter_name=vid)
            self.adapters[vid] = key
        self.model.set_adapter(vid)

    def unload(self) -> None:
        import torch
        self.model = None
        self.tok = None
        self.adapters = {}
        gc.collect()
        torch.cuda.empty_cache()

    def generate(self, prompt: str, mode: str, vid: str, max_tokens: int, emit) -> dict:
        """Runs in a worker thread; emit(text) is called for every decoded piece."""
        import torch
        from peft import PeftModel
        from transformers import TextIteratorStreamer
        self.load()
        if mode == "tuned":
            self.use_adapter(vid)
        tok, model = self.tok, self.model
        ids = tok.apply_chat_template([{"role": "user", "content": prompt}], add_generation_prompt=True,
                                      return_tensors="pt", return_dict=True).to("cuda")
        streamer = TextIteratorStreamer(tok, skip_prompt=True, skip_special_tokens=True)
        kw = dict(**ids, max_new_tokens=max_tokens, do_sample=True, temperature=0.7, top_p=0.9,
                  repetition_penalty=1.05, streamer=streamer)
        result: dict = {}

        def run() -> None:
            ctx = model.disable_adapter() if (mode == "base" and isinstance(model, PeftModel)) else contextlib.nullcontext()
            with ctx, torch.inference_mode():
                out = model.generate(**kw)
            result["tokens"] = int(out.shape[1] - ids["input_ids"].shape[1])

        t0 = time.time()
        th = threading.Thread(target=run)
        th.start()
        for piece in streamer:
            if piece:
                emit(piece)
        th.join()
        n = result.get("tokens", 0)
        return {"tokens": n, "tps": round(n / max(time.time() - t0, 1e-6), 1)}


gpu = Gpu()


# ---------- pipeline ----------

PROGRESS_PATTERNS = [
    (re.compile(r"page (\d+): (\d+) posts so far"), lambda m: {"label": "Finding posts", "done": int(m.group(2)), "total": 0}),
    (re.compile(r"sitemap .*: (\d+) posts so far"), lambda m: {"label": "Finding posts", "done": int(m.group(1)), "total": 0}),
    (re.compile(r"instructions (\d+)/(\d+)"), lambda m: {"label": "Writing requests", "done": int(m.group(1)), "total": int(m.group(2))}),
    (re.compile(r"step (\d+)/(\d+)"), lambda m: {"label": "Training", "done": int(m.group(1)), "total": int(m.group(2))}),
    (re.compile(r"epoch (\d+): held-out perplexity ([\d.]+)"), lambda m: {"label": "Epoch %s checked" % m.group(1), "done": 0, "total": 0}),
    (re.compile(r"generated (\d+)/(\d+)"), lambda m: {"label": "Writing samples", "done": int(m.group(1)), "total": int(m.group(2))}),
    (re.compile(r"held-out perplexity, base"), lambda m: {"label": "Measuring base", "done": 0, "total": 0}),
]


def collect_cmd(vid: str, meta: dict) -> list[str]:
    """A blog URL, uploaded files, or both merged into one corpus."""
    cmd = [PY, "pipeline/collect.py", "--voice", vid]
    uploads = DATA / "corpus" / vid / "uploads"
    if uploads.exists() and any(p.suffix.lower() in UPLOAD_TYPES for p in uploads.iterdir()):
        cmd += ["--files", str(uploads)]
    if meta.get("source", "").startswith("http"):
        cmd += ["--source", meta["source"]]
    return cmd


async def run_pipeline(vid: str, skip: tuple[str, ...] = (), continue_from: str | None = None) -> None:
    meta = load_voices()[vid]
    rid = time.strftime("%Y%m%d-%H%M%S")
    train_cmd = [PY, "pipeline/train.py", "--voice", vid, "--run-id", rid]
    if continue_from:  # resume the current adapter: fewer epochs, a gentler learning rate
        train_cmd += ["--from-run", continue_from, "--epochs", "2", "--lr", "1e-4"]
    steps = [
        ("collect", collect_cmd(vid, meta)),
        ("build", [PY, "pipeline/build.py", "--voice", vid]),
        ("train", train_cmd),
        ("eval", [PY, "pipeline/evaluate.py", "--voice", vid, "--name", meta["name"]]),
    ]
    running.add(vid)
    (RUNS / vid).mkdir(parents=True, exist_ok=True)
    logf = open(RUNS / vid / "pipeline.log", "a")
    held_jobs = False
    proc = None
    stage = ""
    try:
        for stage, cmd in steps:
            if stage in skip:
                continue
            set_stage(vid, stage)
            stage_started[vid] = time.time()
            log_job(voice=vid, stage=stage, event="start", run=rid)
            progress[vid] = {"label": stage.capitalize(), "done": 0, "total": 0}
            if stage in ("train", "eval") and not held_jobs:
                progress[vid] = {"label": "Waiting for the GPU", "done": 0, "total": 0}
                await jobs.acquire()
                held_jobs = True
                async with gpu.lock:
                    gpu.unload()
                    gpu.busy = vid
            if stage == "train":
                training_run[vid] = rid
            proc = None
            proc = await asyncio.create_subprocess_exec(*cmd, cwd=str(ROOT), stdout=asyncio.subprocess.PIPE,
                                                        stderr=asyncio.subprocess.STDOUT, env=os.environ.copy(),
                                                        limit=4 * 1024 * 1024)  # a stats line can be long
            last = ""
            assert proc.stdout
            async for raw in proc.stdout:
                line = raw.decode(errors="replace").rstrip()
                logf.write("[%s] %s\n" % (stage, line))
                logf.flush()
                if line.startswith("{"):
                    last = line
                for pat, fn in PROGRESS_PATTERNS:
                    m = pat.search(line)
                    if m:
                        progress[vid] = fn(m)
            rc = await proc.wait()
            log_job(voice=vid, stage=stage, event="end", run=rid, ok=rc == 0,
                    seconds=round(time.time() - stage_started.get(vid, time.time()), 1), exit=rc)
            if rc != 0:
                set_stage(vid, "error", "%s failed (exit %d), see runs/%s/pipeline.log" % (stage, rc, vid))
                return
            if stage == "collect" and last:
                (RUNS / vid / "collect.json").write_text(last)
            if stage == "train":
                training_run.pop(vid, None)
        set_stage(vid, "ready")
    except asyncio.CancelledError:  # the user cancelled the job
        if proc is not None and proc.returncode is None:
            proc.terminate()
            with contextlib.suppress(Exception):
                await asyncio.wait_for(proc.wait(), 15)
        log_job(voice=vid, stage=stage, event="end", run=rid, ok=False, cancelled=True,
                seconds=round(time.time() - stage_started.get(vid, time.time()), 1))
        set_stage(vid, "ready" if adapter_path(vid) else "idle")
        logf.write("[runner] cancelled during %s\n" % stage)
    except Exception as e:  # the runner itself failed: say so instead of leaving the stage stuck
        set_stage(vid, "error", "runner failed: %s" % e)
        logf.write("[runner] %s\n" % e)
    finally:
        tasks.pop(vid, None)
        stage_started.pop(vid, None)
        training_run.pop(vid, None)
        if held_jobs:
            gpu.busy = None
            jobs.release()
        progress.pop(vid, None)
        running.discard(vid)
        logf.close()


# ---------- HTTP ----------

routes = web.RouteTableDef()


@routes.get("/api/voices")
async def list_voices(_req: web.Request) -> web.Response:
    return web.json_response([voice_view(k, m) for k, m in load_voices().items()])


@routes.get("/api/voices/{id}")
async def get_voice(req: web.Request) -> web.Response:
    v = load_voices()
    vid = req.match_info["id"]
    if vid not in v:
        raise web.HTTPNotFound()
    return web.json_response(voice_view(vid, v[vid]))


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:40] or "voice"


@routes.post("/api/voices")
async def create_voice(req: web.Request) -> web.Response:
    """JSON {name, source} for a blog URL, or multipart with name, optional source, optional text, and files."""
    name, source, text, files = "", "", "", []
    if req.content_type.startswith("multipart/"):
        reader = await req.multipart()
        async for part in reader:
            if part.name == "name":
                name = (await part.text()).strip()
            elif part.name == "source":
                source = (await part.text()).strip()
            elif part.name == "text":
                text = (await part.text()).strip()
            elif part.name == "files" and part.filename:
                files.append((Path(part.filename).name, await part.read(decode=False)))
    else:
        body = await req.json()
        name, source = body.get("name", "").strip(), body.get("source", "").strip()
    if not name:
        return web.json_response({"error": "a name is required"}, status=400)
    if not (source.startswith("http") or text or files):
        return web.json_response({"error": "give a blog URL, paste text, or upload .txt, .md or .docx files"}, status=400)
    vid = slug(name)
    if vid in running:
        return web.json_response({"error": "already running"}, status=409)
    uploads = DATA / "corpus" / vid / "uploads"
    if text or files:
        uploads.mkdir(parents=True, exist_ok=True)
        for fname, data in files:
            if Path(fname).suffix.lower() in UPLOAD_TYPES:
                (uploads / fname).write_bytes(data)
        if text:
            (uploads / "pasted.md").write_text(text)
    v = load_voices()
    v[vid] = {"name": name, "source": source or "uploaded files", "created": time.time(),
              "source_kind": "files" if (text or files) else "url"}
    save_voices(v)
    set_stage(vid, "collect")
    tasks[vid] = asyncio.get_event_loop().create_task(run_pipeline(vid))
    return web.json_response({"id": vid})


@routes.post("/api/voices/{id}/run")
async def rerun(req: web.Request) -> web.Response:
    """Run a voice's pipeline from a given step: {"from": "collect" | "build" | "train" | "eval"}."""
    vid = req.match_info["id"]
    if vid not in load_voices():
        raise web.HTTPNotFound()
    if vid in running:
        return web.json_response({"error": "already running"}, status=409)
    order = ["collect", "build", "train", "eval"]
    body = await req.json()
    start = body.get("from", "collect")
    if start not in order:
        return web.json_response({"error": "from must be one of %s" % order}, status=400)
    cont = active_run(vid) if body.get("continue") else None
    if body.get("continue") and not cont:
        return web.json_response({"error": "nothing to continue from"}, status=400)
    tasks[vid] = asyncio.get_event_loop().create_task(run_pipeline(vid, tuple(order[: order.index(start)]), cont))
    return web.json_response({"id": vid, "from": start, "continue_from": cont})


@routes.post("/api/jobs/{id}/cancel")
async def cancel_job(req: web.Request) -> web.Response:
    """Stop a style's running or queued job. A running step's process is terminated; the style keeps its last adapter."""
    vid = req.match_info["id"]
    task = tasks.get(vid)
    if not task or task.done():
        return web.json_response({"error": "no job running for %s" % vid}, status=404)
    task.cancel()
    return web.json_response({"cancelled": vid})


@routes.post("/api/voices/{id}/add")
async def add_writing(req: web.Request) -> web.Response:
    """More writing for an existing style (files, pasted text, or a new URL), then collect, build and train again."""
    vid = req.match_info["id"]
    v = load_voices()
    if vid not in v:
        raise web.HTTPNotFound()
    if vid in running:
        return web.json_response({"error": "already running"}, status=409)
    source, text, files = "", "", []
    reader = await req.multipart()
    async for part in reader:
        if part.name == "source":
            source = (await part.text()).strip()
        elif part.name == "text":
            text = (await part.text()).strip()
        elif part.name == "files" and part.filename:
            files.append((Path(part.filename).name, await part.read(decode=False)))
    if not (source.startswith("http") or text or files):
        return web.json_response({"error": "give a URL, paste text, or upload files"}, status=400)
    uploads = DATA / "corpus" / vid / "uploads"
    if text or files:
        uploads.mkdir(parents=True, exist_ok=True)
        for fname, data in files:
            if Path(fname).suffix.lower() in UPLOAD_TYPES:
                (uploads / fname).write_bytes(data)
        if text:
            (uploads / ("pasted-%s.md" % time.strftime("%Y%m%d-%H%M%S"))).write_text(text)
    if source.startswith("http"):
        v[vid]["source"] = source
        v[vid]["source_kind"] = "url"
        save_voices(v)
    set_stage(vid, "collect")
    tasks[vid] = asyncio.get_event_loop().create_task(run_pipeline(vid))
    return web.json_response({"id": vid})


@routes.get("/api/voices/{id}/data")
async def voice_data(req: web.Request) -> web.Response:
    vid = req.match_info["id"]
    b = read_json(RUNS / vid / "build.json", {}) or {}
    pairs: list[dict] = []
    f = DATA / "train" / vid / "train.jsonl"
    if f.exists():
        by_passage: dict[str, dict] = {}
        for line in f.read_text().splitlines():
            r = json.loads(line)
            passage = r["messages"][1]["content"]
            item = by_passage.setdefault(passage, {"title": r.get("title", ""), "url": r.get("url", ""),
                                                   "passage": passage, "requests": []})
            item["requests"].append(r["messages"][0]["content"])
            if len(by_passage) >= 12 and passage not in list(by_passage)[:12]:
                break
        pairs = list(by_passage.values())[:12]
    return web.json_response({
        "kept_posts": b.get("kept_posts", []), "dropped_posts": b.get("dropped_posts", []),
        "excluded": read_json(RUNS / vid / "excluded.json", []) or [],
        "passages": b.get("passages"), "passages_total": b.get("passages_total"), "train": b.get("train"),
        "eval": b.get("eval"), "train_words": b.get("train_words"), "pairs": pairs,
    })


@routes.post("/api/voices/{id}/exclude")
async def exclude_post(req: web.Request) -> web.Response:
    """{"url": ..., "excluded": true|false}: keep a post out of the next build (a reposted lecture, a quotes page)."""
    vid = req.match_info["id"]
    body = await req.json()
    f = RUNS / vid / "excluded.json"
    f.parent.mkdir(parents=True, exist_ok=True)
    current = set(read_json(f, []) or [])
    (current.add if body.get("excluded", True) else current.discard)(body.get("url", ""))
    f.write_text(json.dumps(sorted(current)))
    return web.json_response({"excluded": sorted(current)})


@routes.get("/api/voices/{id}/runs")
async def voice_runs(req: web.Request) -> web.Response:
    vid = req.match_info["id"]
    return web.json_response({"active": active_run(vid), "runs": list_runs(vid)})


@routes.post("/api/voices/{id}/runs/{rid}/activate")
async def activate_run(req: web.Request) -> web.Response:
    vid, rid = req.match_info["id"], req.match_info["rid"]
    if not (run_dir(vid, rid) / "adapter" / "adapter_model.safetensors").exists():
        return web.json_response({"error": "that run has no adapter"}, status=404)
    (RUNS / vid / "active.json").write_text(json.dumps({"run": rid}))
    return web.json_response({"active": rid})


@routes.get("/api/jobs")
async def list_jobs(_req: web.Request) -> web.Response:
    """What the machine is doing: the job that holds the GPU, the jobs waiting, and what finished recently."""
    names = {k: m.get("name", k) for k, m in load_voices().items()}
    active, queued = [], []
    for vid in sorted(running):
        st = read_json(RUNS / vid / "stage.json", {}) or {}
        item = {"voice": vid, "name": names.get(vid, vid), "stage": st.get("stage"), "progress": progress.get(vid),
                "since": stage_started.get(vid), "run": training_run.get(vid)}
        (queued if (progress.get(vid) or {}).get("label") == "Waiting for the GPU" else active).append(item)
    recent = []
    if JOBS_LOG.exists():
        for line in JOBS_LOG.read_text().splitlines()[-200:]:
            with contextlib.suppress(Exception):
                r = json.loads(line)
                if r.get("event") == "end":
                    recent.append({**r, "name": names.get(r["voice"], r["voice"])})
    return web.json_response({"active": active, "queued": queued, "recent": list(reversed(recent))[:30], "gpu_busy": gpu.busy})


@routes.get("/api/voices/{id}/samples")
async def samples(req: web.Request) -> web.Response:
    vid = req.match_info["id"]
    rid = req.query.get("run") or active_run(vid)
    rows = (read_json(run_dir(vid, rid) / "samples.json", []) if rid else []) or []
    keys = ("instruction", "reference", "base", "tuned", "frontier", "votes", "title", "url")
    return web.json_response([{k: r.get(k, "") for k in keys} for r in rows])


async def sse(resp: web.StreamResponse, obj: dict) -> None:
    await resp.write(("data: %s\n\n" % json.dumps(obj, ensure_ascii=False)).encode())


async def stream_frontier(resp: web.StreamResponse, prompt: str, name: str) -> None:
    text = ("Write a blog passage in the style of %s's essays: his word choice, rhythm and way of arguing. "
            "Plain text, no title, no preamble.\n\n%s" % (name, prompt))
    payload = {"model": "gpt-5.5", "messages": [{"role": "user", "content": text}], "stream": True,
               "reasoning_effort": "low"}
    t0, n = time.time(), 0
    async with ClientSession(timeout=ClientTimeout(total=300)) as s:
        async with s.post("https://api.openai.com/v1/chat/completions", json=payload,
                          headers={"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"]}) as r:
            if r.status != 200:
                await sse(resp, {"error": "GPT-5.5 returned %d" % r.status})
                return
            async for raw in r.content:
                line = raw.decode(errors="replace").strip()
                if not line.startswith("data: ") or line == "data: [DONE]":
                    continue
                with contextlib.suppress(Exception):
                    delta = json.loads(line[6:])["choices"][0]["delta"].get("content")
                    if delta:
                        n += 1
                        await sse(resp, {"t": delta})
    await sse(resp, {"done": True, "tokens": n, "tps": round(n / max(time.time() - t0, 1e-6), 1)})


@routes.post("/api/generate")
async def generate(req: web.Request) -> web.StreamResponse:
    body = await req.json()
    vid, prompt, mode = body.get("voice", ""), body.get("prompt", "").strip(), body.get("mode", "tuned")
    max_tokens = int(body.get("max_tokens", 500))
    resp = web.StreamResponse(headers={"Content-Type": "text/event-stream", "Cache-Control": "no-cache"})
    await resp.prepare(req)
    meta = load_voices().get(vid, {})
    if not prompt:
        await sse(resp, {"error": "empty prompt"})
        return resp
    if mode == "frontier":
        await stream_frontier(resp, prompt, meta.get("name", vid))
        return resp
    if gpu.busy:
        await sse(resp, {"error": "The GPU is busy training or evaluating %s. Try again when it finishes." % gpu.busy})
        return resp
    if mode == "tuned" and not adapter_path(vid):
        await sse(resp, {"error": "No trained adapter for %s yet." % vid})
        return resp
    loop = asyncio.get_running_loop()
    q: asyncio.Queue = asyncio.Queue()
    async with gpu.lock:
        fut = loop.run_in_executor(None, gpu.generate, prompt, mode, vid, max_tokens,
                                   lambda t: loop.call_soon_threadsafe(q.put_nowait, t))
        while True:
            get = asyncio.ensure_future(q.get())
            done, _ = await asyncio.wait({get, fut}, return_when=asyncio.FIRST_COMPLETED)
            if get in done:
                await sse(resp, {"t": get.result()})
                continue
            get.cancel()
            while not q.empty():
                await sse(resp, {"t": q.get_nowait()})
            try:
                stats = fut.result()
                await sse(resp, {"done": True, **stats})
            except Exception as e:
                await sse(resp, {"error": str(e)})
            break
    return resp


# ---------- the machine: GPU, disk, base models ----------

CATALOG = [
    {"id": "qwen3vl-2b", "repo": "Qwen/Qwen3-VL-2B-Instruct", "params": "2B", "size_gb": 4.4, "train_vram_gb": 9, "serve_vram_gb": 5},
    {"id": "qwen3vl-4b", "repo": "Qwen/Qwen3-VL-4B-Instruct", "params": "4B", "size_gb": 8.9, "train_vram_gb": 15, "serve_vram_gb": 9},
    {"id": "qwen3vl-8b", "repo": "Qwen/Qwen3-VL-8B-Instruct", "params": "8B", "size_gb": 17.0, "train_vram_gb": 23, "serve_vram_gb": 17},
]
downloads: dict[str, dict] = {}   # model id -> {"proc", "started", "log"}


def gpu_info() -> dict | None:
    import subprocess
    try:
        out = subprocess.run(["nvidia-smi", "--query-gpu=name,memory.total,memory.used,utilization.gpu,temperature.gpu,power.draw",
                              "--format=csv,noheader,nounits"], capture_output=True, text=True, timeout=5).stdout.strip()
        name, total, used, util, temp, power = [x.strip() for x in out.split(",")]
        return {"name": name, "vram_total_mb": int(total), "vram_used_mb": int(used), "util": int(util),
                "temp_c": int(temp), "power_w": float(power)}
    except Exception:
        return None


def dir_size(p: Path) -> int:
    total = 0
    for f in p.rglob("*"):
        if f.is_file():
            with contextlib.suppress(OSError):
                total += os.path.getsize(f)  # follows the symlink to the real weights
    return total


def machine_view() -> dict:
    import shutil
    gpu_ = gpu_info()
    vram = (gpu_ or {}).get("vram_total_mb", 0) / 1024
    models_dir = ROOT / "models"
    models_dir.mkdir(exist_ok=True)
    fits = [m for m in CATALOG if m["train_vram_gb"] <= vram * 0.85]
    recommended = fits[-1]["id"] if fits else None
    rows = []
    for m in CATALOG:
        d = models_dir / m["id"]
        present = (d / "config.json").exists() and any(d.glob("*.safetensors"))
        job = downloads.get(m["id"])
        status = None
        if job:
            rc = job["proc"].poll()
            status = {"state": "running" if rc is None else ("done" if rc == 0 else "error"),
                      "downloaded_gb": round(dir_size(d) / 1e9, 2) if d.exists() else 0,
                      "started": job["started"]}
        rows.append({**m, "present": present, "active": m["id"] == MODEL_DIR.name,
                     "size_on_disk_gb": round(dir_size(d) / 1e9, 2) if d.exists() else 0,
                     "fits_training": m["train_vram_gb"] <= vram * 0.85, "fits_serving": m["serve_vram_gb"] <= vram * 0.9,
                     "recommended": m["id"] == recommended, "download": status})
    disk_project = shutil.disk_usage(ROOT)
    real_models = (models_dir / MODEL_DIR.name / "model.safetensors")
    disk_models = shutil.disk_usage(real_models.resolve().parent if real_models.exists() else models_dir)
    names = {k: m.get("name", k) for k, m in load_voices().items()}
    return {
        "gpu": gpu_, "busy": gpu.busy, "busy_name": names.get(gpu.busy, gpu.busy) if gpu.busy else None,
        "model_loaded": gpu.model is not None, "base_model": MODEL_DIR.name,
        "disk": {"project_free_gb": round(disk_project.free / 1e9, 1), "project_total_gb": round(disk_project.total / 1e9, 1),
                 "models_free_gb": round(disk_models.free / 1e9, 1), "models_total_gb": round(disk_models.total / 1e9, 1)},
        "models": rows,
    }


@routes.get("/api/machine")
async def get_machine(_req: web.Request) -> web.Response:
    return web.json_response(await asyncio.get_running_loop().run_in_executor(None, machine_view))


@routes.post("/api/machine/download")
async def download_model(req: web.Request) -> web.Response:
    """Fetch a base model from Hugging Face into models/<id>, in the background, resumable."""
    import subprocess
    mid = (await req.json()).get("id", "")
    m = next((x for x in CATALOG if x["id"] == mid), None)
    if not m:
        return web.json_response({"error": "unknown model"}, status=400)
    job = downloads.get(mid)
    if job and job["proc"].poll() is None:
        return web.json_response({"error": "already downloading"}, status=409)
    (RUNS / "downloads").mkdir(parents=True, exist_ok=True)
    log = open(RUNS / "downloads" / ("%s.log" % mid), "a")
    code = ("from huggingface_hub import snapshot_download; "
            "snapshot_download(%r, local_dir=%r, allow_patterns=['*.json', '*.safetensors', '*.txt', '*.jinja'])"
            % (m["repo"], str(ROOT / "models" / mid)))
    env = {**os.environ, "HF_TOKEN": os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_API_KEY", "")}
    proc = subprocess.Popen([PY, "-c", code], stdout=log, stderr=subprocess.STDOUT, env=env, cwd=str(ROOT))
    downloads[mid] = {"proc": proc, "started": time.time(), "log": log}
    return web.json_response({"id": mid, "started": True})


def make_app() -> web.Application:
    app = web.Application(client_max_size=64 * 1024 * 1024)
    app.add_routes(routes)
    dist = ROOT / "web" / "dist"
    if dist.exists():
        async def index(_req: web.Request) -> web.FileResponse:
            return web.FileResponse(dist / "index.html")
        app.router.add_get("/", index)
        app.router.add_static("/assets", dist / "assets")
    return app


if __name__ == "__main__":
    web.run_app(make_app(), host="127.0.0.1", port=PORT)
