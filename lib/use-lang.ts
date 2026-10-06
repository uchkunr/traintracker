"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "./i18n";
import { localePath } from "./seo";

type LangValue = readonly [Lang, (lang: Lang) => void];

const LangContext = createContext<LangValue>(["uz", () => {}]);

// The language comes from the URL (/ is Uzbek, /en is English) and lives in one provider in the root layout.
// Switching updates the state and the address bar in place, so the map and the open panels are not reloaded.
export function LangProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    // The cookie only remembers the choice for the next visit; crawlers never see it.
    document.cookie = `traintracker-lang=${next}; path=/; max-age=31536000; samesite=lax`;
    const { pathname, search, hash } = window.location;
    const rest = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
    window.history.replaceState(null, "", localePath(next, rest) + search + hash);
  }, []);
  const value = useMemo<LangValue>(() => [lang, setLang], [lang, setLang]);
  return createElement(LangContext.Provider, { value }, children);
}

export const useLang = () => useContext(LangContext);
