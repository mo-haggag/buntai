import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BookOpenText, Cpu, Feather, Laptop, Monitor, Moon, PenLine, Plus, Scale, Sun } from "lucide-react";
import { api, isMock } from "./api";
import type { Voice } from "./api";
import { APP_NAME, APP_TAGLINE } from "./brand";
import { useTheme } from "./theme";
import type { ThemePref } from "./theme";
import { Machine } from "./components/Machine";
import { NewStyle } from "./components/NewStyle";
import { StyleDetail } from "./components/StyleDetail";
import type { DetailTab } from "./components/StyleDetail";
import { StylesView } from "./components/StylesView";
import { UseWrite } from "./components/UseWrite";
import { WriteView } from "./components/WriteView";
import { ErrorNote, cx, isRunning } from "./components/ui";

type Section = "write" | "styles" | "new" | "benchmark" | "machine";
interface Route {
  section: Section;
  id?: string;
  tab?: DetailTab;
}

const TABS: DetailTab[] = ["overview", "data", "training", "evaluation"];

function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("?")[0].split("/").filter(Boolean);
  if (parts[0] === "write") return { section: "write" };
  if (parts[0] === "benchmark") return { section: "benchmark" };
  if (parts[0] === "machine") return { section: "machine" };
  if (parts[0] === "new") return { section: "new" };
  if (parts[0] === "styles" && parts[1]) {
    const tab = TABS.includes(parts[2] as DetailTab) ? (parts[2] as DetailTab) : "overview";
    return { section: "styles", id: decodeURIComponent(parts[1]), tab };
  }
  return { section: "styles" };
}

export const go = (path: string) => {
  window.location.hash = `#/${path}`;
  window.scrollTo(0, 0);
};

function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

interface NavItem {
  section: Section;
  label: string;
  icon: ReactNode;
  href: string;
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Use",
    items: [{ section: "write", label: "Write", icon: <PenLine className="size-4" aria-hidden />, href: "#/write" }],
  },
  {
    title: "Train",
    items: [
      { section: "styles", label: "Styles", icon: <BookOpenText className="size-4" aria-hidden />, href: "#/styles" },
      { section: "new", label: "New style", icon: <Plus className="size-4" aria-hidden />, href: "#/new" },
      { section: "benchmark", label: "Benchmark", icon: <Scale className="size-4" aria-hidden />, href: "#/benchmark" },
      { section: "machine", label: "Machine", icon: <Cpu className="size-4" aria-hidden />, href: "#/machine" },
    ],
  },
];

