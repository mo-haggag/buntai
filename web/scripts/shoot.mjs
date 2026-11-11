// Minimal CDP driver: node shoot.mjs <outdir> <scheme> [baseUrl] [shotNames]
// Screens: 0-write, 1-styles, 2-overview, 3-data, 4-training, 5-evaluation, 6-benchmark, 7-new, 8-machine (comma-separated in shotNames).
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [outDir, scheme = "light", base = "http://127.0.0.1:5175/?mock=1", only = ""] = process.argv.slice(2);
const want = only ? only.split(",") : null;
const prefix = base.includes("mock=1") ? "" : "real-";
const style = process.env.STYLE_ID || "garry";
const port = 9333;
const profile = resolve(dirname(fileURLToPath(import.meta.url)), "../../.cache/chrome-profile"); // inside the project
mkdirSync(profile, { recursive: true });
mkdirSync(outDir, { recursive: true });
const chrome = spawn("google-chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  "--no-first-run", "--hide-scrollbars", "--window-size=1440,1000", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); break; } catch { await sleep(200); }
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = (expr) => send("Runtime.evaluate", { expression: expr, awaitPromise: true });

await send("Page.enable");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme }] });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

async function shot(name, hash, actions = async () => {}, wait = 1800) {
  if (want && !want.includes(name)) return;
  await send("Page.navigate", { url: `${base}${hash}` });
  await sleep(wait);
  await actions();
  const { result } = await send("Page.getLayoutMetrics");
  const h = Math.ceil(result.cssContentSize.height);
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: Math.max(1000, h), deviceScaleFactor: 1, mobile: false });
  await sleep(300);
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${outDir}/${prefix}${name}-${scheme}.png`, Buffer.from(r.result.data, "base64"));
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  console.log("saved", name, h);
}

const click = (sel, text) => evalJs(`(() => { const els = [...document.querySelectorAll(${JSON.stringify(sel)})].filter(e => e.offsetParent !== null); const el = els.find(e => e.textContent.trim().includes(${JSON.stringify(text)})); if (el) el.click(); return !!el; })()`);

await shot("1-styles", "#/styles");
await shot("2-overview", `#/styles/${style}/overview`);
await shot("3-data", `#/styles/${style}/data`);
await shot("4-training", `#/styles/${style}/training`);
await shot("5-evaluation", `#/styles/${style}/evaluation`, async () => {
  await click("button", "Pick A");
  await sleep(400);
});
await shot("6-benchmark", "#/benchmark", async () => {
  await click("button", "Talk to users weekly");
  await sleep(100);
  await click("[role=switch]", "GPT-5.5");
  await sleep(100);
  await click("button", "Generate");
  await sleep(Number(process.env.WRITE_WAIT || 6500));
});
await shot("0-write", "#/write", async () => {
  await sleep(Number(process.env.PRE_WAIT || 0)); // mock mode: let the simulated training finish first
  await evalJs(`(() => {
    const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    const ta = document.querySelector("textarea");
    set.call(ta, "A short post for first-time founders on why talking to users every week matters more than the roadmap.");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await sleep(100);
  await click("button", "Write");
  await sleep(Number(process.env.WRITE_WAIT || 6500));
});
await shot("8-machine", "#/machine");
await shot("7-new", "#/new", async () => {
  await click("button", "Upload files");
  await sleep(200);
});

ws.close();
chrome.kill();
process.exit(0);
