import { useEffect, useState } from "react";
import { Cpu, Download, HardDrive, Package } from "lucide-react";
import { api } from "../api";
import type { Machine as MachineInfo, MachineModel } from "../api";
import { Button, Card, ErrorNote, PageHeader, Spinner, Stat, cx, fmtInt } from "./ui";

export function Machine() {
  const [m, setM] = useState<MachineInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState<string | null>(null);

  const load = () =>
    api
      .getMachine()
      .then((x) => {
        setM(x);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const download = async (id: string) => {
    setStarting(id);
    try {
      await api.downloadModel(id);
      await load();
    } finally {
      setStarting(null);
    }
  };

  if (error && !m) return <ErrorNote onRetry={load}>{error}</ErrorNote>;
  if (!m)
    return (
      <div className="flex items-center gap-2 py-10 text-ink-3">
        <Spinner /> Reading the machine
      </div>
    );

  const g = m.gpu;
  const vramPct = g ? (g.vram_used_mb / g.vram_total_mb) * 100 : 0;
  const vramGb = g ? g.vram_total_mb / 1024 : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Machine" sub="Everything Buntai runs on is on this computer. Nothing is rented." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2 font-semibold">
            <Cpu className="size-4 text-ink-2" aria-hidden />
            GPU
          </div>
          {g ? (
            <>
              <div className="text-sm">{g.name}</div>
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="text-ink-2">Memory</span>
                  <span className="tabular-nums">
                    {(g.vram_used_mb / 1024).toFixed(1)} <span className="text-ink-3">of {vramGb.toFixed(0)} GB</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-line">
                  <div className={cx("h-full rounded-full", vramPct > 85 ? "bg-bad" : "bg-accent")} style={{ width: `${vramPct}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Load" value={`${g.util}%`} />
                <Stat label="Power" value={`${Math.round(g.power_w)} W`} />
                <Stat label="Temperature" value={`${g.temp_c}°C`} />
              </div>
              <div className="rounded-(--radius-control) bg-sunken px-3 py-2 text-sm text-ink-2">
                {m.busy ? `Training or evaluating ${m.busy_name ?? m.busy}.` : m.model_loaded ? `${m.base_model} is loaded and ready to write.` : "Idle. The model loads on the first request."}
              </div>
            </>
          ) : (
            <div className="text-sm text-bad">No NVIDIA GPU found. Training needs one with 8 GB or more.</div>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2 font-semibold">
            <HardDrive className="size-4 text-ink-2" aria-hidden />
            Disk
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Free where models live" value={`${fmtInt(m.disk.models_free_gb)} GB`} sub={`of ${fmtInt(m.disk.models_total_gb)} GB`} />
            <Stat label="Free in the project" value={`${m.disk.project_free_gb.toFixed(1)} GB`} sub={`of ${m.disk.project_total_gb.toFixed(1)} GB`} />
          </div>
          <div className="text-sm text-ink-2">
            A style adapter is about 130 MB. Collected writing and training pairs take a few MB per style.
          </div>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          <Package className="size-4 text-ink-2" aria-hidden />
          Base models
        </div>
        <div className="text-sm text-ink-2">
          Every style is an adapter on one of these. Picked for this GPU's {vramGb.toFixed(0)} GB: training a model needs its weights plus room for gradients; serving needs the weights.
        </div>
        <Card className="divide-y divide-line">
          {m.models.map((row) => (
            <ModelRow key={row.id} model={row} starting={starting === row.id} onDownload={() => download(row.id)} />
          ))}
        </Card>
      </section>
    </div>
  );
}

function ModelRow({ model: r, starting, onDownload }: { model: MachineModel; starting: boolean; onDownload: () => void }) {
  const dl = r.download;
  const pct = dl ? Math.min(100, (dl.downloaded_gb / r.size_gb) * 100) : 0;
  return (
    <div className="grid items-center gap-3 px-4 py-3 text-sm sm:grid-cols-[1.4fr_1fr_1fr_auto]">
      <div>
        <div className="flex flex-wrap items-center gap-2 font-medium">
          {r.repo.split("/")[1]}
          {r.active && <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-medium text-good">Active</span>}
          {r.recommended && !r.active && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent dark:text-accent-hover">Recommended</span>}
        </div>
        <div className="text-xs text-ink-3">
          {r.params} parameters · {r.size_gb} GB on disk · {r.repo}
        </div>
      </div>
      <div>
        <div className="text-xs text-ink-3">Needs</div>
        <div className="tabular-nums">
          <span className={cx(!r.fits_training && "text-bad")}>train {r.train_vram_gb} GB</span>
          <span className="text-ink-3"> · </span>
          <span className={cx(!r.fits_serving && "text-bad")}>serve {r.serve_vram_gb} GB</span>
        </div>
      </div>
      <div>
        <div className="text-xs text-ink-3">On this machine</div>
        {r.present ? (
          <div className="text-good">Installed</div>
        ) : dl && dl.state === "running" ? (
          <div>
            <div className="tabular-nums">{dl.downloaded_gb.toFixed(1)} of {r.size_gb} GB</div>
            <div className="mt-1 h-1.5 w-40 rounded-full bg-line">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : dl && dl.state === "error" ? (
          <div className="text-bad">Download failed</div>
        ) : (
          <div className="text-ink-3">Not installed</div>
        )}
      </div>
      <div className="sm:justify-self-end">
        {!r.present && (!dl || dl.state !== "running") && (
          <Button className="h-8" onClick={onDownload} disabled={starting || !r.fits_serving}>
            <Download className="size-4" aria-hidden />
            {starting ? "Starting" : "Download"}
          </Button>
        )}
      </div>
    </div>
  );
}
