import { useEffect, useRef, useState } from "react";
import { CircleAlert, PenLine, Sparkles, Square } from "lucide-react";
import { api } from "../api";
import type { Mode, Voice } from "../api";
import { BASE_MODEL, FRONTIER_LABEL } from "../brand";
import { Button, Card, Dot, EmptyState, PageHeader, Paragraphs, Select, Spinner, Toggle, cx, fmtInt, textareaClass } from "./ui";
import type { Tone } from "./ui";

const EXAMPLES = [
  { label: "Talk to users weekly", prompt: "Write a short post on why founders should talk to users every week." },
  { label: "Default alive vs dead", prompt: "Explain default alive vs default dead to a first-time founder." },
  { label: "Cofounder wants to quit", prompt: "Give advice to a founder whose cofounder wants to quit." },
  { label: "AI and jobs", prompt: "Write a short post on what AI will do to jobs over the next ten years." },
];

type ColStatus = "idle" | "queued" | "streaming" | "done" | "error" | "stopped";
interface Col {
  status: ColStatus;
  text: string;
  tokens?: number;
  tps?: number;
  error?: string;
}
interface Column {
  key: string;
  voice: string;
  mode: Mode;
  title: string;
  tone: Tone;
}

const EMPTY: Col = { status: "idle", text: "" };

function styleFromHash(): string {
  const q = window.location.hash.split("?")[1];
  return new URLSearchParams(q ?? "").get("style") ?? "";
}

export function WriteView({ voices }: { voices: Voice[] }) {
  const ready = voices.filter((v) => v.stage === "ready");
  const [voiceId, setVoiceId] = useState<string>(styleFromHash);
  const [secondId, setSecondId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [frontier, setFrontier] = useState(false);
  const [showBase, setShowBase] = useState(true);
  const [cols, setCols] = useState<Record<string, Col>>({});
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onHash = () => {
      const s = styleFromHash();
      if (s) setVoiceId(s);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!ready.some((v) => v.id === voiceId) && ready.length) setVoiceId(ready[0].id);
  }, [ready, voiceId]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const voice = ready.find((v) => v.id === voiceId);
  const second = ready.find((v) => v.id === secondId && v.id !== voiceId);

  if (!ready.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Benchmark" />
        <EmptyState icon={<PenLine className="size-6" />} title="No trained styles yet">
          <Button className="mt-2" onClick={() => (window.location.hash = "#/styles")}>
            Go to Styles
          </Button>
        </EmptyState>
      </div>
    );
  }

  const columns: Column[] = [
    ...(showBase ? [{ key: "base", voice: voiceId, mode: "base" as Mode, title: `Base ${BASE_MODEL}`, tone: "stock" as Tone }] : []),
    { key: "a", voice: voiceId, mode: "tuned", title: `${voice?.name ?? "Style"} style`, tone: "tuned" },
    ...(second ? [{ key: "b", voice: second.id, mode: "tuned" as Mode, title: `${second.name} style`, tone: "tuned" as Tone }] : []),
    ...(frontier ? [{ key: "frontier", voice: voiceId, mode: "frontier" as Mode, title: FRONTIER_LABEL, tone: "frontier" as Tone }] : []),
  ];

  const patch = (key: string, p: Partial<Col> | ((c: Col) => Partial<Col>)) =>
    setCols((prev) => {
      const cur = prev[key] ?? EMPTY;
      return { ...prev, [key]: { ...cur, ...(typeof p === "function" ? p(cur) : p) } };
    });

  const runOne = async (c: Column, text: string, signal: AbortSignal) => {
    patch(c.key, { status: "queued", text: "", tokens: undefined, tps: undefined, error: undefined });
    try {
      for await (const ev of api.generate({ voice: c.voice, prompt: text, mode: c.mode, max_tokens: 400 }, signal)) {
        if ("t" in ev) patch(c.key, (x) => ({ status: "streaming", text: x.text + ev.t }));
        else if ("error" in ev) {
          patch(c.key, { status: "error", error: ev.error });
          return;
        } else if ("done" in ev) {
          patch(c.key, { status: "done", tokens: ev.tokens, tps: ev.tps });
          return;
        }
      }
      patch(c.key, { status: "done" });
    } catch (err) {
      if (signal.aborted) patch(c.key, { status: "stopped" });
      else patch(c.key, { status: "error", error: err instanceof Error ? err.message : String(err) });
    }
  };

  const generate = async () => {
    const text = prompt.trim();
    if (!text || running || !voice) return;
    const ctl = new AbortController();
    abortRef.current = ctl;
    setRunning(true);
    setCols({});
    // Local columns share one GPU and queue on the server; the frontier call runs beside them.
    await Promise.all(columns.map((c) => runOne(c, text, ctl.signal)));
    setRunning(false);
  };

  const stop = () => abortRef.current?.abort();

  return (
    <div className="space-y-6">
      <PageHeader title="Benchmark" sub="The same prompt, written by each model side by side. Local styles run on this laptop." />

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink-2">Style</span>
            <Select value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
              {ready.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </label>
          {ready.length > 1 && (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink-2">Compare with</span>
              <Select value={second ? secondId : ""} onChange={(e) => setSecondId(e.target.value)}>
                <option value="">None</option>
                {ready
                  .filter((v) => v.id !== voiceId)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </Select>
            </label>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-5">
            <Toggle checked={showBase} onChange={setShowBase} label="Base model" disabled={running} />
            <Toggle checked={frontier} onChange={setFrontier} label={FRONTIER_LABEL} disabled={running} tone="frontier" />
          </div>
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
          className={cx(textareaClass, "mt-4")}
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
                  prompt === ex.prompt ? "border-accent bg-accent-soft text-accent dark:text-accent-hover" : "border-line-strong text-ink-2 hover:bg-sunken hover:text-ink",
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

      <div className={cx("grid gap-4", columns.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : columns.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
        {columns.map((c) => (
          <OutputColumn key={c.key} column={c} col={cols[c.key] ?? EMPTY} />
        ))}
      </div>
    </div>
  );
}

function OutputColumn({ column, col }: { column: Column; col: Col }) {
  return (
    <Card className={cx("flex min-h-72 flex-col", column.mode === "tuned" && "border-tuned/50 ring-1 ring-tuned/25")}>
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Dot tone={column.tone} />
          <span className="truncate text-sm font-semibold">{column.title}</span>
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
            : [col.tokens !== undefined && `${fmtInt(col.tokens)} tokens`, col.tps !== undefined && `${col.tps.toFixed(1)} tok/s`].filter(Boolean).join(" · ") || "Done"}
        </div>
      )}
    </Card>
  );
}
