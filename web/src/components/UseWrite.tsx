import { useEffect, useRef, useState } from "react";
import { Check, Copy, RotateCcw, Square, SquarePen, TextCursor } from "lucide-react";
import { api } from "../api";
import type { Voice } from "../api";
import { Markdown } from "./Markdown";
import { Button, Card, EmptyState, PageHeader, Select, Spinner, cx, textareaClass } from "./ui";

type Length = "short" | "medium" | "long";
const LENGTH: Record<Length, { label: string; tokens: number; hint: string }> = {
  short: { label: "Short", tokens: 260, hint: "a few paragraphs" },
  medium: { label: "Medium", tokens: 550, hint: "a short post" },
  long: { label: "Long", tokens: 1000, hint: "a full post" },
};

interface Draft {
  id: string;
  voice: string;
  voiceName: string;
  brief: string;
  text: string;
  at: number;
}

const KEY = "buntai-drafts";
const loadDrafts = (): Draft[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

function styleFromHash(): string {
  const q = window.location.hash.split("?")[1];
  return new URLSearchParams(q ?? "").get("style") ?? "";
}

function composePrompt(brief: string, material: string, length: Length): string {
  const parts = [brief.trim()];
  if (material.trim()) parts.push("Work from this material:\n\n" + material.trim());
  parts.push(`Length: ${LENGTH[length].hint}.`);
  return parts.join("\n\n");
}

export function UseWrite({ voices, busy }: { voices: Voice[]; busy: string | null }) {
  const ready = voices.filter((v) => v.stage === "ready");
  const [voiceId, setVoiceId] = useState<string>(styleFromHash);
  const [brief, setBrief] = useState("");
  const [material, setMaterial] = useState("");
  const [showMaterial, setShowMaterial] = useState(false);
  const [length, setLength] = useState<Length>("medium");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "writing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>(loadDrafts);
  const abortRef = useRef<AbortController | null>(null);

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

  if (!ready.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Write" />
        <EmptyState icon={<SquarePen className="size-6" />} title="No trained style yet">
          <Button className="mt-2" onClick={() => (window.location.hash = "#/new")}>
            Train one
          </Button>
        </EmptyState>
      </div>
    );
  }

  const generate = async () => {
    if (!brief.trim() || status === "writing" || !voice) return;
    const ctl = new AbortController();
    abortRef.current = ctl;
    setStatus("writing");
    setError(null);
    setEditing(false);
    setText("");
    let out = "";
    try {
      for await (const ev of api.generate(
        { voice: voice.id, prompt: composePrompt(brief, material, length), mode: "tuned", max_tokens: LENGTH[length].tokens },
        ctl.signal,
      )) {
        if ("t" in ev) {
          out += ev.t;
          setText(out);
        } else if ("error" in ev) {
          setError(ev.error);
          setStatus("error");
          return;
        }
      }
      setStatus("done");
      const d: Draft = { id: String(Date.now()), voice: voice.id, voiceName: voice.name, brief: brief.trim(), text: out, at: Date.now() };
      const next = [d, ...drafts].slice(0, 20);
      setDrafts(next);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch (e) {
      if (ctl.signal.aborted) setStatus("done");
      else {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Write" sub={voice ? `As ${voice.name}, on this laptop.` : undefined} />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* The brief */}
        <div className="space-y-4">
          <Card className="space-y-4 p-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink-2">Style</span>
              <Select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className="w-full">
                {ready.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink-2">What to write</span>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    generate();
                  }
                }}
                rows={5}
                placeholder="A short post for first-time founders on why talking to users every week matters more than the roadmap."
                className={textareaClass}
              />
            </label>
            {showMaterial ? (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink-2">Material</span>
                <textarea value={material} onChange={(e) => setMaterial(e.target.value)} rows={6} placeholder="Notes, bullet points, or a draft to rewrite." className={textareaClass} />
              </label>
            ) : (
              <button type="button" onClick={() => setShowMaterial(true)} className="text-sm text-ink-2 underline-offset-2 hover:text-ink hover:underline">
                Add material (notes or a draft)
              </button>
            )}
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-ink-2">Length</span>
              <div className="flex gap-2">
                {(Object.keys(LENGTH) as Length[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setLength(k)}
                    className={cx(
                      "h-8 flex-1 rounded-(--radius-control) border text-sm transition-colors",
                      length === k ? "border-accent bg-accent-soft text-accent dark:text-accent-hover" : "border-line-strong text-ink-2 hover:bg-sunken",
                    )}
                  >
                    {LENGTH[k].label}
                  </button>
                ))}
              </div>
            </div>
            {busy && <div className="rounded-(--radius-control) bg-sunken px-3 py-2 text-xs text-ink-2">The GPU is training {busy}. Writing resumes when it finishes.</div>}
            {status === "writing" ? (
              <Button className="w-full" onClick={() => abortRef.current?.abort()}>
                <Square className="size-3.5 fill-current" aria-hidden />
                Stop
              </Button>
            ) : (
              <Button variant="primary" className="w-full" onClick={generate} disabled={!brief.trim() || !!busy}>
                <SquarePen className="size-4" aria-hidden />
                {status === "done" || status === "error" ? "Write again" : "Write"}
              </Button>
            )}
          </Card>

          {drafts.length > 0 && (
            <Card className="divide-y divide-line">
              <div className="px-4 py-2.5 text-xs font-medium text-ink-3">Recent drafts</div>
              {drafts.slice(0, 6).map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setText(d.text);
                    setBrief(d.brief);
                    setStatus("done");
                    setEditing(false);
                    if (ready.some((v) => v.id === d.voice)) setVoiceId(d.voice);
                  }}
                  className="block w-full px-4 py-2.5 text-left hover:bg-sunken"
                >
                  <div className="line-clamp-1 text-sm">{d.brief}</div>
                  <div className="text-xs text-ink-3">
                    {d.voiceName} · {new Date(d.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </button>
              ))}
            </Card>
          )}
        </div>

        {/* The document */}
        <Card className="flex min-h-[520px] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <div className="flex items-center gap-2 text-sm text-ink-2">
              {status === "writing" && (
                <>
                  <Spinner className="size-3.5" /> Writing
                </>
              )}
              {status === "done" && <span className="tabular-nums">{words} words</span>}
              {status === "idle" && <span>Draft</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" className="h-8 px-2.5" onClick={() => setEditing((e) => !e)} disabled={!text || status === "writing"} title={editing ? "Done editing" : "Edit"}>
                {editing ? <Check className="size-4" aria-hidden /> : <TextCursor className="size-4" aria-hidden />}
                {editing ? "Done" : "Edit"}
              </Button>
              <Button variant="ghost" className="h-8 px-2.5" onClick={copy} disabled={!text} title="Copy as markdown">
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" className="h-8 px-2.5" onClick={generate} disabled={!brief.trim() || status === "writing" || !!busy} title="Regenerate">
                <RotateCcw className="size-4" aria-hidden />
                Again
              </Button>
            </div>
          </div>
          <div className="flex-1 px-6 py-5">
            {!text && status !== "writing" && <div className="text-sm text-ink-3">{error ?? "The draft appears here."}</div>}
            {error && text && <div className="mb-3 text-sm text-bad">{error}</div>}
            {editing ? (
              <textarea value={text} onChange={(e) => setText(e.target.value)} className={cx(textareaClass, "min-h-[460px] font-mono text-[13px]")} />
            ) : (
              text && <Markdown text={text} caret={status === "writing"} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
