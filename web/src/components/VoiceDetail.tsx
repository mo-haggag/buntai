import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  Check,
  CircleAlert,
  Cpu,
  Download,
  ExternalLink,
  Gauge,
  Layers,
  PenLine,
  Scale,
} from "lucide-react";
import { api } from "../api";
import type { Voice } from "../api";
import { LossChart } from "./LossChart";
import {
  Button,
  Card,
  Dot,
  Progress,
  Spinner,
  StageBadge,
  cx,
  fmtCompact,
  fmtDuration,
  fmtInt,
  hostOf,
} from "./ui";

type StepKey = "collect" | "build" | "train" | "eval";
type Status = "done" | "running" | "waiting" | "failed";

const ORDER: StepKey[] = ["collect", "build", "train", "eval"];

function stepStatuses(v: Voice): Status[] {
  if (v.stage === "ready") return ORDER.map(() => "done");
  if (v.stage === "idle") return ORDER.map(() => "waiting");
  if (v.stage === "error") {
    // The API does not say which step failed: take the first one without results.
    const has = [
      !!v.stats?.posts,
      !!v.stats?.train,
      !!v.train && v.train.steps.length > 0 && v.train.steps[v.train.steps.length - 1].step >= v.train.total_steps,
      v.metrics?.ppl_tuned !== undefined,
    ];
    const failed = has.findIndex((x) => !x);
    return ORDER.map((_, i) => (failed === -1 || i < failed ? "done" : i === failed ? "failed" : "waiting"));
  }
  const cur = ORDER.indexOf(v.stage as StepKey);
  return ORDER.map((_, i) => (i < cur ? "done" : i === cur ? "running" : "waiting"));
}

export function VoiceDetail({
  id,
  voice,
  onUpdate,
  onBack,
  onWrite,
  onBlind,
}: {
  id: string;
  voice: Voice | undefined;
  onUpdate: (v: Voice) => void;
  onBack: () => void;
  onWrite: () => void;
  onBlind: () => void;
}) {
  const stage = voice?.stage;

  useEffect(() => {
    if (stage === "ready" || stage === "error") return;
    let alive = true;
    const tick = () =>
      api
        .getVoice(id)
        .then((v) => alive && onUpdate(v))
        .catch(() => {});
    if (!voice) tick();
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

  const st = stepStatuses(voice);
  const progressFor = (i: number) => (st[i] === "running" ? voice.progress : undefined);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden />
          Voices
        </button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{voice.name}</h1>
              <StageBadge stage={voice.stage} />
            </div>
            <a
              href={voice.source}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink-2"
            >
              {hostOf(voice.source)}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
          {voice.stage === "ready" && (
            <div className="flex gap-2">
              <Button onClick={onBlind}>
                <Scale className="size-4" aria-hidden />
                Blind test
              </Button>
              <Button variant="primary" onClick={onWrite}>
                <PenLine className="size-4" aria-hidden />
                Write with it
              </Button>
            </div>
          )}
        </div>
      </div>

      {voice.stage === "error" && (
        <div className="flex items-start gap-2 rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{voice.error || "Pipeline failed"}</span>
        </div>
      )}

      <ol className="relative">
        <Step n={1} title="Collect" icon={<Download />} status={st[0]} last={false}
          aside={voice.stats?.posts !== undefined && `${fmtInt(voice.stats.posts)} posts`}>
          <CollectBody voice={voice} progress={progressFor(0)} status={st[0]} />
        </Step>
        <Step n={2} title="Build" icon={<Layers />} status={st[1]} last={false}
          aside={voice.stats?.train !== undefined && `${fmtInt(voice.stats.train)} pairs`}>
          <BuildBody voice={voice} progress={progressFor(1)} status={st[1]} />
        </Step>
        <Step n={3} title="Train" icon={<Cpu />} status={st[2]} last={false}
          aside={voice.train && `Step ${fmtInt(voice.train.steps.at(-1)?.step ?? 0)} / ${fmtInt(voice.train.total_steps)}`}>
          <TrainBody voice={voice} status={st[2]} />
        </Step>
        <Step n={4} title="Evaluate" icon={<Gauge />} status={st[3]} last>
          <EvalBody voice={voice} progress={progressFor(3)} status={st[3]} />
        </Step>
      </ol>
    </div>
  );
}

function Step({
  n,
  title,
  icon,
  status,
  aside,
  last,
  children,
}: {
  n: number;
  title: string;
  icon: ReactNode;
  status: Status;
  aside?: ReactNode;
  last: boolean;
  children: ReactNode;
}) {
  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      {!last && (
        <span
          aria-hidden
          className={cx(
            "absolute top-9 bottom-0 left-[15px] w-0.5 rounded",
            status === "done" ? "bg-accent" : "bg-line",
          )}
        />
      )}
      <div
        className={cx(
          "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          status === "done" && "bg-accent text-white",
          status === "running" && "bg-accent-soft text-accent ring-2 ring-accent",
          status === "waiting" && "border border-line-strong bg-surface text-ink-3",
          status === "failed" && "bg-bad text-white",
        )}
      >
        {status === "done" ? (
          <Check className="size-4" strokeWidth={3} aria-hidden />
        ) : status === "running" ? (
          <Spinner className="size-4" />
        ) : status === "failed" ? (
          <CircleAlert className="size-4" aria-hidden />
        ) : (
          n
        )}
      </div>
      <Card className={cx("min-w-0 flex-1", status === "waiting" && "bg-transparent")}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className={cx("[&>svg]:size-4", status === "waiting" ? "text-ink-3" : "text-ink-2")}>{icon}</span>
            <h3 className={cx("font-semibold", status === "waiting" && "text-ink-3")}>{title}</h3>
            <StatusText status={status} />
          </div>
          {aside && <div className="text-sm text-ink-2 tabular-nums">{aside}</div>}
        </div>
        {status !== "waiting" && <div className="border-t border-line px-5 py-4">{children}</div>}
      </Card>
    </li>
  );
}

