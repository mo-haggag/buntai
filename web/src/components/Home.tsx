import { ArrowRight, Cpu, SquarePen, UserRoundPlus, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import type { Voice } from "../api";
import { APP_NAME } from "../brand";
import { Card, StageBadge, cx, isRunning } from "./ui";

/** The first screen: what do you want to do? */
export function Home({ voices, busy }: { voices: Voice[]; busy: string | null }) {
  const ready = voices.filter((v) => v.stage === "ready");
  const running = voices.filter(isRunning);
  const drafts = (() => {
    try {
      return JSON.parse(localStorage.getItem("buntai-drafts") ?? "[]") as { brief: string; voiceName: string }[];
    } catch {
      return [];
    }
  })();

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="max-w-xl text-ink-2">A model that writes like a person. Trained from their writing and run on this computer.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Choice
          href="#/new"
          icon={<UserRoundPlus className="size-5" aria-hidden />}
          title="Train a style"
          sub="From a blog, files or pasted text. About ten minutes."
          primary={ready.length === 0}
        />
        <Choice
          href="#/write"
          icon={<SquarePen className="size-5" aria-hidden />}
          title="Write"
          sub={ready.length ? `As ${ready.map((v) => v.name).slice(0, 3).join(", ")}${ready.length > 3 ? " and more" : ""}.` : "Needs a trained style first."}
          primary={ready.length > 0}
          disabled={ready.length === 0}
        />
        <Choice
          href="#/machine"
          icon={<Cpu className="size-5" aria-hidden />}
          title="Machine"
          sub={busy ? `Training ${busy} now.` : "The GPU, disk and base models."}
        />
      </div>

      {(voices.length > 0 || drafts.length > 0) && (
        <div className={cx("grid gap-6", voices.length > 0 && drafts.length > 0 && "md:grid-cols-2")}>
          {voices.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <UsersRound className="size-4 text-ink-2" aria-hidden />
                  Styles
                </h2>
                <a href="#/styles" className="text-sm text-ink-2 hover:text-ink">
                  All
                </a>
              </div>
              <Card className="divide-y divide-line">
                {voices.slice(0, 6).map((v) => (
                  <a key={v.id} href={`#/styles/${encodeURIComponent(v.id)}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sunken">
                    <span className="min-w-0 flex-1 truncate font-medium">{v.name}</span>
                    {v.metrics?.judge && v.stage === "ready" && (
                      <span className="text-xs text-ink-3 tabular-nums">judge {Math.round((v.metrics.judge.tuned_wins / v.metrics.judge.n) * 100)}%</span>
                    )}
                    <StageBadge stage={v.stage} />
                  </a>
                ))}
              </Card>
              {running.length > 0 && <div className="text-xs text-ink-3">{running.length} in progress. Pages update on their own.</div>}
            </section>
          )}
          {drafts.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold">
                <SquarePen className="size-4 text-ink-2" aria-hidden />
                Recent drafts
              </h2>
              <Card className="divide-y divide-line">
                {drafts.slice(0, 6).map((d, i) => (
                  <a key={i} href="#/write" className="block px-4 py-2.5 text-sm hover:bg-sunken">
                    <div className="line-clamp-1">{d.brief}</div>
                    <div className="text-xs text-ink-3">{d.voiceName}</div>
                  </a>
                ))}
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Choice({ href, icon, title, sub, primary, disabled }: { href: string; icon: ReactNode; title: string; sub: string; primary?: boolean; disabled?: boolean }) {
  return (
    <a
      href={disabled ? undefined : href}
      aria-disabled={disabled}
      className={cx(
        "group flex flex-col gap-3 rounded-(--radius-card) border p-5 transition-colors",
        disabled ? "cursor-not-allowed border-line opacity-60" : "hover:border-line-strong",
        primary && !disabled ? "border-accent bg-accent-soft" : "border-line bg-surface",
      )}
    >
      <span className={cx("flex size-10 items-center justify-center rounded-(--radius-control)", primary && !disabled ? "bg-accent text-white" : "bg-sunken text-ink-2")}>{icon}</span>
      <div>
        <div className="flex items-center gap-1.5 font-semibold">
          {title}
          {!disabled && <ArrowRight className="size-4 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden />}
        </div>
        <div className="mt-0.5 text-sm text-ink-2">{sub}</div>
      </div>
    </a>
  );
}
