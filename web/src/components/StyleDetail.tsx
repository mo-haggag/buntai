import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, Check, CircleAlert, Cpu, Download, ExternalLink, FileText, Gauge, Layers, PenLine, RefreshCw } from "lucide-react";
import { api } from "../api";
import type { DataView, Judge, Run, Sample, Voice } from "../api";
import { BASE_MODEL, FRONTIER_LABEL } from "../brand";
import { BlindTest } from "./BlindTest";
import { LossChart } from "./LossChart";
import {
  Button,
  Card,
  Dot,
  ErrorNote,
  PageHeader,
  Panel,
  Paragraphs,
  Progress,
  Spinner,
  StageBadge,
  Stat,
  Tabs,
  cx,
  fmtCompact,
  fmtDuration,
  fmtInt,
  fmtWhen,
  hostOf,
} from "./ui";

export type DetailTab = "overview" | "data" | "training" | "evaluation";

type StepKey = "collect" | "build" | "train" | "eval";
type Status = "done" | "running" | "waiting" | "failed";
const ORDER: StepKey[] = ["collect", "build", "train", "eval"];

function stepStatuses(v: Voice): Status[] {
  if (v.stage === "ready") return ORDER.map(() => "done");
  if (v.stage === "idle") return ORDER.map(() => "waiting");
  if (v.stage === "error") {
    const failed = ORDER.indexOf((v.error?.split(" ")[0] ?? "") as StepKey);
    return ORDER.map((_, i) => (failed === -1 || i < failed ? "done" : i === failed ? "failed" : "waiting"));
  }
  const cur = ORDER.indexOf(v.stage as StepKey);
  return ORDER.map((_, i) => (i < cur ? "done" : i === cur ? "running" : "waiting"));
}

