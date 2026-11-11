import { useEffect, useState } from "react";

export type ThemePref = "light" | "system" | "dark";

const KEY = "ownvoice-theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");

function readPref(): ThemePref {
  const v = localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : "system";
}

function apply(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && media.matches);
  document.documentElement.classList.toggle("dark", dark);
}

// Run once before React renders to avoid a flash of the wrong theme.
apply(readPref());

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readPref);

  useEffect(() => {
    apply(pref);
    if (pref === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
    if (pref !== "system") return;
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [pref]);

  return [pref, setPref] as const;
}
