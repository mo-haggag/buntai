import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { fmtInt } from "./ui";

interface Point {
  step: number;
  loss: number;
}

function niceStep(span: number, count: number) {
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}

function niceTicks(min: number, max: number, count: number) {
  if (max - min < 1e-9) {
    min -= 0.5;
    max += 0.5;
  }
  const step = niceStep(max - min, count);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v / step) * step);
  return { lo, hi, ticks, step };
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

// Exponential moving average with bias correction (as in TensorBoard).
function smooth(values: number[], weight: number) {
  const out: number[] = [];
  let acc = 0;
  values.forEach((v, i) => {
    acc = acc * weight + (1 - weight) * v;
    out.push(acc / (1 - weight ** (i + 1)));
  });
  return out;
}

const H = 220;
const M = { top: 14, right: 52, bottom: 26, left: 40 };

export function LossChart({ steps, totalSteps }: { steps: Point[]; totalSteps: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const last = steps[steps.length - 1];
  const xMax = Math.max(totalSteps, last?.step ?? 1, 1);
  const losses = steps.map((p) => p.loss);
  const y = niceTicks(
    losses.length ? Math.min(...losses) : 0,
    losses.length ? Math.max(...losses) : 1,
    4,
  );
  const xTick = niceStep(xMax, 4);
  const xTicks: number[] = [];
  for (let v = 0; v <= xMax + 1e-9; v += xTick) xTicks.push(v);

  const iw = Math.max(0, width - M.left - M.right);
  const ih = H - M.top - M.bottom;
  const sx = (s: number) => M.left + (s / xMax) * iw;
  const sy = (l: number) => M.top + (1 - (l - y.lo) / (y.hi - y.lo)) * ih;

  // Per-step loss is noisy: draw it faint and put a smoothed line on top.
  const smoothed = steps.length >= 20;
  const ema = smoothed ? smooth(losses, 0.85) : losses;
  const path = (vals: number[]) =>
    steps.map((p, i) => `${i ? "L" : "M"}${sx(p.step).toFixed(1)},${sy(vals[i]).toFixed(1)}`).join("");
  const line = path(ema);
  const raw = smoothed ? path(losses) : "";
  const area =
    steps.length > 1
      ? `${line}L${sx(last.step).toFixed(1)},${M.top + ih}L${sx(steps[0].step).toFixed(1)},${M.top + ih}Z`
      : "";
  const lastY = ema[ema.length - 1];

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    if (!steps.length) return;
    const box = e.currentTarget.getBoundingClientRect();
    const s = ((e.clientX - box.left) / box.width) * xMax;
    let best = 0;
    for (let i = 1; i < steps.length; i++) {
      if (Math.abs(steps[i].step - s) < Math.abs(steps[best].step - s)) best = i;
    }
    setHover(best);
  };

  const hp = hover !== null ? steps[hover] : null;
  const decimals = y.step < 0.1 ? 3 : 2;

  return (
    <div>
    <div className="mb-1 flex items-center justify-between text-xs text-ink-3">
      <span>Training loss</span>
      {smoothed && (
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 rounded bg-tuned" />
            Smoothed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-px w-3 bg-tuned/40" />
            Per step
          </span>
        </span>
      )}
    </div>
    <div ref={ref} className="relative w-full select-none" style={{ height: H }}>
      {width > 0 && (
        <svg width={width} height={H} className="block overflow-visible" role="img" aria-label="Training loss by step">
          {y.ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + iw} y1={sy(t)} y2={sy(t)} className="stroke-line" strokeWidth={1} />
              <text
                x={M.left - 8}
                y={sy(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-ink-3 text-[11px] tabular-nums"
              >
                {t.toFixed(y.step < 0.1 ? 2 : 1)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text
              key={t}
              x={sx(t)}
              y={H - 6}
              textAnchor={t === 0 ? "start" : t >= xMax ? "end" : "middle"}
              className="fill-ink-3 text-[11px] tabular-nums"
            >
              {fmtInt(t)}
            </text>
          ))}

          {area && <path d={area} className="fill-tuned" fillOpacity={0.08} />}
          {raw && (
            <path
              d={raw}
              fill="none"
              className="stroke-tuned"
              strokeOpacity={0.3}
              strokeWidth={1.25}
              strokeLinejoin="round"
            />
          )}
          {steps.length > 0 && (
            <path
              d={line}
              fill="none"
              className="stroke-tuned"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {last && (
            <>
              <circle cx={sx(last.step)} cy={sy(lastY)} r={4} className="fill-tuned stroke-surface" strokeWidth={2} />
              <text
                x={sx(last.step) + 9}
                y={sy(lastY)}
                dy="0.32em"
                className="fill-ink text-[12px] font-medium tabular-nums"
              >
                {lastY.toFixed(decimals)}
              </text>
            </>
          )}

          {hp && (
            <>
              <line
                x1={sx(hp.step)}
                x2={sx(hp.step)}
                y1={M.top}
                y2={M.top + ih}
                className="stroke-ink-3"
                strokeWidth={1}
              />
              <circle cx={sx(hp.step)} cy={sy(ema[hover!])} r={4} className="fill-tuned stroke-surface" strokeWidth={2} />
            </>
          )}

          <rect
            x={M.left}
            y={M.top}
            width={iw}
            height={ih}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      )}

      {steps.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-3">
          Waiting for first step
        </div>
      )}

      {hp && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-sm"
          style={{
            left: Math.min(sx(hp.step) + 10, width - 110),
            top: Math.max(0, sy(ema[hover!]) - (smoothed ? 64 : 46)),
          }}
        >
          <div className="text-sm font-semibold tabular-nums text-ink">{ema[hover!].toFixed(3)}</div>
          {smoothed && <div className="text-ink-3 tabular-nums">Step loss {hp.loss.toFixed(3)}</div>}
          <div className="flex items-center gap-1.5 text-ink-3">
            <span className="inline-block h-0.5 w-3 rounded bg-tuned" />
            Step {fmtInt(hp.step)}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
