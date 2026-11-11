import { useEffect, useState } from "react";
import { ArrowRight, Quote, RotateCcw } from "lucide-react";
import type { Sample, Voice } from "../api";
import { BASE_MODEL } from "../brand";
import { Button, Card, Dot, Paragraphs, cx } from "./ui";

type Side = "tuned" | "base";

/** One held-out request at a time: the base model and the tuned style in random order; pick, then see the author's real passage. */
export function BlindTest({ voice, samples }: { voice: Voice; samples: Sample[] }) {
  const [tunedIsA, setTunedIsA] = useState<boolean[]>([]);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Side[]>([]);

  const reset = () => {
    setTunedIsA(samples.map(() => Math.random() < 0.5));
    setIdx(0);
    setPicks([]);
  };
  useEffect(reset, [samples]);

  const tunedPicks = picks.filter((p) => p === "tuned").length;
  const finished = samples.length > 0 && idx >= samples.length;
  const sample = idx < samples.length ? samples[idx] : null;
  const picked: Side | undefined = picks[idx];

  return (
    <div className="space-y-4">
      {picks.length > 0 && (
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm">
            <Dot tone="tuned" />
            <span className="text-ink-2">You picked the style</span>
            <span className="font-semibold tabular-nums">
              {tunedPicks} of {picks.length}
            </span>
          </div>
        </div>
      )}

      {finished && (
        <Card className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <div className="text-sm text-ink-2">You picked the trained style</div>
          <div className="text-6xl font-semibold tracking-tight tabular-nums">
            {tunedPicks}
            <span className="text-ink-3"> / {picks.length}</span>
          </div>
          <div className="text-sm text-ink-3">as more like {voice.name}</div>
          <Button className="mt-4" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden />
            Start over
          </Button>
        </Card>
      )}

      {sample && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-1 flex items-center justify-between text-xs text-ink-3">
              <span>Request</span>
              <span className="tabular-nums">
                {idx + 1} of {samples.length}
              </span>
            </div>
            <div className="text-[15px] font-medium leading-relaxed">{sample.instruction}</div>
          </Card>

          <div className="text-center text-sm font-medium text-ink-2">
            {!picked ? `Which sounds more like ${voice.name}?` : picked === "tuned" ? "You picked the trained style" : "You picked the base model"}
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
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Quote className="size-4 text-ink-3" aria-hidden />
                {voice.name}'s real passage
              </div>
              <Paragraphs text={sample.reference} className="text-ink-2" />
            </Card>
          )}

          {picked && (
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setIdx((i) => i + 1)}>
                {idx + 1 < samples.length ? "Next" : "See score"}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Option({ letter, side, text, revealed, chosen, onPick }: { letter: "A" | "B"; side: Side; text: string; revealed: boolean; chosen: boolean; onPick: () => void }) {
  return (
    <Card className={cx("flex flex-col transition-colors", revealed && side === "tuned" && "border-tuned/60", chosen && "ring-2 ring-accent", !revealed && "hover:border-line-strong")}>
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-sunken text-sm font-semibold">{letter}</span>
          {revealed && (
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Dot tone={side === "tuned" ? "tuned" : "stock"} />
              {side === "tuned" ? "Trained style" : `Base ${BASE_MODEL}`}
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
