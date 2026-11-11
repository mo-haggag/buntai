import { mockApi } from "./mock";

export type Stage = "idle" | "collect" | "build" | "train" | "eval" | "ready" | "error";

export interface Judge {
  tuned_wins: number;
  base_wins: number;
  frontier_wins?: number;
  n: number;
  judge_model: string;
  frontier_model?: string;
}

export interface Metrics {
  ppl_base?: number;
  ppl_tuned?: number;
  ppl_by_epoch?: number[];
  best_epoch?: number;
  train_seconds?: number;
  judge?: Judge;
}

export interface Run {
  id: string;
  created: number | null;
  epochs?: number;
  rank?: number;
  lr?: number;
  train_pairs?: number;
  total_steps?: number;
  has_adapter: boolean;
  judged: boolean;
  metrics: Metrics;
}

export interface Train {
  run?: string;
  steps: { step: number; loss: number }[];
  epoch_ends?: { epoch: number; ppl: number; step: number }[];
  total_steps: number;
  epoch?: number;
  epochs?: number;
  seconds?: number;
  best_epoch?: number;
}

export interface Voice {
  id: string;
  name: string;
  source: string;
  source_kind?: "url" | "files";
  stage: Stage;
  progress?: { label: string; done: number; total: number };
  stats?: {
    posts?: number;
    words?: number;
    posts_kept?: number;
    passages?: number;
    train?: number;
    eval?: number;
    train_words?: number;
  };
  active_run?: string | null;
  train?: Train;
  metrics?: Metrics;
  runs?: Run[];
  error?: string;
}

export interface PostRow {
  title: string;
  url: string;
  words: number;
  why?: string;
}

export interface Pair {
  title: string;
  url: string;
  passage: string;
  requests: string[];
}

export interface DataView {
  kept_posts: PostRow[];
  dropped_posts: PostRow[];
  excluded?: string[];
  passages?: number;
  passages_total?: number;
  train?: number;
  eval?: number;
  train_words?: number;
  pairs: Pair[];
}

export interface Sample {
  instruction: string;
  reference: string;
  base: string;
  tuned: string;
  frontier?: string;
  votes?: (string | null)[];
  title?: string;
  url?: string;
}

export interface MachineModel {
  id: string;
  repo: string;
  params: string;
  size_gb: number;
  train_vram_gb: number;
  serve_vram_gb: number;
  present: boolean;
  active: boolean;
  size_on_disk_gb: number;
  fits_training: boolean;
  fits_serving: boolean;
  recommended: boolean;
  typical_style_minutes: number | null;
  download: { state: "running" | "done" | "error"; downloaded_gb: number; started: number } | null;
}

export interface Machine {
  gpu: { name: string; vram_total_mb: number; vram_used_mb: number; util: number; temp_c: number; power_w: number } | null;
  busy: string | null;
  busy_name?: string | null;
  busy_stage?: string | null;
  busy_progress?: Voice["progress"] | null;
  ram?: { total_gb: number; available_gb: number } | null;
  styles_on_disk?: { adapters: number; adapters_gb: number; checkpoints_gb: number; corpora_mb: number };
  model_loaded: boolean;
  base_model: string;
  disk: { project_free_gb: number; project_total_gb: number; models_free_gb: number; models_total_gb: number };
  models: MachineModel[];
}

export interface Job {
  voice: string;
  name: string;
  stage: Stage | null;
  progress?: Voice["progress"];
  since?: number | null;
  run?: string | null;
}

export interface JobEnd {
  voice: string;
  name: string;
  stage: string;
  at: number;
  ok: boolean;
  seconds?: number;
  exit?: number;
  run?: string;
}

export interface Jobs {
  active: Job[];
  queued: Job[];
  recent: JobEnd[];
  gpu_busy: string | null;
}

export type Mode = "base" | "tuned" | "frontier";

export interface GenRequest {
  voice: string;
  prompt: string;
  mode: Mode;
  max_tokens?: number;
}

export type GenEvent = { t: string } | { done: true; tokens?: number; tps?: number } | { error: string };

export interface NewVoice {
  name: string;
  source?: string;
  text?: string;
  files?: File[];
}

