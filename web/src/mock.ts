// In-memory fake backend, used when the page is opened with ?mock=1.
import type { Api, DataView, GenEvent, GenRequest, Jobs, Machine, Run, Sample, Voice } from "./api";

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

// Deterministic jitter so the fake loss curve looks the same on every load.
const jitter = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

function lossCurve(upTo: number, total: number, every = 3) {
  const steps: { step: number; loss: number }[] = [];
  for (let s = every; s <= upTo; s += every) {
    const loss = 1.82 + 1.35 * Math.exp(-s / (total * 0.16)) + jitter(s) * 0.09;
    steps.push({ step: s, loss: Math.round(loss * 1000) / 1000 });
  }
  return steps;
}

const garryRuns: Run[] = [
  {
    id: "20261111-2040", created: Date.now() / 1000 - 600, epochs: 4, rank: 16, lr: 2e-4, train_pairs: 762,
    total_steps: 384, has_adapter: true, judged: true,
    metrics: { ppl_base: 18.9, ppl_tuned: 11.2, ppl_by_epoch: [12.4, 11.5, 11.2, 11.3], best_epoch: 3, train_seconds: 690,
      judge: { tuned_wins: 26, base_wins: 0, frontier_wins: 14, n: 40, judge_model: "gpt-5.4", frontier_model: "gpt-5.5" } },
  },
  {
    id: "20261111-1935", created: Date.now() / 1000 - 4200, epochs: 2, rank: 16, lr: 2e-4, train_pairs: 381,
    total_steps: 96, has_adapter: true, judged: true,
    metrics: { ppl_base: 19.2, ppl_tuned: 10.8, best_epoch: 2, train_seconds: 196,
      judge: { tuned_wins: 27, base_wins: 0, frontier_wins: 13, n: 40, judge_model: "gpt-5.4", frontier_model: "gpt-5.5" } },
  },
];

const garry: Voice = {
  id: "garry",
  name: "Garry Tan",
  source: "https://blog.garrytan.com",
  source_kind: "url",
  stage: "ready",
  stats: { posts: 388, words: 161_461, posts_kept: 372, passages: 414, train: 762, eval: 33, train_words: 97_348 },
  active_run: garryRuns[0].id,
  train: {
    run: garryRuns[0].id, steps: lossCurve(384, 384), total_steps: 384, epoch: 4, epochs: 4, seconds: 690, best_epoch: 3,
    epoch_ends: [{ epoch: 1, ppl: 12.4, step: 96 }, { epoch: 2, ppl: 11.5, step: 192 }, { epoch: 3, ppl: 11.2, step: 288 }, { epoch: 4, ppl: 11.3, step: 384 }],
  },
  metrics: garryRuns[0].metrics,
  runs: garryRuns,
};

const data: DataView = {
  kept_posts: [
    { title: "Do things that don't scale, the Posterous edition", url: "https://blog.garrytan.com/a", words: 812 },
    { title: "How founders can build trust and safety teams", url: "https://blog.garrytan.com/b", words: 640 },
    { title: "Sell, die, no: grow profitably", url: "https://blog.garrytan.com/c", words: 1120 },
  ],
  dropped_posts: [{ title: "A conversation with Cameron Yarbrough of Torch", url: "https://blog.garrytan.com/d", words: 2210 }],
  passages: 414,
  train: 762,
  eval: 33,
  train_words: 97_348,
  pairs: [
    {
      title: "Sell, die, no: grow profitably",
      url: "https://blog.garrytan.com/c",
      passage: "Picture this... You're burning more than a million dollars a month. You're growing great but your biggest competitor just had one of the worst IPOs of the year.\n\nWhat do you do? For many founders that means selling, going out of business, or recapping. Not for Ooshma though.",
      requests: [
        "Write a roughly 200-word piece about a meal-kit founder who faced a dangerous moment when the company was losing over a million dollars a month and a rival had a disastrous IPO, and chose to push to profitability instead of selling.",
        "Write about a food startup founder turning a money-burning company profitable after a competitor's IPO collapse",
      ],
    },
  ],
};

