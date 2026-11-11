import { mockApi } from "./mock";

export type Stage = "idle" | "collect" | "build" | "train" | "eval" | "ready" | "error";

export interface Voice {
  id: string;
  name: string;
  source: string;
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
  train?: { steps: { step: number; loss: number }[]; total_steps: number; epoch?: number; seconds?: number };
  metrics?: {
    ppl_base?: number;
    ppl_tuned?: number;
    judge?: { tuned_wins: number; base_wins: number; frontier_wins?: number; n: number; judge_model: string };
  };
  error?: string;
}

export interface Sample {
  instruction: string;
  reference: string;
  base: string;
  tuned: string;
  frontier?: string;
}

export type Mode = "base" | "tuned" | "frontier";

export interface GenRequest {
  voice: string;
  prompt: string;
  mode: Mode;
  max_tokens?: number;
}

export type GenEvent =
  | { t: string }
  | { done: true; tokens?: number; tps?: number }
  | { error: string };

export interface Api {
  listVoices(): Promise<Voice[]>;
  getVoice(id: string): Promise<Voice>;
  createVoice(name: string, source: string): Promise<{ id: string }>;
  getSamples(id: string): Promise<Sample[]>;
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

const httpApi: Api = {
  listVoices: () => getJson<Voice[]>("/api/voices"),
  getVoice: (id) => getJson<Voice>(`/api/voices/${encodeURIComponent(id)}`),
  createVoice: (name, source) =>
    getJson<{ id: string }>("/api/voices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, source }),
    }),
  getSamples: (id) => getJson<Sample[]>(`/api/voices/${encodeURIComponent(id)}/samples`),

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
