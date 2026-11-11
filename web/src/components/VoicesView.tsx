import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, ChevronRight, Mic, Plus, X } from "lucide-react";
import { api } from "../api";
import type { Voice } from "../api";
import { Button, Card, EmptyState, Progress, StageBadge, cx, fmtCompact, hostOf, isRunning } from "./ui";

export function VoicesView({
  voices,
  loaded,
  onOpen,
  onCreated,
}: {
  voices: Voice[];
  loaded: boolean;
  onOpen: (id: string) => void;
  onCreated: (id: string) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Voices</h1>
        {!formOpen && (
          <Button variant="primary" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New voice
          </Button>
        )}
      </div>

      {formOpen && (
        <NewVoiceForm
          onCancel={() => setFormOpen(false)}
          onCreated={(id) => {
            setFormOpen(false);
            onCreated(id);
          }}
        />
      )}

      {loaded && voices.length === 0 && !formOpen && (
        <EmptyState icon={<Mic className="size-6" />} title="No voices yet">
          Add a blog to train a voice.
        </EmptyState>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {voices.map((v) => (
          <VoiceCard key={v.id} voice={v} onOpen={() => onOpen(v.id)} />
        ))}
      </div>
    </div>
  );
}

function VoiceCard({ voice: v, onOpen }: { voice: Voice; onOpen: () => void }) {
  const ppl = v.metrics?.ppl_base && v.metrics?.ppl_tuned ? v.metrics : null;
  return (
    <button
      onClick={onOpen}
      className={cx(
        "group flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 text-left transition-colors",
        "hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">{v.name}</div>
          <div className="truncate text-sm text-ink-3">{hostOf(v.source)}</div>
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
    </button>
  );
}

function NewVoiceForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    let s = source.trim();
    if (!n || !s) return;
    if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
    setBusy(true);
    setError(null);
    try {
      const { id } = await api.createVoice(n, s);
      onCreated(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  const input =
    "h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">New voice</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-1 text-ink-3 hover:bg-sunken hover:text-ink"
            title="Close"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_1.6fr]">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-ink-2">Name</span>
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Garry Tan"
              autoFocus
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-ink-2">Blog URL</span>
            <input
              className={input}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="https://blog.garrytan.com"
              inputMode="url"
            />
          </label>
        </div>
        {error && <div className="text-sm text-bad">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={busy || !name.trim() || !source.trim()}>
            {busy ? "Starting" : "Create voice"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