// Simulated pipeline for voices created in mock mode (and one already running).
const DUR = { collect: 6000, build: 4000, train: 36000, eval: 6000 };
const TOTAL_STEPS = 240;

interface Sim {
  id: string;
  name: string;
  source: string;
  startedAt: number;
}

const sims: Sim[] = [
  { id: "pg", name: "Paul Graham", source: "https://paulgraham.com", startedAt: Date.now() - 22_000 },
];

function simulate(sim: Sim): Voice {
  const t = Date.now() - sim.startedAt;
  const v: Voice = { id: sim.id, name: sim.name, source: sim.source, source_kind: "url", stage: "collect", runs: [] };
  const posts = 186;
  const words = 214_560;
  if (t < DUR.collect) {
    const done = Math.floor((t / DUR.collect) * posts);
    v.progress = { label: "Fetching posts", done, total: posts };
    v.stats = { posts: done, words: Math.floor((done / posts) * words) };
    return v;
  }
  v.stats = { posts, words };
  const t1 = t - DUR.collect;
  if (t1 < DUR.build) {
    v.stage = "build";
    v.progress = { label: "Cutting passages", done: Math.floor((t1 / DUR.build) * 960), total: 960 };
    return v;
  }
  v.stats = { ...v.stats, posts_kept: 171, passages: 960, train: 864, eval: 96, train_words: 188_400 };
  const t2 = t1 - DUR.build;
  if (t2 < DUR.train) {
    const step = Math.floor((t2 / DUR.train) * TOTAL_STEPS);
    v.stage = "train";
    v.progress = { label: "Training LoRA", done: step, total: TOTAL_STEPS };
    v.train = {
      steps: lossCurve(step, TOTAL_STEPS),
      total_steps: TOTAL_STEPS,
      epoch: 1 + Math.floor((step / TOTAL_STEPS) * 3),
      seconds: Math.round(step * 4.1),
    };
    return v;
  }
  v.train = { steps: lossCurve(TOTAL_STEPS, TOTAL_STEPS), total_steps: TOTAL_STEPS, epoch: 3, seconds: 984 };
  const t3 = t2 - DUR.train;
  if (t3 < DUR.eval) {
    v.stage = "eval";
    v.progress = { label: "Scoring held-out passages", done: Math.floor((t3 / DUR.eval) * 96), total: 96 };
    return v;
  }
  v.stage = "ready";
  v.metrics = {
    ppl_base: 21.2,
    ppl_tuned: 13.9,
    judge: { tuned_wins: 18, base_wins: 4, frontier_wins: 8, n: 30, judge_model: "GPT-5.5" },
  };
  return v;
}

function allVoices(): Voice[] {
  return [garry, ...sims.map(simulate)];
}

const TEXT: Record<GenRequest["mode"], string> = {
  base: `Talking to users is one of the most important things a founder can do. Here are a few reasons why founders should make it a weekly habit.

1. Understanding customer needs: Regular conversations help founders understand the problems their customers face, which can inform product decisions.

2. Building relationships: Frequent contact builds trust and loyalty with early users.

3. Identifying opportunities: Users often suggest features or use cases the team had not considered.

In conclusion, talking to users every week is a valuable practice that can help startups succeed in a competitive market.`,
  tuned: `Here's the thing nobody tells you when you start a company. The product in your head is wrong. Not a little wrong. Wrong in ways you can't see from your desk.

The only fix is to go talk to the people using it. Every week. Not a survey, not a dashboard. An actual conversation where you shut up and listen.

When we were building Posterous, the best features never came from a planning meeting. They came from someone emailing us at 2am because something was broken and they cared enough to tell us.

Founders who stop talking to users start building for themselves. That's how you end up with a beautiful product nobody needs. Put it on your calendar. Thursday mornings, five calls. Do it until it hurts, then keep doing it.`,
  frontier: `Most founders think they talk to users enough. They don't.

The first version of your product is a guess. Every week you skip talking to users, that guess gets more expensive to fix. You ship features for an imaginary customer and wonder why retention is flat.

Make it a ritual. Block an hour every week. Ask what they did yesterday, not what they want. Watch where they get stuck.

The best founders I've worked with treat user calls like oxygen. It's not a phase you graduate from. It's the job.`,
};

