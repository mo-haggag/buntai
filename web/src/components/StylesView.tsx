import { ArrowRight, ChevronRight, FileText, Signature } from "lucide-react";
import type { Voice } from "../api";
import { Button, EmptyState, PageHeader, Progress, StageBadge, cx, fmtCompact, hostOf, isRunning } from "./ui";

export function StylesView({ voices, loaded }: { voices: Voice[]; loaded: boolean }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Styles"
        sub="Each style is a small adapter on the same local model."
        actions={
          <Button variant="primary" onClick={() => (window.location.hash = "#/new")}>
            <Signature className="size-4" aria-hidden />
            New style
          </Button>
        }
      />

      {loaded && voices.length === 0 && (
        <EmptyState icon={<Signature className="size-6" />} title="No styles yet">
          Add a blog, upload files or paste text to train one.
        </EmptyState>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {voices.map((v) => (
          <StyleCard key={v.id} voice={v} />
        ))}
      </div>
    </div>
  );
}

function StyleCard({ voice: v }: { voice: Voice }) {
  const ppl = v.metrics?.ppl_base && v.metrics?.ppl_tuned ? v.metrics : null;
  const judge = v.metrics?.judge;
  return (
    <a
      href={`#/styles/${encodeURIComponent(v.id)}`}
      className={cx(
        "group flex flex-col gap-4 rounded-(--radius-card) border border-line bg-surface p-5 text-left transition-colors",
        "hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">{v.name}</div>
          <div className="flex items-center gap-1.5 truncate text-sm text-ink-3">
            {v.source_kind === "files" && <FileText className="size-3.5 shrink-0" aria-hidden />}
            {v.source_kind === "files" ? "Uploaded files" : hostOf(v.source)}
          </div>
        </div>
        <StageBadge stage={v.stage} />
      </div>

      <div className="flex w-full flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
        {v.stats?.posts !== undefined && (
          <span>
            <span className="font-medium text-ink tabular-nums">{fmtCompact(v.stats.posts)}</span> posts
          </span>
        )}
        {v.stats?.words !== undefined && (
          <span>
            <span className="font-medium text-ink tabular-nums">{fmtCompact(v.stats.words)}</span> words
          </span>
        )}
        {ppl && (
          <span>
            Perplexity{" "}
            <span className="inline-flex items-center gap-1 tabular-nums">
              {ppl.ppl_base!.toFixed(1)}
              <ArrowRight className="size-3.5 text-ink-3" aria-hidden />
              <span className="font-medium text-ink">{ppl.ppl_tuned!.toFixed(1)}</span>
            </span>
          </span>
        )}
        {judge && judge.n > 0 && (
          <span>
            Judge <span className="font-medium text-ink tabular-nums">{Math.round((judge.tuned_wins / judge.n) * 100)}%</span>
          </span>
        )}
      </div>

      {isRunning(v) && v.progress && (
        <div className="w-full">
          <Progress progress={v.progress} />
        </div>
      )}
      {v.stage === "error" && v.error && <div className="line-clamp-2 text-sm text-bad">{v.error}</div>}

      <div className="mt-auto flex items-center gap-1 text-sm font-medium text-ink-2 group-hover:text-ink">
        Open
        <ChevronRight className="size-4" aria-hidden />
      </div>
    </a>
  );
}
