import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BookOpenText, Feather, Laptop, Monitor, Moon, PenLine, Plus, Sun } from "lucide-react";
import { api, isMock } from "./api";
import type { Voice } from "./api";
import { APP_NAME, APP_TAGLINE } from "./brand";
import { useTheme } from "./theme";
import type { ThemePref } from "./theme";
import { NewStyle } from "./components/NewStyle";
import { StyleDetail } from "./components/StyleDetail";
import type { DetailTab } from "./components/StyleDetail";
import { StylesView } from "./components/StylesView";
import { WriteView } from "./components/WriteView";
import { ErrorNote, cx, isRunning } from "./components/ui";

type Section = "write" | "styles" | "new";
interface Route {
  section: Section;
  id?: string;
  tab?: DetailTab;
}

const TABS: DetailTab[] = ["overview", "data", "training", "evaluation"];

function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("?")[0].split("/").filter(Boolean);
  if (parts[0] === "write") return { section: "write" };
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

const NAV: { section: Section; label: string; icon: ReactNode; href: string }[] = [
  { section: "write", label: "Write", icon: <PenLine className="size-4" aria-hidden />, href: "#/write" },
  { section: "styles", label: "Styles", icon: <BookOpenText className="size-4" aria-hidden />, href: "#/styles" },
  { section: "new", label: "New style", icon: <Plus className="size-4" aria-hidden />, href: "#/new" },
];

export default function App() {
  const route = useRoute();
  const [theme, setTheme] = useTheme();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [writeMounted, setWriteMounted] = useState(route.section === "write");

  useEffect(() => {
    if (route.section === "write") setWriteMounted(true);
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

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((n) => (
        <a
          key={n.section}
          href={n.href}
          className={cx(
            "flex h-9 items-center gap-2.5 rounded-(--radius-control) px-3 text-sm font-medium transition-colors",
            route.section === n.section ? "bg-sunken text-ink" : "text-ink-2 hover:bg-sunken hover:text-ink",
          )}
        >
          {n.icon}
          {n.label}
        </a>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[var(--rail-width)_1fr]">
      {/* Side menu */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-line bg-surface px-3 py-4 md:flex">
        <a href="#/styles" className="flex items-center gap-2.5 px-2">
          <span className="flex size-8 items-center justify-center rounded-(--radius-control) bg-accent text-white">
            <Feather className="size-4" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-semibold tracking-tight">{APP_NAME}</span>
            <span className="block text-[11px] text-ink-3">{APP_TAGLINE}</span>
          </span>
        </a>
        {nav}
        <div className="mt-auto space-y-3 px-1">
          {isMock && (
            <span className="inline-block rounded-full border border-line-strong px-2 py-0.5 text-xs font-medium text-ink-3">
              Mock data
            </span>
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
        <div className="ml-auto flex gap-1">
          {NAV.map((n) => (
            <a
              key={n.section}
              href={n.href}
              title={n.label}
              aria-label={n.label}
              className={cx(
                "flex size-8 items-center justify-center rounded-(--radius-control)",
                route.section === n.section ? "bg-sunken text-ink" : "text-ink-2",
              )}
            >
              {n.icon}
            </a>
          ))}
        </div>
      </header>

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {listError && <ErrorNote onRetry={refresh}>Server not reachable ({listError})</ErrorNote>}

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

          {/* Write stays mounted once opened so its output survives a visit to another section. */}
          {writeMounted && (
            <div hidden={route.section !== "write"}>
              <WriteView voices={voices} />
            </div>
          )}
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
          className={cx(
            "flex size-7 items-center justify-center rounded-md transition-colors",
            value === o.v ? "bg-sunken text-ink" : "text-ink-3 hover:text-ink",
          )}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