// One GPU: base and tuned run one at a time, like the real server.
let gpuQueue: Promise<void> = Promise.resolve();

async function* streamText(text: string, delay: number, signal?: AbortSignal): AsyncGenerator<GenEvent> {
  const tokens = text.match(/\S+\s*|\s+/g) ?? [];
  const start = performance.now();
  for (const tok of tokens) {
    await sleep(delay + Math.random() * delay, signal);
    yield { t: tok };
  }
  const secs = (performance.now() - start) / 1000;
  const n = Math.round(tokens.length * 1.3);
  yield { done: true, tokens: n, tps: Math.round((n / secs) * 10) / 10 };
}

const samples: Sample[] = [
  {
    instruction: "Write a short post about what founders get wrong about fundraising.",
    reference: `Fundraising is not the company. I keep having to say this. You raise money so you can build the thing, and the moment you start optimizing for the raise instead of the product, you've already lost.

The best rounds I've seen came together in two weeks because the numbers were undeniable. Nobody had to be convinced. Make something people want, and the money shows up.`,
    base: `Fundraising can be challenging for many founders. Some common mistakes include not preparing a strong pitch deck, targeting the wrong investors, and raising too much or too little money. Founders should research investors carefully, practice their pitch, and be prepared to answer tough questions about their business model and market size.`,
    tuned: `Founders treat fundraising like the finish line. It's the starting gun. You got a term sheet, great. Now you owe people a real company.

I've sat across the table from hundreds of founders. The ones who raise easily aren't the best pitchers. They're the ones whose users won't shut up about the product. Fix that first and the deck mostly writes itself.`,
    frontier: `Here's what most founders get wrong about fundraising: they think it's about the pitch. It's not. It's about the traction. Investors are pattern matchers, and nothing matches faster than a growth curve that bends up and to the right.`,
  },
  {
    instruction: "Explain why small teams ship faster.",
    reference: `Every person you add is another set of opinions in the room. Five people can hold the whole product in their heads. Fifty people need meetings to find out what the other forty-five are doing.

At Initialized we'd see it over and over. The tiny team ships every day. The big team ships a roadmap.`,
    base: `Small teams often ship faster due to reduced communication overhead, faster decision making, and greater ownership. With fewer people involved, there are fewer meetings and approvals required. Team members can also take on multiple roles, which increases flexibility and speed.`,
    tuned: `Small teams ship faster because nobody has to ask permission. You see the bug, you fix it, it's live by lunch.

Add twenty people and suddenly there's a sync meeting about the sync meeting. I love big ambitions. I'm deeply skeptical of big teams early on. Stay small until it physically hurts.`,
  },
  {
    instruction: "Give advice to a founder who just lost their biggest customer.",
    reference: `It's going to feel like the end. It isn't. Call them and ask why, and actually listen, even if it stings. Then go find the next ten customers who have the same problem and none of the baggage.

Concentration risk is real, and now you know it in your gut instead of in a spreadsheet. That's worth something.`,
    base: `Losing a major customer can be difficult. It is important to stay calm and analyze the reasons behind the loss. Consider reaching out to the customer for feedback, diversifying your customer base, and focusing on improving your product. Remember that setbacks are a normal part of building a business.`,
    tuned: `First, breathe. Then pick up the phone and ask them why they left. Don't defend anything. Just write it down.

Every company I've funded that made it lost a big customer at some point. It feels like dying. It's actually a gift: you just learned exactly where the product is weak. Go fix it and go find ten more customers who need it.`,
  },
];

