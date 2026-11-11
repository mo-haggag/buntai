import { useEffect, useState } from "react";
import { ArrowRight, CircleAlert, Quote, RotateCcw, Scale } from "lucide-react";
import { api } from "../api";
import type { Sample, Voice } from "../api";
import { Button, Card, Dot, EmptyState, Paragraphs, Spinner, cx } from "./ui";

type Side = "tuned" | "base";

export function BlindTest({ voices, onGoVoices }: { voices: Voice[]; onGoVoices: () => void }) {
  const ready = voices.filter((v) => v.stage === "ready");
  const [voiceId, setVoiceId] = useState("");
  const [samples, setSamples] = useState<Sample[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tunedIsA, setTunedIsA] = useState<boolean[]>([]);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Side[]>([]);

  useEffect(() => {
    if (!ready.some((v) => v.id === voiceId) && ready.length) setVoiceId(ready[0].id);
  }, [ready, voiceId]);

  const load = (id: string) => {
    setSamples(null);
    setError(null);
    setIdx(0);
    setPicks([]);
    api
      .getSamples(id)
      .then((s) => {
        setTunedIsA(s.map(() => Math.random() < 0.5));
        setSamples(s);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  };

  useEffect(() => {
    if (voiceId) load(voiceId);
  }, [voiceId]);

  const voice = ready.find((v) => v.id === voiceId);

  if (!ready.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Blind test</h1>
        <EmptyState icon={<Scale className="size-6" />} title="No ready voices">
          <Button className="mt-2" onClick={onGoVoices}>
            Go to Voices
          </Button>
        </EmptyState>
      </div>
    );
  }

  const tunedPicks = picks.filter((p) => p === "tuned").length;
  const finished = samples !== null && samples.length > 0 && idx >= samples.length;
  const sample = samples && idx < samples.length ? samples[idx] : null;
  const picked: Side | undefined = picks[idx];

  return (
    <div className="space-y-6">
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Blind test</h1>
          {ready.length > 1 && (
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
          )}
        </div>
        {picks.length > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm">
            <Dot tone="tuned" />
            <span className="text-ink-2">You picked tuned</span>
            <span className="font-semibold tabular-nums">
              {tunedPicks} of {picks.length}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="flex-1">{error}</span>
          <button className="font-medium underline" onClick={() => load(voiceId)}>
            Retry
          </button>
        </div>
      )}

      {!samples && !error && (
        <div className="flex items-center gap-2 py-16 text-ink-3">
          <Spinner /> Loading samples
        </div>
      )}

      {samples && samples.length === 0 && (
        <EmptyState icon={<Scale className="size-6" />} title="No held-out samples yet" />
      )}

      {finished && (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <div className="text-sm text-ink-2">You picked the tuned voice</div>
          <div className="text-6xl font-semibold tracking-tight">
            {tunedPicks}
            <span className="text-ink-3"> / {picks.length}</span>
          </div>
          <div className="text-sm text-ink-3">as more like {voice?.name}</div>
          <Button className="mt-4" onClick={() => load(voiceId)}>
            <RotateCcw className="size-4" aria-hidden />
            Start over
          </Button>
        </Card>
      )}

      {sample && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-ink-3">
              <span>Prompt</span>
              <span className="tabular-nums">
                Sample {idx + 1} of {samples!.length}
              </span>
            </div>
            <div className="text-[15px] font-medium leading-relaxed">{sample.instruction}</div>
          </Card>

          <div className="text-center text-sm font-medium text-ink-2">
            {!picked
              ? `Which sounds more like ${voice?.name}?`
              : picked === "tuned"
                ? "You picked the tuned voice"
                : "You picked the base model"}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(["A", "B"] as const).map((letter) => {
              const side: Side = (letter === "A") === tunedIsA[idx] ? "tuned" : "base";
              return (
                <Option
                  key={letter}
                  letter={letter}
                  side={side}
                  text={side === "tuned" ? sample.tuned : sample.base}
                  revealed={!!picked}
                  chosen={picked === side}
                  onPick={() =>
                    setPicks((p) => {
                      const next = [...p];
                      next[idx] = side;
                      return next;
                    })
                  }
                />
              );
            })}
          </div>

          {picked && (
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Quote className="size-4 text-ink-3" aria-hidden />
                {voice?.name}'s real passage
              </div>
              <Paragraphs text={sample.reference} className="text-ink-2" />
            </Card>
          )}

          {picked && (
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setIdx((i) => i + 1)}>
                {idx + 1 < samples!.length ? "Next" : "See score"}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Option({
  letter,
  side,
  text,
  revealed,
  chosen,
  onPick,
}: {
  letter: "A" | "B";
  side: Side;
  text: string;
  revealed: boolean;
  chosen: boolean;
  onPick: () => void;
}) {
  return (
    <Card
      className={cx(
        "flex flex-col transition-colors",
        revealed && side === "tuned" && "border-tuned/60",
        chosen && "ring-2 ring-accent",
        !revealed && "hover:border-line-strong",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-sunken text-sm font-semibold">
            {letter}
          </span>
          {revealed && (
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Dot tone={side === "tuned" ? "tuned" : "stock"} />
              {side === "tuned" ? "Tuned voice" : "Base Qwen3-VL-4B"}
            </span>
          )}
        </div>
        {chosen && <span className="text-xs font-medium text-accent dark:text-accent-hover">Your pick</span>}
      </div>
      <div className="flex-1 px-4 py-4">
        <Paragraphs text={text} />
      </div>
      {!revealed && (
        <div className="border-t border-line px-4 py-3">
          <Button className="w-full" onClick={onPick}>
            Pick {letter}
          </Button>
        </div>
      )}
    </Card>
  );
}