export function StyleDetail({
  id,
  tab,
  voice,
  onUpdate,
  onTab,
}: {
  id: string;
  tab: DetailTab;
  voice: Voice | undefined;
  onUpdate: (v: Voice) => void;
  onTab: (t: DetailTab) => void;
}) {
  const stage = voice?.stage;

  useEffect(() => {
    let alive = true;
    const tick = () =>
      api
        .getVoice(id)
        .then((v) => alive && onUpdate(v))
        .catch(() => {});
    tick();
    if (stage === "ready" || stage === "error") return () => void (alive = false);
    const timer = setInterval(tick, stage === "idle" ? 5000 : 2000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id, stage]);

  if (!voice) {
    return (
      <div className="flex items-center gap-2 py-20 text-ink-3">
        <Spinner /> Loading
      </div>
    );
  }

  const runs = voice.runs ?? [];
  const tabs: { key: DetailTab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "data", label: "Data", count: voice.stats?.posts },
    { key: "training", label: "Training", count: runs.length || undefined },
    { key: "evaluation", label: "Evaluation" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={voice.name}
        badge={<StageBadge stage={voice.stage} />}
        sub={
          voice.source_kind === "files" ? (
            <span className="inline-flex items-center gap-1">
              <FileText className="size-3.5" aria-hidden /> Uploaded files
            </span>
          ) : (
            <a href={voice.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-ink-2">
              {hostOf(voice.source)}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )
        }
        actions={
          voice.stage === "ready" && (
            <Button variant="primary" onClick={() => (window.location.hash = `#/write?style=${encodeURIComponent(voice.id)}`)}>
              <PenLine className="size-4" aria-hidden />
              Write with it
            </Button>
          )
        }
      />

      {voice.stage === "error" && <ErrorNote>{voice.error || "Pipeline failed"}</ErrorNote>}

      <Tabs tabs={tabs} value={tab} onChange={onTab} />

      {tab === "overview" && <Overview voice={voice} />}
      {tab === "data" && <DataTab voice={voice} />}
      {tab === "training" && <TrainingTab voice={voice} onUpdate={onUpdate} />}
      {tab === "evaluation" && <EvaluationTab voice={voice} />}
    </div>
  );
}

/* ---------- Overview ---------- */

function Overview({ voice }: { voice: Voice }) {
  const st = stepStatuses(voice);
  const s = voice.stats ?? {};
  const m = voice.metrics ?? {};
  const progressFor = (i: number) => (st[i] === "running" ? voice.progress : undefined);
  const active = voice.runs?.find((r) => r.id === voice.active_run);
  return (
    <div className="space-y-6">
      <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-5">
        <Stat label="Posts" value={s.posts !== undefined ? fmtInt(s.posts) : "-"} />
        <Stat label="Words" value={s.words !== undefined ? fmtCompact(s.words) : "-"} />
        <Stat label="Training pairs" value={s.train !== undefined ? fmtInt(s.train) : "-"} sub={s.eval !== undefined ? `${fmtInt(s.eval)} held out` : undefined} />
        <Stat label="Runs" value={fmtInt(voice.runs?.length ?? 0)} sub={active ? `active ${fmtWhen(active.created)}` : undefined} />
        <Stat label="Adapter" value="33M" sub={`on ${BASE_MODEL}`} />
      </Card>

      {(m.ppl_base !== undefined || m.judge) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {m.ppl_base !== undefined && m.ppl_tuned !== undefined && <PerplexityPanel base={m.ppl_base} tuned={m.ppl_tuned} />}
          {m.judge && <JudgePanel judge={m.judge} />}
        </div>
      )}

      <ol>
        <Step n={1} title="Collect" icon={<Download />} status={st[0]} last={false} aside={s.posts !== undefined && `${fmtInt(s.posts)} posts`}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Posts" value={s.posts !== undefined ? fmtInt(s.posts) : "-"} />
            <Stat label="Words" value={s.words !== undefined ? fmtCompact(s.words) : "-"} />
          </div>
          {progressFor(0) && <Progress progress={progressFor(0)!} />}
        </Step>
        <Step n={2} title="Build pairs" icon={<Layers />} status={st[1]} last={false} aside={s.train !== undefined && `${fmtInt(s.train)} pairs`}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Train pairs" value={s.train !== undefined ? fmtInt(s.train) : "-"} />
            <Stat label="Held-out passages" value={s.eval !== undefined ? fmtInt(s.eval) : "-"} />
            {s.passages !== undefined && <Stat label="Passages" value={fmtInt(s.passages)} />}
            {s.posts_kept !== undefined && <Stat label="Posts kept" value={fmtInt(s.posts_kept)} sub={s.posts ? `of ${fmtInt(s.posts)}` : undefined} />}
          </div>
          {progressFor(1) && <Progress progress={progressFor(1)!} />}
        </Step>
        <Step n={3} title="Train" icon={<Cpu />} status={st[2]} last={false} aside={st[2] !== "waiting" && voice.train?.total_steps ? `Step ${fmtInt(voice.train.steps.at(-1)?.step ?? 0)} / ${fmtInt(voice.train.total_steps)}` : undefined}>
          <TrainSummary voice={voice} />
        </Step>
        <Step n={4} title="Evaluate" icon={<Gauge />} status={st[3]} last>
          {progressFor(3) ? (
            <Progress progress={progressFor(3)!} />
          ) : m.ppl_tuned !== undefined ? (
            <div className="text-sm text-ink-2">
              Held-out perplexity {m.ppl_base?.toFixed(2)} to {m.ppl_tuned.toFixed(2)}
              {m.judge && `. Judge picked this style ${m.judge.tuned_wins} of ${m.judge.n} times.`}
            </div>
          ) : (
            <div className="text-sm text-ink-3">No results yet</div>
          )}
        </Step>
      </ol>
    </div>
  );
}

function TrainSummary({ voice }: { voice: Voice }) {
  const t = voice.train;
  if (!t || !t.total_steps) {
    return voice.progress && voice.stage === "train" ? <Progress progress={voice.progress} /> : <div className="text-sm text-ink-3">Not started</div>;
  }
  const last = t.steps.at(-1);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Step" value={<span>{fmtInt(last?.step ?? 0)}<span className="text-ink-3"> / {fmtInt(t.total_steps)}</span></span>} />
        <Stat label="Loss" value={last ? last.loss.toFixed(3) : "-"} />
        <Stat label="Epoch" value={t.epoch !== undefined ? `${Number.isInteger(t.epoch) ? t.epoch : t.epoch.toFixed(1)}${t.epochs ? ` / ${t.epochs}` : ""}` : "-"} sub={t.best_epoch ? `best epoch ${t.best_epoch}` : undefined} />
        <Stat label="Time" value={t.seconds !== undefined ? fmtDuration(t.seconds) : "-"} />
      </div>
      <LossChart steps={t.steps} totalSteps={t.total_steps} />
    </div>
  );
}