function StatusText({ status }: { status: Status }) {
  const label = { done: "Done", running: "Running", waiting: "Waiting", failed: "Failed" }[status];
  return (
    <span
      className={cx(
        "text-xs font-medium",
        status === "done" && "text-good",
        status === "running" && "text-accent dark:text-accent-hover",
        status === "waiting" && "text-ink-3",
        status === "failed" && "text-bad",
      )}
    >
      {label}
    </span>
  );
}

function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-ink-3">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {sub && <div className="text-xs text-ink-3">{sub}</div>}
    </div>
  );
}

type BodyProps = { voice: Voice; progress?: Voice["progress"]; status: Status };

function CollectBody({ voice, progress }: BodyProps) {
  const s = voice.stats ?? {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Posts" value={s.posts !== undefined ? fmtInt(s.posts) : "-"} />
        <Stat label="Words" value={s.words !== undefined ? fmtCompact(s.words) : "-"} />
      </div>
      {progress && <Progress progress={progress} />}
    </div>
  );
}

function BuildBody({ voice, progress }: BodyProps) {
  const s = voice.stats ?? {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Train pairs" value={s.train !== undefined ? fmtInt(s.train) : "-"} />
        <Stat label="Eval pairs" value={s.eval !== undefined ? fmtInt(s.eval) : "-"} />
        {s.passages !== undefined && <Stat label="Passages" value={fmtInt(s.passages)} />}
        {s.posts_kept !== undefined && (
          <Stat
            label="Posts kept"
            value={fmtInt(s.posts_kept)}
            sub={s.posts ? `of ${fmtInt(s.posts)}` : undefined}
          />
        )}
      </div>
      {progress && <Progress progress={progress} />}
    </div>
  );
}

function TrainBody({ voice }: BodyProps) {
  const t = voice.train;
  if (!t) {
    return voice.progress ? <Progress progress={voice.progress} /> : <div className="text-sm text-ink-3">Starting</div>;
  }
  const last = t.steps.at(-1);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Step"
          value={
            <span className="tabular-nums">
              {fmtInt(last?.step ?? 0)}
              <span className="text-ink-3"> / {fmtInt(t.total_steps)}</span>
            </span>
          }
        />
        <Stat label="Loss" value={last ? last.loss.toFixed(3) : "-"} />
        {t.epoch !== undefined && <Stat label="Epoch" value={Number.isInteger(t.epoch) ? t.epoch : t.epoch.toFixed(1)} />}
        {t.seconds !== undefined && <Stat label="Time" value={fmtDuration(t.seconds)} />}
      </div>
      <LossChart steps={t.steps} totalSteps={t.total_steps} />
    </div>
  );
}

