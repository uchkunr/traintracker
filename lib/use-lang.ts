"use client";

import { useCallback, useEffect, useState } from "react";
import { initialLang, type Lang } from "./i18n";

// One language choice for every page. It is saved only when the user picks a language,
// so the first render (before the saved value is read) can never overwrite it.
export function useLang(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("uz");
  useEffect(() => {
    const frame = requestAnimationFrame(() => setLangState(initialLang()));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem("traintracker-lang", next);
    } catch {
      /* The language choice still applies for this visit. */
    }
  }, []);
  return [lang, setLang];
}