function Step({ n, title, icon, status, aside, last, children }: { n: number; title: string; icon: ReactNode; status: Status; aside?: ReactNode; last: boolean; children: ReactNode }) {
  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      {!last && <span aria-hidden className={cx("absolute top-9 bottom-0 left-[15px] w-0.5 rounded", status === "done" ? "bg-accent" : "bg-line")} />}
      <div
        className={cx(
          "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          status === "done" && "bg-accent text-white",
          status === "running" && "bg-accent-soft text-accent ring-2 ring-accent",
          status === "waiting" && "border border-line-strong bg-surface text-ink-3",
          status === "failed" && "bg-bad text-white",
        )}
      >
        {status === "done" ? <Check className="size-4" strokeWidth={3} aria-hidden /> : status === "running" ? <Spinner className="size-4" /> : status === "failed" ? <CircleAlert className="size-4" aria-hidden /> : n}
      </div>
      <Card className={cx("min-w-0 flex-1", status === "waiting" && "bg-transparent")}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className={cx("[&>svg]:size-4", status === "waiting" ? "text-ink-3" : "text-ink-2")}>{icon}</span>
            <h3 className={cx("font-semibold", status === "waiting" && "text-ink-3")}>{title}</h3>
            <span className={cx("text-xs font-medium", status === "done" && "text-good", status === "running" && "text-accent dark:text-accent-hover", status === "waiting" && "text-ink-3", status === "failed" && "text-bad")}>
              {{ done: "Done", running: "Running", waiting: "Waiting", failed: "Failed" }[status]}
            </span>
          </div>
          {aside && <div className="text-sm text-ink-2 tabular-nums">{aside}</div>}
        </div>
        {status !== "waiting" && <div className="space-y-4 border-t border-line px-5 py-4">{children}</div>}
      </Card>
    </li>
  );
}

/* ---------- Data ---------- */