export interface Api {
  listVoices(): Promise<Voice[]>;
  getVoice(id: string): Promise<Voice>;
  createVoice(input: NewVoice): Promise<{ id: string }>;
  getData(id: string): Promise<DataView>;
  getSamples(id: string, run?: string): Promise<Sample[]>;
  activateRun(id: string, run: string): Promise<{ active: string }>;
  excludePost(id: string, url: string, excluded: boolean): Promise<{ excluded: string[] }>;
  rerun(id: string, from: "collect" | "build" | "train" | "eval", opts?: { continue?: boolean; checkpoints?: boolean }): Promise<{ id: string }>;
  deleteVoice(id: string): Promise<{ deleted: string }>;
  deleteRun(id: string, run: string): Promise<{ deleted: string }>;
  addWriting(id: string, input: Omit<NewVoice, "name">): Promise<{ id: string }>;
  getMachine(): Promise<Machine>;
  getJobs(): Promise<Jobs>;
  cancelJob(voice: string): Promise<{ cancelled: string }>;
  downloadModel(id: string): Promise<{ id: string }>;
  generate(req: GenRequest, signal?: AbortSignal): AsyncGenerator<GenEvent>;
}

export const isMock = new URLSearchParams(window.location.search).get("mock") === "1";

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.error === "string") return body.error;
  } catch {
    /* not JSON */
  }
  return `${res.status} ${res.statusText}`.trim();
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(await errorMessage(res));
  return (await res.json()) as T;
}

function parseEvent(line: string): GenEvent | null {
  if (!line.startsWith("data:")) return null;
  const payload = line.slice(5).trim();
  if (!payload) return null;
  try {
    return JSON.parse(payload) as GenEvent;
  } catch {
    return null;
  }
}

const enc = encodeURIComponent;

const httpApi: Api = {
  listVoices: () => getJson<Voice[]>("/api/voices"),
  getVoice: (id) => getJson<Voice>(`/api/voices/${enc(id)}`),
  createVoice: (input) => {
    if (!input.text && !(input.files && input.files.length)) {
      return getJson<{ id: string }>("/api/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input.name, source: input.source ?? "" }),
      });
    }
    const form = new FormData();
    form.append("name", input.name);
    if (input.source) form.append("source", input.source);
    if (input.text) form.append("text", input.text);
    for (const f of input.files ?? []) form.append("files", f, f.name);
    return getJson<{ id: string }>("/api/voices", { method: "POST", body: form });
  },
  getData: (id) => getJson<DataView>(`/api/voices/${enc(id)}/data`),
  getSamples: (id, run) => getJson<Sample[]>(`/api/voices/${enc(id)}/samples${run ? `?run=${enc(run)}` : ""}`),
  activateRun: (id, run) =>
    getJson<{ active: string }>(`/api/voices/${enc(id)}/runs/${enc(run)}/activate`, { method: "POST" }),
  excludePost: (id, url, excluded) =>
    getJson<{ excluded: string[] }>(`/api/voices/${enc(id)}/exclude`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, excluded }),
    }),
  rerun: (id, from, opts) =>
    getJson<{ id: string }>(`/api/voices/${enc(id)}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, continue: !!opts?.continue, checkpoints: !!opts?.checkpoints }),
    }),
  deleteVoice: (id) => getJson<{ deleted: string }>(`/api/voices/${enc(id)}`, { method: "DELETE" }),
  deleteRun: (id, run) => getJson<{ deleted: string }>(`/api/voices/${enc(id)}/runs/${enc(run)}`, { method: "DELETE" }),
  addWriting: (id, input) => {
    const form = new FormData();
    if (input.source) form.append("source", input.source);
    if (input.text) form.append("text", input.text);
    for (const f of input.files ?? []) form.append("files", f, f.name);
    return getJson<{ id: string }>(`/api/voices/${enc(id)}/add`, { method: "POST", body: form });
  },
  getMachine: () => getJson<Machine>("/api/machine"),
  getJobs: () => getJson<Jobs>("/api/jobs"),
  cancelJob: (voice) => getJson<{ cancelled: string }>(`/api/jobs/${enc(voice)}/cancel`, { method: "POST" }),
  downloadModel: (id) =>
    getJson<{ id: string }>("/api/machine/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),

  async *generate(req, signal) {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(req),
      signal,
    });
    if (!res.ok || !res.body) {
      yield { error: await errorMessage(res) };
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).replace(/\r$/, "");
          buf = buf.slice(nl + 1);
          const ev = parseEvent(line);
          if (ev) yield ev;
        }
      }
      buf += decoder.decode();
      const ev = parseEvent(buf.trim());
      if (ev) yield ev;
    } finally {
      reader.cancel().catch(() => {});
    }
  },
};

export const api: Api = isMock ? mockApi : httpApi;