export const mockApi: Api = {
  async listVoices() {
    await sleep(120);
    return allVoices();
  },
  async getVoice(id) {
    await sleep(80);
    const v = allVoices().find((x) => x.id === id);
    if (!v) throw new Error("Style not found");
    return v;
  },
  async createVoice(input) {
    await sleep(300);
    let id = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "voice";
    while (allVoices().some((v) => v.id === id)) id += "-2";
    sims.push({ id, name: input.name, source: input.source || "uploaded files", startedAt: Date.now() });
    return { id };
  },
  async getData(id) {
    await sleep(150);
    if (!allVoices().some((v) => v.id === id)) throw new Error("Style not found");
    return data;
  },
  async getSamples(id) {
    await sleep(200);
    if (!allVoices().some((v) => v.id === id)) throw new Error("Style not found");
    return samples;
  },
  async excludePost(_id, url, excluded) {
    await sleep(80);
    const set = new Set(data.excluded ?? []);
    if (excluded) set.add(url);
    else set.delete(url);
    data.excluded = [...set];
    return { excluded: data.excluded };
  },
  async addWriting(id) {
    await sleep(200);
    const sim = sims.find((s) => s.id === id);
    if (sim) sim.startedAt = Date.now();
    else sims.push({ id, name: allVoices().find((v) => v.id === id)?.name ?? id, source: "", startedAt: Date.now() });
    return { id };
  },
  async rerun(id) {
    await sleep(200);
    const sim = sims.find((s) => s.id === id);
    if (sim) sim.startedAt = Date.now();
    else sims.push({ id, name: allVoices().find((v) => v.id === id)?.name ?? id, source: "", startedAt: Date.now() });
    return { id };
  },
  async getMachine(): Promise<Machine> {
    await sleep(80);
    return {
      gpu: { name: "NVIDIA GeForce RTX 5090 Laptop GPU", vram_total_mb: 24463, vram_used_mb: 9343, util: 12, temp_c: 48, power_w: 41.2 },
      busy: null, model_loaded: true, base_model: "qwen3vl-4b",
      disk: { project_free_gb: 31.6, project_total_gb: 32.7, models_free_gb: 962, models_total_gb: 1700 },
      models: [
        { id: "qwen3vl-2b", repo: "Qwen/Qwen3-VL-2B-Instruct", params: "2B", size_gb: 4.4, train_vram_gb: 9, serve_vram_gb: 5, present: false, active: false, size_on_disk_gb: 0, fits_training: true, fits_serving: true, recommended: false, download: null },
        { id: "qwen3vl-4b", repo: "Qwen/Qwen3-VL-4B-Instruct", params: "4B", size_gb: 8.9, train_vram_gb: 15, serve_vram_gb: 9, present: true, active: true, size_on_disk_gb: 8.9, fits_training: true, fits_serving: true, recommended: true, download: null },
        { id: "qwen3vl-8b", repo: "Qwen/Qwen3-VL-8B-Instruct", params: "8B", size_gb: 17, train_vram_gb: 23, serve_vram_gb: 17, present: false, active: false, size_on_disk_gb: 0, fits_training: false, fits_serving: true, recommended: false, download: null },
      ],
    };
  },
  async getJobs(): Promise<Jobs> {
    await sleep(60);
    const live = allVoices().filter((v) => ["collect", "build", "train", "eval"].includes(v.stage));
    return {
      active: live.map((v) => ({ voice: v.id, name: v.name, stage: v.stage, progress: v.progress, since: Date.now() / 1000 - 40, run: null })),
      queued: [],
      recent: [
        { voice: "garry", name: "Garry Tan", stage: "eval", at: Date.now() / 1000 - 900, ok: true, seconds: 312 },
        { voice: "garry", name: "Garry Tan", stage: "train", at: Date.now() / 1000 - 1300, ok: true, seconds: 690 },
      ],
      gpu_busy: live[0]?.id ?? null,
    };
  },
  async downloadModel(id) {
    await sleep(100);
    return { id };
  },
  async activateRun(id, run) {
    await sleep(100);
    if (id === "garry") {
      garry.active_run = run;
      garry.metrics = garryRuns.find((r) => r.id === run)?.metrics ?? garry.metrics;
    }
    return { active: run };
  },
  async *generate(req, signal) {
    if (req.mode === "frontier") {
      await sleep(900, signal);
      yield* streamText(TEXT.frontier, 14, signal);
      return;
    }
    // Wait for the fake GPU, then hold it until this stream finishes.
    let release!: () => void;
    const prev = gpuQueue;
    gpuQueue = new Promise<void>((r) => (release = r));
    try {
      await prev;
      await sleep(250, signal);
      yield* streamText(TEXT[req.mode], 22, signal);
    } finally {
      release();
    }
  },
};
