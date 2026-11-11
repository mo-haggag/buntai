import { useEffect, useState } from "react";
import { Activity, Check, CircleAlert, Clock, X } from "lucide-react";
import { api } from "../api";
import type { Jobs as JobsInfo } from "../api";
import { Button, Card, ErrorNote, PageHeader, Progress, Spinner, StageBadge, cx, fmtDuration, fmtWhen } from "./ui";
import type { Stage } from "../api";

const STAGE_TEXT: Record<string, string> = { collect: "Collecting", build: "Building pairs", train: "Training", eval: "Evaluating" };

export function Jobs() {
  const [jobs, setJobs] = useState<JobsInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const load = () =>
    api
      .getJobs()
      .then((j) => {
        setJobs(j);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));

  useEffect(() => {
    load();
    const t = setInterval(() => {
      load();
      setNow(Date.now());
    }, 2000);
    return () => clearInterval(t);
  }, []);

  if (error && !jobs) return <ErrorNote onRetry={load}>{error}</ErrorNote>;
  if (!jobs)
    return (
      <div className="flex items-center gap-2 py-10 text-ink-3">
        <Spinner /> Loading
      </div>
    );

  const live = [...jobs.active, ...jobs.queued];
  return (
    <div className="space-y-8">
      <PageHeader title="Activity" sub="What the machine is doing now, and what it did. One GPU, one training or evaluation at a time; the rest wait their turn." />

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Activity className="size-4 text-ink-2" aria-hidden />
          Running
        </h2>
        {live.length === 0 ? (
          <Card className="px-5 py-8 text-center text-sm text-ink-3">Nothing running. The GPU is free for writing.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {live.map((j) => {
              const waiting = jobs.queued.includes(j);
              return (
                <Card key={j.voice} className={cx("space-y-4 p-5", !waiting && "border-accent/50 ring-1 ring-accent/20")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <a href={`#/styles/${encodeURIComponent(j.voice)}`} className="font-semibold hover:underline">
                        {j.name}
                      </a>
                      <div className="text-sm text-ink-2">{waiting ? "Waiting for the GPU" : STAGE_TEXT[j.stage ?? ""] ?? j.stage}</div>
                    </div>
                    <StageBadge stage={(j.stage ?? "idle") as Stage} />
                  </div>
                  {j.progress && !waiting && <Progress progress={j.progress} />}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-ink-3 tabular-nums">
                      <Clock className="size-3.5" aria-hidden />
                      {j.since ? `${fmtDuration((now / 1000) - j.since)} in this step` : ""}
                      {j.run && <span className="ml-2">run {j.run}</span>}
                    </div>
                    <Button
                      className="h-8"
                      onClick={() => {
                        if (window.confirm(`Cancel ${j.name}'s job? ${waiting ? "It leaves the queue." : "The running step stops; the style keeps its last adapter."}`))
                          api.cancelJob(j.voice).then(load).catch((e) => setError(e instanceof Error ? e.message : String(e)));
                      }}
                    >
                      <X className="size-4" aria-hidden />
                      Cancel
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">History</h2>
        {jobs.recent.length === 0 ? (
          <div className="text-sm text-ink-3">No finished jobs yet.</div>
        ) : (
          <Card className="divide-y divide-line">
            {jobs.recent.map((r, i) => (
              <div key={i} className="grid items-center gap-3 px-4 py-2.5 text-sm sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                <a href={`#/styles/${encodeURIComponent(r.voice)}`} className="truncate font-medium hover:underline">
                  {r.name}
                </a>
                <span className="text-ink-2">{STAGE_TEXT[r.stage] ?? r.stage}</span>
                <span className="text-ink-3 tabular-nums">{fmtWhen(r.at)}</span>
                <span className="text-ink-3 tabular-nums">{r.seconds !== undefined ? fmtDuration(r.seconds) : ""}</span>
                <span className={cx("inline-flex items-center gap-1 text-xs font-medium", r.ok ? "text-good" : "text-bad")}>
                  {r.ok ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <CircleAlert className="size-3.5" aria-hidden />}
                  {r.ok ? "Done" : r.exit === undefined ? "Cancelled" : `Failed (exit ${r.exit})`}
                </span>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
