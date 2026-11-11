import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BookOpenText, CircleAlert, Feather, Laptop, Monitor, Moon, PenLine, Scale, Sun } from "lucide-react";
import { api, isMock } from "./api";
import type { Voice } from "./api";
import { useTheme } from "./theme";
import type { ThemePref } from "./theme";
import { BlindTest } from "./components/BlindTest";
import { VoiceDetail } from "./components/VoiceDetail";
import { VoicesView } from "./components/VoicesView";
import { WriteView } from "./components/WriteView";
import { cx, isRunning } from "./components/ui";

type Tab = "voices" | "write" | "blind";
interface Route {
  tab: Tab;
  id?: string;
}

function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "write") return { tab: "write" };
  if (parts[0] === "blind") return { tab: "blind" };
  if (parts[0] === "voices" && parts[1]) return { tab: "voices", id: decodeURIComponent(parts[1]) };
  return { tab: "voices" };
}

const go = (path: string) => {
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

const TABS: { tab: Tab; label: string; icon: ReactNode }[] = [
  { tab: "voices", label: "Voices", icon: <BookOpenText className="size-4" aria-hidden /> },
  { tab: "write", label: "Write", icon: <PenLine className="size-4" aria-hidden /> },
  { tab: "blind", label: "Blind test", icon: <Scale className="size-4" aria-hidden /> },
];

export default function App() {
  const route = useRoute();
  const [theme, setTheme] = useTheme();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<Tab>>(() => new Set([route.tab]));

  useEffect(() => {
    setVisited((s) => (s.has(route.tab) ? s : new Set(s).add(route.tab)));
  }, [route.tab]);

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
  const onList = route.tab === "voices" && !route.id;

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const t = setInterval(refresh, anyRunning && onList ? 2000 : 10000);
    return () => clearInterval(t);
  }, [refresh, anyRunning, onList]);

  const upsert = useCallback((v: Voice) => {
    setVoices((prev) => (prev.some((x) => x.id === v.id) ? prev.map((x) => (x.id === v.id ? v : x)) : [...prev, v]));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <a href="#/voices" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-white">
              <Feather className="size-4" aria-hidden />
            </span>
            ownvoice
          </a>
          <nav className="flex items-center gap-1">
            {TABS.map((t) => (
              <a
                key={t.tab}
                href={`#/${t.tab}`}
                className={cx(
                  "inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                  route.tab === t.tab ? "bg-sunken text-ink" : "text-ink-2 hover:bg-sunken hover:text-ink",
                )}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {isMock && (
              <span className="rounded-full border border-line-strong px-2 py-0.5 text-xs font-medium text-ink-3">
                Mock data
              </span>
            )}
            <span className="hidden items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-xs text-ink-2 md:inline-flex">
              <Laptop className="size-3.5" aria-hidden />
              Runs on your laptop · no data leaves it
            </span>
            <ThemeSwitch value={theme} onChange={setTheme} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {listError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad">
            <CircleAlert className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">Server not reachable ({listError})</span>
            <button className="font-medium underline" onClick={refresh}>
              Retry
            </button>
          </div>
        )}

        {route.tab === "voices" &&
          (route.id ? (
            <VoiceDetail
              key={route.id}
              id={route.id}
              voice={voices.find((v) => v.id === route.id)}
              onUpdate={upsert}
              onBack={() => go("voices")}
              onWrite={() => go("write")}
              onBlind={() => go("blind")}
            />
          ) : (
            <VoicesView
              voices={voices}
              loaded={loaded}
              onOpen={(id) => go(`voices/${encodeURIComponent(id)}`)}
              onCreated={(id) => {
                refresh();
                go(`voices/${encodeURIComponent(id)}`);
              }}
            />
          ))}

        {/* Write and Blind test stay mounted once opened so their state survives tab switches. */}
        {visited.has("write") && (
          <div hidden={route.tab !== "write"}>
            <WriteView voices={voices} onGoVoices={() => go("voices")} />
          </div>
        )}
        {visited.has("blind") && (
          <div hidden={route.tab !== "blind"}>
            <BlindTest voices={voices} onGoVoices={() => go("voices")} />
          </div>
        )}
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
    <div className="flex items-center rounded-lg border border-line p-0.5" role="radiogroup" aria-label="Theme">
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