function DataTab({ voice }: { voice: Voice }) {
  const [data, setData] = useState<DataView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = () => {
    setError(null);
    api
      .getData(voice.id)
      .then((d) => {
        setData(d);
        setExcluded(new Set(d.excluded ?? []));
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  };
  useEffect(load, [voice.id, voice.stage]);

  const toggle = async (url: string) => {
    const next = !excluded.has(url);
    const s = new Set(excluded);
    if (next) s.add(url);
    else s.delete(url);
    setExcluded(s);
    setDirty(true);
    await api.excludePost(voice.id, url, next).catch(() => {});
  };

  const rebuild = async () => {
    setBusy(true);
    try {
      await api.rerun(voice.id, "build");
      setDirty(false);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorNote onRetry={load}>{error}</ErrorNote>;
  if (!data) return <div className="flex items-center gap-2 py-10 text-ink-3"><Spinner /> Loading</div>;

  const posts = [...data.kept_posts, ...data.dropped_posts.filter((p) => p.why !== "excluded by you")].sort((a, b) => b.words - a.words);
  const droppedByRule = data.dropped_posts.filter((p) => p.why && p.why !== "excluded by you");

  return (
    <div className="space-y-6">
      <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-5">
        <Stat label="Posts collected" value={fmtInt(voice.stats?.posts ?? data.kept_posts.length + data.dropped_posts.length)} />
        <Stat label="Used" value={fmtInt(data.kept_posts.length)} sub={`${fmtInt(data.dropped_posts.length)} dropped`} />
        <Stat label="Passages" value={data.passages !== undefined ? fmtInt(data.passages) : "-"} sub={data.passages_total && data.passages_total !== data.passages ? `sampled from ${fmtInt(data.passages_total)}` : undefined} />
        <Stat label="Training pairs" value={data.train !== undefined ? fmtInt(data.train) : "-"} sub="2 requests per passage" />
        <Stat label="Held out" value={data.eval !== undefined ? fmtInt(data.eval) : "-"} sub="whole posts, never trained on" />
      </Card>

      {(dirty || excluded.size > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-(--radius-card) border border-line bg-surface px-4 py-3 text-sm">
          <span className="text-ink-2">
            {fmtInt(excluded.size)} post{excluded.size === 1 ? "" : "s"} excluded{dirty ? ". Rebuild to apply." : "."}
          </span>
          <Button variant="primary" onClick={rebuild} disabled={busy || voice.stage !== "ready" && voice.stage !== "error" && voice.stage !== "idle"}>
            <RefreshCw className={cx("size-4", busy && "animate-spin")} aria-hidden />
            Rebuild and retrain
          </Button>
        </div>
      )}

      {data.pairs.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">What the model trains on</h2>
          <div className="text-sm text-ink-2">A passage in the author's words, behind two requests an LLM wrote for it. The requests describe content only.</div>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.pairs.slice(0, 4).map((p, i) => (
              <Card key={i} className="flex flex-col">
                <div className="space-y-2 border-b border-line px-4 py-3">
                  {p.requests.map((r, j) => (
                    <div key={j} className="flex gap-2 text-sm">
                      <span className="mt-0.5 shrink-0 rounded-full bg-sunken px-1.5 text-[11px] font-medium text-ink-3">{j === 0 ? "detailed" : "one line"}</span>
                      <span className="text-ink-2">{r}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3">
                  <Paragraphs text={p.passage} className="text-sm" />
                  <div className="mt-2 truncate text-xs text-ink-3">{p.title}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Posts</h2>
        <div className="text-sm text-ink-2">Exclude anything that isn't the author's own prose, then rebuild.</div>
        <Card className="divide-y divide-line">
          {posts.map((p) => {
            const off = excluded.has(p.url);
            return (
              <div key={p.url} className={cx("flex items-center gap-3 px-4 py-2.5 text-sm", off && "opacity-60")}>
                <a href={p.url.startsWith("http") ? p.url : undefined} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate hover:underline">
                  {p.title || p.url}
                </a>
                <span className="shrink-0 text-xs text-ink-3 tabular-nums">{fmtInt(p.words)} words</span>
                <button
                  onClick={() => toggle(p.url)}
                  className={cx("h-7 shrink-0 rounded-(--radius-control) border px-2.5 text-xs font-medium", off ? "border-bad/40 text-bad" : "border-line-strong text-ink-2 hover:bg-sunken")}
                >
                  {off ? "Excluded" : "Exclude"}
                </button>
              </div>
            );
          })}
        </Card>
      </section>

      {droppedByRule.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Dropped automatically</h2>
          <Card className="divide-y divide-line">
            {droppedByRule.map((p) => (
              <div key={p.url} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-2">
                <span className="min-w-0 flex-1 truncate">{p.title || p.url}</span>
                <span className="shrink-0 text-xs text-ink-3">{p.why}</span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}

/* ---------- Training ---------- */

function TrainingTab({ voice, onUpdate }: { voice: Voice; onUpdate: (v: Voice) => void }) {
  const runs = voice.runs ?? [];
  const [busy, setBusy] = useState<string | null>(null);
  const t = voice.train;

  const activate = async (rid: string) => {
    setBusy(rid);
    try {
      await api.activateRun(voice.id, rid);
      onUpdate(await api.getVoice(voice.id));
    } finally {
      setBusy(null);
    }
  };

  const retrain = async () => {
    setBusy("retrain");
    try {
      await api.rerun(voice.id, "train");
      onUpdate(await api.getVoice(voice.id));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-ink-2">LoRA rank 16 on every attention and MLP projection of {BASE_MODEL}. Up to 4 epochs; the epoch with the lowest held-out perplexity is kept.</div>
        <Button onClick={retrain} disabled={busy !== null || voice.stage !== "ready"}>
          <RefreshCw className={cx("size-4", busy === "retrain" && "animate-spin")} aria-hidden />
          Train again
        </Button>
      </div>

      {t && t.total_steps > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <div className="font-semibold">{voice.stage === "train" ? "Training now" : "Active run"} <span className="ml-2 text-xs font-normal text-ink-3 tabular-nums">{t.run}</span></div>
            {t.seconds !== undefined && <div className="text-sm text-ink-2 tabular-nums">{fmtDuration(t.seconds)}</div>}
          </div>
          <TrainSummary voice={voice} />
          {t.epoch_ends && t.epoch_ends.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {t.epoch_ends.map((e) => (
                <div key={e.epoch} className={cx("rounded-(--radius-control) border px-3 py-2 text-sm", e.epoch === t.best_epoch ? "border-tuned bg-accent-soft" : "border-line")}>
                  <div className="text-xs text-ink-3">Epoch {e.epoch}</div>
                  <div className="font-semibold tabular-nums">{e.ppl.toFixed(2)}</div>
                  {e.epoch === t.best_epoch && <div className="text-[11px] font-medium text-tuned">kept</div>}
                </div>
              ))}
              <div className="self-center text-xs text-ink-3">held-out perplexity after each epoch</div>
            </div>
          )}
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Runs</h2>
        {runs.length === 0 ? (
          <div className="text-sm text-ink-3">No runs yet</div>
        ) : (
          <Card className="divide-y divide-line">
            {runs.map((r) => (
              <RunRow key={r.id} run={r} active={r.id === voice.active_run} busy={busy === r.id} onActivate={() => activate(r.id)} />
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

function RunRow({ run: r, active, busy, onActivate }: { run: Run; active: boolean; busy: boolean; onActivate: () => void }) {
  const m = r.metrics;
  const drop = m.ppl_base && m.ppl_tuned ? ((m.ppl_base - m.ppl_tuned) / m.ppl_base) * 100 : null;
  return (
    <div className="grid items-center gap-3 px-4 py-3 text-sm sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
      <div>
        <div className="flex items-center gap-2 font-medium">
          {fmtWhen(r.created) || r.id}
          {active && <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-medium text-good">Active</span>}
        </div>
        <div className="text-xs text-ink-3">
          {r.epochs ?? "?"} epochs · rank {r.rank ?? "?"} · {r.train_pairs !== undefined ? fmtInt(r.train_pairs) : "?"} pairs · {r.total_steps !== undefined ? fmtInt(r.total_steps) : "?"} steps
        </div>
      </div>
      <div>
        <div className="text-xs text-ink-3">Perplexity</div>
        <div className="tabular-nums">
          {m.ppl_base !== undefined && m.ppl_tuned !== undefined ? (
            <>
              {m.ppl_base.toFixed(1)} <span className="text-ink-3">to</span> <span className="font-medium">{m.ppl_tuned.toFixed(1)}</span>
              {drop !== null && <span className="ml-1.5 text-xs text-good">{drop.toFixed(0)}% lower</span>}
            </>
          ) : "-"}
        </div>
      </div>
      <div>
        <div className="text-xs text-ink-3">Best epoch</div>
        <div className="tabular-nums">{m.best_epoch ?? "-"}{m.ppl_by_epoch ? <span className="text-xs text-ink-3"> of {m.ppl_by_epoch.length}</span> : null}</div>
      </div>
      <div>
        <div className="text-xs text-ink-3">Judge</div>
        <div className="tabular-nums">{m.judge ? `${m.judge.tuned_wins} of ${m.judge.n}` : "not judged"}</div>
      </div>
      <div className="sm:justify-self-end">
        {!active && r.has_adapter && (
          <Button onClick={onActivate} disabled={busy} className="h-8">
            {busy ? "Switching" : "Use this run"}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------- Evaluation ---------- */

function EvaluationTab({ voice }: { voice: Voice }) {
  const m = voice.metrics ?? {};
  const [samples, setSamples] = useState<Sample[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(0);

  const load = () => {
    setError(null);
    api
      .getSamples(voice.id)
      .then(setSamples)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  };
  useEffect(load, [voice.id, voice.active_run, voice.stage]);

  const sample = samples?.[open];
  return (
    <div className="space-y-6">
      {m.ppl_base === undefined && !m.judge && <div className="text-sm text-ink-3">No results yet.</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        {m.ppl_base !== undefined && m.ppl_tuned !== undefined && <PerplexityPanel base={m.ppl_base} tuned={m.ppl_tuned} />}
        {m.judge && <JudgePanel judge={m.judge} />}
      </div>

      {samples && samples.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Blind test</h2>
          <div className="text-sm text-ink-2">Held-out requests. Pick which output sounds like {voice.name}, then see the author's real passage.</div>
          <BlindTest voice={voice} samples={samples} />
        </section>
      )}

      {error && <ErrorNote onRetry={load}>{error}</ErrorNote>}

      {samples && samples.length > 0 && sample && (
        <section className="space-y-3">
          <h2 className="font-semibold">Judged samples</h2>
          <div className="text-sm text-ink-2">Every held-out request with all three outputs and the judge's two votes.</div>
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <Card className="max-h-[560px] divide-y divide-line overflow-auto">
              {samples.map((s, i) => (
                <button key={i} onClick={() => setOpen(i)} className={cx("block w-full px-3 py-2.5 text-left text-sm", i === open ? "bg-sunken" : "hover:bg-sunken")}>
                  <div className="line-clamp-2 text-ink">{s.instruction}</div>
                  <div className="mt-1 flex gap-1">
                    {(s.votes ?? []).map((v, j) => (
                      <span key={j} className={cx("rounded px-1.5 text-[11px] font-medium", v === "tuned" && "bg-tuned text-white", v === "frontier" && "bg-frontier text-white", v === "base" && "bg-stock text-white", !v && "bg-line text-ink-3")}>
                        {v === "tuned" ? "style" : v === "frontier" ? "GPT" : v === "base" ? "base" : "none"}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </Card>
            <div className="space-y-4">
              <Card className="p-4">
                <div className="mb-1 text-xs text-ink-3">Request</div>
                <div className="text-sm font-medium">{sample.instruction}</div>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <OutputCard tone="tuned" title={`${voice.name} style (tuned)`} text={sample.tuned} highlight />
                <OutputCard tone="frontier" title={FRONTIER_LABEL} text={sample.frontier ?? ""} />
                <OutputCard tone="stock" title={`Base ${BASE_MODEL}`} text={sample.base} />
                <Card className="p-4">
                  <div className="mb-2 text-sm font-semibold">{voice.name}'s real passage</div>
                  <Paragraphs text={sample.reference} className="text-sm text-ink-2" />
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function OutputCard({ tone, title, text, highlight }: { tone: "stock" | "tuned" | "frontier"; title: string; text: string; highlight?: boolean }) {
  return (
    <Card className={cx("p-4", highlight && "border-tuned/50 ring-1 ring-tuned/25")}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Dot tone={tone} />
        {title}
      </div>
      {text ? <Paragraphs text={text} className="text-sm" /> : <div className="text-sm text-ink-3">No output</div>}
    </Card>
  );
}

/* ---------- result panels ---------- */

export function PerplexityPanel({ base, tuned }: { base: number; tuned: number }) {
  const drop = base > 0 ? ((base - tuned) / base) * 100 : 0;
  const max = Math.max(base, tuned);
  const rows = [
    { tone: "stock" as const, label: "Base", value: base, bar: "bg-stock" },
    { tone: "tuned" as const, label: "Tuned", value: tuned, bar: "bg-tuned" },
  ];
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">Held-out perplexity</div>
          <div className="text-xs text-ink-3">How predictable the author's unseen passages are. Lower is closer.</div>
        </div>
        {drop > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-good-soft px-2.5 py-1 text-sm font-semibold text-good">
            <ArrowDown className="size-3.5" strokeWidth={3} aria-hidden />
            {drop.toFixed(0)}%
          </span>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center gap-2 text-sm text-ink-2">
              <Dot tone={r.tone} />
              {r.label}
            </div>
            <div className={cx("mt-1 text-5xl font-semibold tracking-tight tabular-nums", r.tone === "stock" && "text-ink-2")}>{r.value.toFixed(1)}</div>
            <div className="mt-3 h-2 rounded-full bg-line">
              <div className={cx("h-full rounded-full", r.bar)} style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function JudgePanel({ judge }: { judge: Judge }) {
  const n = judge.n || 1;
  const parts = [
    { key: "tuned", label: "This style", count: judge.tuned_wins, fill: "bg-tuned", tone: "tuned" as const },
    ...(judge.frontier_wins !== undefined ? [{ key: "frontier", label: FRONTIER_LABEL, count: judge.frontier_wins, fill: "bg-frontier", tone: "frontier" as const }] : []),
    { key: "base", label: "Base", count: judge.base_wins, fill: "bg-stock", tone: "stock" as const },
  ];
  const ties = Math.max(0, judge.n - parts.reduce((a, p) => a + p.count, 0));
  const pct = (c: number) => (c / n) * 100;
  return (
    <Panel>
      <div>
        <div className="font-medium">Judge picks this style</div>
        <div className="text-xs text-ink-3">
          {fmtInt(judge.n)} blind comparisons against the author's real passage, judged by {judge.judge_model}
        </div>
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-5xl font-semibold tracking-tight tabular-nums">{pct(judge.tuned_wins).toFixed(0)}%</span>
        <span className="text-sm text-ink-2">
          {fmtInt(judge.tuned_wins)} of {fmtInt(judge.n)}
        </span>
      </div>
      <div className="mt-4 flex h-7 gap-0.5" role="img" aria-label={parts.map((p) => `${p.label} ${p.count} of ${judge.n}`).join(", ")}>
        {parts.map(
          (p) =>
            p.count > 0 && (
              <div key={p.key} className={cx("flex items-center rounded px-2 text-xs font-semibold whitespace-nowrap text-white", p.fill)} style={{ width: `${pct(p.count)}%` }} title={`${p.label}: ${p.count} of ${judge.n}`}>
                {pct(p.count) >= 12 && `${pct(p.count).toFixed(0)}%`}
              </div>
            ),
        )}
        {ties > 0 && <div className="rounded bg-line" style={{ width: `${pct(ties)}%` }} title={`No vote: ${ties}`} />}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {parts.map((p) => (
          <span key={p.key} className="inline-flex items-center gap-1.5">
            <Dot tone={p.tone} className="size-2 rounded-sm" />
            {p.label}
          </span>
        ))}
      </div>
    </Panel>
  );
}
