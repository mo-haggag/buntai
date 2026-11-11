// Minimal CDP driver: node shoot.mjs <outdir> <scheme>
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const [outDir, scheme = "light", base = "http://127.0.0.1:5175/?mock=1", only = ""] = process.argv.slice(2);
const want = only ? only.split(",") : null;
const prefix = base.includes("mock=1") ? "" : "real-";
const port = 9333;
const chrome = spawn("google-chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, "--user-data-dir=/tmp/ownvoice-shots/profile",
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

async function shot(name, hash, actions = async () => {}, wait = 1500) {
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

await shot("1-voices", "#/voices");
await shot("2-voice-garry", "#/voices/garry");
await shot("3-voice-training", "#/voices/pg");
await shot("4-write", "#/write", async () => {
  await click("button", "Talk to users weekly");
  await sleep(100);
  await click("[role=switch]", "GPT-5.5");
  await sleep(100);
  await click("button", "Generate");
  await sleep(6500);
});
await shot("5-blind", "#/blind", async () => {});
await shot("6-blind-revealed", "#/blind", async () => {
  await click("button", "Pick A");
  await sleep(400);
});

await shot("7-new-voice", "#/voices", async () => {
  await click("button", "New voice");
  await sleep(200);
  await evalJs(`(() => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    const [a, b] = document.querySelectorAll("form input");
    set.call(a, "Sam Altman"); a.dispatchEvent(new Event("input", { bubbles: true }));
    set.call(b, "blog.samaltman.com"); b.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await sleep(100);
  await click("button", "Create voice");
  await sleep(4000);
});

ws.close();
chrome.kill();
process.exit(0);
