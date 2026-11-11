import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import type { Stage, Voice } from "../api";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  return fmtInt(n);
}

export function fmtDuration(seconds: number) {
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export const RUNNING: Stage[] = ["collect", "build", "train", "eval"];
export const isRunning = (v: Voice) => RUNNING.includes(v.stage);

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "secondary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-white hover:bg-accent-hover",
        variant === "secondary" && "border border-line-strong bg-surface text-ink hover:bg-sunken",
        variant === "ghost" && "text-ink-2 hover:bg-sunken hover:text-ink",
        className,
      )}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-xl border border-line bg-surface", className)}>{children}</div>;
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cx("size-4 animate-spin", className)} aria-hidden />;
}

export function Dot({ tone, className }: { tone: "stock" | "tuned" | "frontier"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "inline-block size-2.5 shrink-0 rounded-full",
        tone === "stock" && "bg-stock",
        tone === "tuned" && "bg-tuned",
        tone === "frontier" && "bg-frontier",
        className,
      )}
    />
  );
}

const STAGE_LABEL: Record<Stage, string> = {
  idle: "Idle",
  collect: "Collecting",
  build: "Building",
  train: "Training",
  eval: "Evaluating",
  ready: "Ready",
  error: "Failed",
};

export function StageBadge({ stage }: { stage: Stage }) {
  const running = RUNNING.includes(stage);
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
        running && "bg-accent-soft text-accent dark:text-accent-hover",
        stage === "ready" && "bg-good-soft text-good",
        stage === "error" && "bg-bad-soft text-bad",
        stage === "idle" && "bg-sunken text-ink-2",
      )}
    >
      {running && <Spinner className="size-3" />}
      {stage === "ready" && <Check className="size-3" strokeWidth={3} aria-hidden />}
      {stage === "error" && <CircleAlert className="size-3" aria-hidden />}
      {STAGE_LABEL[stage]}
    </span>
  );
}

export function ProgressBar({ done, total, className }: { done: number; total: number; className?: string }) {
  const pct = total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : 0;
  return (
    <div
      className={cx("h-1.5 overflow-hidden rounded-full bg-accent-soft", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
    >
      <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Progress({ progress }: { progress: NonNullable<Voice["progress"]> }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-ink-2">{progress.label}</span>
        <span className="text-ink-3 tabular-nums">
          {fmtInt(progress.done)} / {fmtInt(progress.total)}
        </span>
      </div>
      <ProgressBar done={progress.done} total={progress.total} />
    </div>
  );
}

/** Render model text as paragraphs split on blank lines. */
export function Paragraphs({ text, caret, className }: { text: string; caret?: boolean; className?: string }) {
  const paras = text.trim() ? text.trim().split(/\n\s*\n/) : [""];
  return (
    <div className={cx("space-y-3 text-[15px] leading-relaxed", className)}>
      {paras.map((p, i) => (
        <p key={i} className={cx("whitespace-pre-line", caret && i === paras.length - 1 && "caret")}>
          {p}
        </p>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="text-ink-3">{icon}</div>
      <div className="font-medium">{title}</div>
      {children && <div className="text-sm text-ink-2">{children}</div>}
    </Card>
  );
}
