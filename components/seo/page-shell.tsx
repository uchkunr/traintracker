import Link from "next/link";
import { ArrowLeft, TrainFront } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { localePath } from "@/lib/seo";

const LABEL = { uz: { back: "Xaritaga qaytish", lang: "Til" }, en: { back: "Back to the map", lang: "Language" } } as const;

// Shared frame for the server-rendered content pages (route timetables): the same header as the rest of
// the site, with plain links for the language switch so every language stays a crawlable URL.
export function PageShell({ lang, path, children }: { lang: Lang; path: string; children: React.ReactNode }) {
  return (
    <main className="h-dvh overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-3 pb-16 md:px-0">
        <header className="floating-surface sticky top-3 z-20 mt-3 flex h-16 items-center justify-between rounded-xl px-4 md:top-5 md:mt-5 md:px-5">
          <Link href={localePath(lang)} className="flex items-center gap-2.5 text-lg font-semibold tracking-tight" aria-label={LABEL[lang].back}>
            <ArrowLeft className="size-4 text-muted-foreground" aria-hidden="true" />
            <TrainFront className="size-5 text-primary" aria-hidden="true" />
            <span>
              TrainTracker<span className="text-muted-foreground">.uz</span>
            </span>
          </Link>
          <nav aria-label={LABEL[lang].lang} className="flex gap-0.5 rounded-lg bg-muted p-0.5">
            {(["uz", "en"] as const).map((code) => (
              <Link
                key={code}
                href={localePath(code, path)}
                hrefLang={code}
                aria-current={lang === code ? "true" : undefined}
                className={`flex h-8 min-w-10 items-center justify-center rounded-md px-2.5 text-xs font-semibold uppercase transition-colors ${lang === code ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {code}
              </Link>
            ))}
          </nav>
        </header>
        <div className="px-1 pt-10 md:px-0 md:pt-14">{children}</div>
      </div>
    </main>
  );
}