function EvalBody({ voice, progress }: BodyProps) {
  const m = voice.metrics;
  if (!m || (m.ppl_base === undefined && !m.judge)) {
    return progress ? <Progress progress={progress} /> : <div className="text-sm text-ink-3">No results yet</div>;
  }
  return (
    <div className="space-y-4">
      {progress && <Progress progress={progress} />}
      <div className="grid gap-4 lg:grid-cols-2">
        {m.ppl_base !== undefined && m.ppl_tuned !== undefined && (
          <PerplexityPanel base={m.ppl_base} tuned={m.ppl_tuned} />
        )}
        {m.judge && <JudgePanel judge={m.judge} />}
      </div>
    </div>
  );
}

function PerplexityPanel({ base, tuned }: { base: number; tuned: number }) {
  const drop = base > 0 ? ((base - tuned) / base) * 100 : 0;
  const max = Math.max(base, tuned);
  const rows = [
    { tone: "stock" as const, label: "Base", value: base, bar: "bg-stock" },
    { tone: "tuned" as const, label: "Tuned", value: tuned, bar: "bg-tuned" },
  ];
  return (
    <div className="rounded-lg bg-sunken p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">Held-out perplexity</div>
          <div className="text-xs text-ink-3">On the author's unseen passages. Lower is closer.</div>
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
            <div className={cx("mt-1 text-5xl font-semibold tracking-tight", r.tone === "stock" && "text-ink-2")}>
              {r.value.toFixed(1)}
            </div>
            <div className="mt-3 h-2 rounded-full bg-line">
              <div className={cx("h-full rounded-full", r.bar)} style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Judge = NonNullable<NonNullable<Voice["metrics"]>["judge"]>;

function JudgePanel({ judge }: { judge: Judge }) {
  const n = judge.n || 1;
  const parts = [
    { key: "tuned", label: "Tuned voice", count: judge.tuned_wins, fill: "bg-tuned", ink: "text-white", tone: "tuned" as const },
    ...(judge.frontier_wins !== undefined
      ? [{ key: "frontier", label: "GPT-5.5 imitating", count: judge.frontier_wins, fill: "bg-frontier", ink: "text-white dark:text-neutral-950", tone: "frontier" as const }]
      : []),
    { key: "base", label: "Base", count: judge.base_wins, fill: "bg-stock", ink: "text-neutral-950 dark:text-white", tone: "stock" as const },
  ];
  const ties = Math.max(0, judge.n - parts.reduce((a, p) => a + p.count, 0));
  const pct = (c: number) => (c / n) * 100;

  return (
    <div className="rounded-lg bg-sunken p-5">
      <div>
        <div className="font-medium">Judge picks the tuned voice</div>
        <div className="text-xs text-ink-3">
          {fmtInt(judge.n)} blind comparisons · judged by {judge.judge_model}
        </div>
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-5xl font-semibold tracking-tight">{pct(judge.tuned_wins).toFixed(0)}%</span>
        <span className="text-sm text-ink-2">
          {fmtInt(judge.tuned_wins)} of {fmtInt(judge.n)}
        </span>
      </div>
      <div className="mt-4 flex h-7 gap-0.5" role="img" aria-label={parts.map((p) => `${p.label} ${p.count} of ${judge.n}`).join(", ")}>
        {parts.map(
          (p) =>
            p.count > 0 && (
              <div
                key={p.key}
                className={cx("flex items-center rounded px-2 text-xs font-semibold whitespace-nowrap", p.fill, p.ink)}
                style={{ width: `${pct(p.count)}%` }}
                title={`${p.label}: ${p.count} of ${judge.n}`}
              >
                {pct(p.count) >= 12 && `${pct(p.count).toFixed(0)}%`}
              </div>
            ),
        )}
        {ties > 0 && <div className="rounded bg-line" style={{ width: `${pct(ties)}%` }} title={`Ties: ${ties}`} />}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {parts.map((p) => (
          <span key={p.key} className="inline-flex items-center gap-1.5">
            <Dot tone={p.tone} className="size-2 rounded-sm" />
            {p.label}
          </span>
        ))}
        {ties > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm bg-line" />
            Tie
          </span>
        )}
      </div>
    </div>
  );
}
