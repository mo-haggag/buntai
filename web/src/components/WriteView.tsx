import { useEffect, useRef, useState } from "react";
import { CircleAlert, PenLine, Sparkles, Square } from "lucide-react";
import { api } from "../api";
import type { Mode, Voice } from "../api";
import { Button, Card, Dot, EmptyState, Paragraphs, Spinner, cx, fmtInt } from "./ui";

const EXAMPLES = [
  { label: "Talk to users weekly", prompt: "Write a short post on why founders should talk to users every week." },
  { label: "Default alive vs dead", prompt: "Explain default alive vs default dead to a first-time founder." },
  { label: "Cofounder wants to quit", prompt: "Give advice to a founder whose cofounder wants to quit." },
  { label: "Demo day pitch", prompt: "Write a short post on what makes a great demo day pitch." },
];

type ColStatus = "idle" | "queued" | "streaming" | "done" | "error" | "stopped";
interface Col {
  status: ColStatus;
  text: string;
  tokens?: number;
  tps?: number;
  error?: string;
}

const EMPTY: Col = { status: "idle", text: "" };
const tone: Record<Mode, "stock" | "tuned" | "frontier"> = { base: "stock", tuned: "tuned", frontier: "frontier" };

export function WriteView({ voices, onGoVoices }: { voices: Voice[]; onGoVoices: () => void }) {
  const ready = voices.filter((v) => v.stage === "ready");
  const [voiceId, setVoiceId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [frontier, setFrontier] = useState(false);
  const [cols, setCols] = useState<Record<Mode, Col>>({ base: EMPTY, tuned: EMPTY, frontier: EMPTY });
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ready.some((v) => v.id === voiceId) && ready.length) setVoiceId(ready[0].id);
  }, [ready, voiceId]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const voice = ready.find((v) => v.id === voiceId);

  if (!ready.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Write</h1>
        <EmptyState icon={<PenLine className="size-6" />} title="No ready voices">
          <Button className="mt-2" onClick={onGoVoices}>
            Go to Voices
          </Button>
        </EmptyState>
      </div>
    );
  }

  const patch = (mode: Mode, p: Partial<Col> | ((c: Col) => Partial<Col>)) =>
    setCols((prev) => ({ ...prev, [mode]: { ...prev[mode], ...(typeof p === "function" ? p(prev[mode]) : p) } }));

  const runOne = async (mode: Mode, text: string, signal: AbortSignal) => {
    patch(mode, { status: "queued", text: "", tokens: undefined, tps: undefined, error: undefined });
    try {
      for await (const ev of api.generate({ voice: voiceId, prompt: text, mode }, signal)) {
        if ("t" in ev) patch(mode, (c) => ({ status: "streaming", text: c.text + ev.t }));
        else if ("error" in ev) {
          patch(mode, { status: "error", error: ev.error });
          return;
        } else if ("done" in ev) {
          patch(mode, { status: "done", tokens: ev.tokens, tps: ev.tps });
          return;
        }
      }
      patch(mode, { status: "done" });
    } catch (err) {
      if (signal.aborted) patch(mode, { status: "stopped" });
      else patch(mode, { status: "error", error: err instanceof Error ? err.message : String(err) });
    }
  };

  const generate = async () => {
    const text = prompt.trim();
    if (!text || running || !voice) return;
    const ctl = new AbortController();
    abortRef.current = ctl;
    setRunning(true);
    const modes: Mode[] = frontier ? ["base", "tuned", "frontier"] : ["base", "tuned"];
    if (!frontier) patch("frontier", EMPTY);
    await Promise.all(modes.map((m) => runOne(m, text, ctl.signal)));
    setRunning(false);
  };

  const stop = () => abortRef.current?.abort();

  const shown: Mode[] = frontier ? ["base", "tuned", "frontier"] : ["base", "tuned"];
  const title: Record<Mode, string> = {
    base: "Base Qwen3-VL-4B",
    tuned: `${voice?.name ?? "Tuned"} voice (tuned)`,
    frontier: "GPT-5.5 imitating",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Write</h1>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink-2">Voice</span>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="h-9 rounded-lg border border-line-strong bg-surface px-2.5 text-sm font-medium text-ink focus:border-accent focus:outline-none"
            >
              {ready.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <Toggle checked={frontier} onChange={setFrontier} label="GPT-5.5 imitating" disabled={running} />
        </div>

        <textarea
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              generate();
            }
          }}
          rows={3}
          placeholder="What should it write?"
          className="mt-4 w-full resize-y rounded-lg border border-line-strong bg-surface px-3.5 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => {
                  setPrompt(ex.prompt);
                  inputRef.current?.focus();
                }}
                className={cx(
                  "h-8 rounded-full border px-3 text-sm transition-colors",
                  prompt === ex.prompt
                    ? "border-accent bg-accent-soft text-accent dark:text-accent-hover"
                    : "border-line-strong text-ink-2 hover:bg-sunken hover:text-ink",
                )}
              >
                {ex.label}
              </button>
            ))}
          </div>
          {running ? (
            <Button onClick={stop}>
              <Square className="size-3.5 fill-current" aria-hidden />
              Stop
            </Button>
          ) : (
            <Button variant="primary" onClick={generate} disabled={!prompt.trim()}>
              <Sparkles className="size-4" aria-hidden />
              Generate
            </Button>
          )}
        </div>
      </Card>

      <div className={cx("grid gap-4", shown.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
        {shown.map((m) => (
          <OutputColumn key={m} mode={m} title={title[m]} col={cols[m]} />
        ))}
      </div>
    </div>
  );
}

function OutputColumn({ mode, title, col }: { mode: Mode; title: string; col: Col }) {
  return (
    <Card className={cx("flex min-h-72 flex-col", mode === "tuned" && "border-tuned/50 ring-1 ring-tuned/25")}>
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Dot tone={tone[mode]} />
          <span className="truncate text-sm font-semibold">{title}</span>
        </div>
        {(col.status === "queued" || col.status === "streaming") && (
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink-3">
            <Spinner className="size-3.5" />
            {col.status === "queued" ? "Queued" : "Writing"}
          </span>
        )}
      </div>
      <div className="flex-1 px-4 py-4">
        {col.status === "idle" && <div className="text-sm text-ink-3">No output yet</div>}
        {col.text && <Paragraphs text={col.text} caret={col.status === "streaming"} />}
        {col.status === "error" && (
          <div className="mt-2 flex items-start gap-2 text-sm text-bad">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {col.error}
          </div>
        )}
      </div>
      {(col.status === "done" || col.status === "stopped") && (
        <div className="border-t border-line px-4 py-2.5 text-xs text-ink-3 tabular-nums">
          {col.status === "stopped"
            ? "Stopped"
            : [
                col.tokens !== undefined && `${fmtInt(col.tokens)} tokens`,
                col.tps !== undefined && `${col.tps.toFixed(1)} tok/s`,
              ]
                .filter(Boolean)
                .join(" · ") || "Done"}
        </div>
      )}
    </Card>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-sm text-ink-2 hover:text-ink disabled:opacity-50"
    >
      <span
        className={cx(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-frontier" : "bg-line-strong",
        )}
      >
        <span
          className={cx(
            "inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}