export default function App() {
  const route = useRoute();
  const [theme, setTheme] = useTheme();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<Set<Section>>(() => new Set([route.section]));

  useEffect(() => {
    setMounted((s) => (s.has(route.section) ? s : new Set(s).add(route.section)));
  }, [route.section]);

  const refresh = useCallback(async () => {
    try {
      setVoices(await api.listVoices());
      setLoaded(true);
      setListError(null);
    } catch (e) {
      setListError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const anyRunning = voices.some(isRunning);
  const busy = voices.find((v) => v.stage === "train" || v.stage === "eval")?.name ?? null;

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const t = setInterval(refresh, anyRunning ? 3000 : 15000);
    return () => clearInterval(t);
  }, [refresh, anyRunning]);

  const upsert = useCallback((v: Voice) => {
    setVoices((prev) => (prev.some((x) => x.id === v.id) ? prev.map((x) => (x.id === v.id ? v : x)) : [...prev, v]));
  }, []);

  const link = (n: NavItem, compact = false) => (
    <a
      key={n.section}
      href={n.href}
      title={compact ? n.label : undefined}
      aria-label={compact ? n.label : undefined}
      className={cx(
        compact
          ? "flex size-8 items-center justify-center rounded-(--radius-control)"
          : "flex h-9 items-center gap-2.5 rounded-(--radius-control) px-3 text-sm font-medium transition-colors",
        route.section === n.section ? "bg-sunken text-ink" : "text-ink-2 hover:bg-sunken hover:text-ink",
      )}
    >
      {n.icon}
      {!compact && n.label}
    </a>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[var(--rail-width)_1fr]">
      {/* Side menu */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-line bg-surface px-3 py-4 md:flex">
        <a href="#/write" className="flex items-center gap-2.5 px-2">
          <span className="flex size-8 items-center justify-center rounded-(--radius-control) bg-accent text-white">
            <Feather className="size-4" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-semibold tracking-tight">{APP_NAME}</span>
            <span className="block text-[11px] text-ink-3">{APP_TAGLINE}</span>
          </span>
        </a>
        <nav className="flex flex-col gap-5">
          {GROUPS.map((g) => (
            <div key={g.title} className="flex flex-col gap-0.5">
              <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{g.title}</div>
              {g.items.map((n) => link(n))}
            </div>
          ))}
        </nav>
        <div className="mt-auto space-y-3 px-1">
          {isMock && (
            <span className="inline-block rounded-full border border-line-strong px-2 py-0.5 text-xs font-medium text-ink-3">Mock data</span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-ink-3">
            <Laptop className="size-3.5 shrink-0" aria-hidden />
            Runs on your laptop. No data leaves it.
          </div>
          <ThemeSwitch value={theme} onChange={setTheme} />
        </div>
      </aside>

      {/* Small screens: a top bar instead of the rail */}
      <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-line bg-surface px-3 md:hidden">
        <span className="flex size-7 items-center justify-center rounded-(--radius-control) bg-accent text-white">
          <Feather className="size-4" aria-hidden />
        </span>
        <span className="font-semibold">{APP_NAME}</span>
        <div className="ml-auto flex gap-1">{GROUPS.flatMap((g) => g.items).map((n) => link(n, true))}</div>
      </header>

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {listError && <ErrorNote onRetry={refresh}>Server not reachable ({listError})</ErrorNote>}

          {/* Write and Benchmark stay mounted once opened so a draft survives a visit to another section. */}
          {mounted.has("write") && (
            <div hidden={route.section !== "write"}>
              <UseWrite voices={voices} busy={busy} />
            </div>
          )}
          {mounted.has("benchmark") && (
            <div hidden={route.section !== "benchmark"}>
              <WriteView voices={voices} />
            </div>
          )}

          {route.section === "styles" &&
            (route.id ? (
              <StyleDetail
                key={route.id}
                id={route.id}
                tab={route.tab ?? "overview"}
                voice={voices.find((v) => v.id === route.id)}
                onUpdate={upsert}
                onTab={(t) => go(`styles/${encodeURIComponent(route.id!)}/${t}`)}
              />
            ) : (
              <StylesView voices={voices} loaded={loaded} />
            ))}

          {route.section === "new" && (
            <NewStyle
              onCreated={(id) => {
                refresh();
                go(`styles/${encodeURIComponent(id)}`);
              }}
            />
          )}

          {route.section === "machine" && <Machine />}
        </div>
      </main>
    </div>
  );
}

function ThemeSwitch({ value, onChange }: { value: ThemePref; onChange: (v: ThemePref) => void }) {
  const opts: { v: ThemePref; label: string; icon: ReactNode }[] = [
    { v: "light", label: "Light theme", icon: <Sun className="size-3.5" /> },
    { v: "system", label: "System theme", icon: <Monitor className="size-3.5" /> },
    { v: "dark", label: "Dark theme", icon: <Moon className="size-3.5" /> },
  ];
  return (
    <div className="inline-flex items-center rounded-(--radius-control) border border-line p-0.5" role="radiogroup" aria-label="Theme">
      {opts.map((o) => (
        <button
          key={o.v}
          role="radio"
          aria-checked={value === o.v}
          title={o.label}
          aria-label={o.label}
          onClick={() => onChange(o.v)}
          className={cx("flex size-7 items-center justify-center rounded-md transition-colors", value === o.v ? "bg-sunken text-ink" : "text-ink-3 hover:text-ink")}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
