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

type LangValue = readonly [Lang, (lang: Lang) => void];

const LangContext = createContext<LangValue>(["uz", () => {}]);

// The language lives in one provider mounted in the root layout, so it survives navigation between
// pages. The server reads the saved cookie, which means the very first paint already has the right language.
export function LangProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.cookie = `traintracker-lang=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);
  const value = useMemo<LangValue>(() => [lang, setLang], [lang, setLang]);
  return createElement(LangContext.Provider, { value }, children);
}

export const useLang = () => useContext(LangContext);
