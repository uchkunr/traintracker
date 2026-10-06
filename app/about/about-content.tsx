"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight, TrainFront } from "lucide-react";
import { useLang } from "@/lib/use-lang";

const COPY = {
  uz: {
    back: "Xaritaga qaytish",
    langLabel: "Til",
    title: "Loyiha haqida",
    intro: "Poyezd jadvali odatda vaqtlar ro‘yxati bo‘lib, yo‘nalishni tasavvur qilish qiyin. TrainTracker.uz shu jadvalni xaritaga joylaydi: poyezd hozir qayerda, qaysi bekatlardan o‘tadi va qachon yetib boradi, hammasi bir qarashda ko‘rinadi.",
    dataTitle: "Ma’lumotlar",
    sources: [
      ["Jadval va narxlar", "eticket.railway.uz", "https://eticket.railway.uz/"],
      ["Elektr poyezdlar", "ticket.elektropoyezd.uz", "https://ticket.elektropoyezd.uz/"],
      ["Oraliq bekatlar", "Yandex Rasp", "https://rasp.yandex.ru/"],
      ["Xarita", "OpenStreetMap", "https://www.openstreetmap.org/copyright"],
    ],
    dataNote: "Ma’lumotlar 2026-yil 6-oktabr holatida olingan.",
    liveTitle: "Real vaqt",
    live: "Poyezdlarda GPS kuzatuvi yo‘q. Shuning uchun joylashuv jadvaldan hisoblab chiqiladi va har soniyada yangilanadi.",
    steps: [
      "Reysning jo‘nash va yetib borish vaqti olinadi (Toshkent vaqti, UTC+5).",
      "Hozirgi vaqt shu oraliqning qancha qismi o‘tganini ko‘rsatadi.",
      "Poyezd rels chizig‘ining xuddi shu joyiga qo‘yiladi.",
    ],
    formula: "o‘tgan ulush = (hozir - jo‘nash) / davomiylik",
    note: "Joylashuv taxminiy: kechikishlar hisobga olinmaydi. Chipta olishdan oldin eticket.railway.uz saytida tekshirib oling. Loyiha mustaqil va O‘zbekiston temir yo‘llari bilan rasmiy aloqasi yo‘q.",
    authorTitle: "Muallif",
    contact: "Bog‘lanish",
  },
  en: {
    back: "Back to the map",
    langLabel: "Language",
    title: "About",
    intro: "A train timetable is usually a list of times, which makes a route hard to picture. TrainTracker.uz puts that timetable on a map, so you can see where a train is now, which stations it passes and when it arrives.",
    dataTitle: "Data",
    sources: [
      ["Timetable and fares", "eticket.railway.uz", "https://eticket.railway.uz/"],
      ["Electric trains", "ticket.elektropoyezd.uz", "https://ticket.elektropoyezd.uz/"],
      ["Intermediate stops", "Yandex Rasp", "https://rasp.yandex.ru/"],
      ["Map", "OpenStreetMap", "https://www.openstreetmap.org/copyright"],
    ],
    dataNote: "Data was collected on 6 October 2026.",
    liveTitle: "Real time",
    live: "Trains are not tracked by GPS, so the position is worked out from the timetable and updated every second.",
    steps: [
      "We take the service’s departure and arrival times (Tashkent time, UTC+5).",
      "The current time tells us how much of that interval has passed.",
      "The train is drawn at the same point along the rail line.",
    ],
    formula: "progress = (now - departure) / duration",
    note: "The position is an estimate and delays are not included. Check eticket.railway.uz before you buy a ticket. The project is independent and has no official link with Uzbekistan Railways.",
    authorTitle: "Author",
    contact: "Contact",
  },
} as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-border py-6 md:grid-cols-[9rem_1fr] md:gap-8">
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export function AboutContent() {
  const [lang, setLang] = useLang();

  const c = COPY[lang];
  useEffect(() => {
    document.title = `${c.title} | TrainTracker.uz`;
  }, [c.title]);

  return (
    <main className="h-dvh overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-3 pb-16 md:px-0">
        <header className="floating-surface sticky top-3 z-20 mt-3 flex h-16 items-center justify-between rounded-xl px-4 md:top-5 md:mt-5 md:px-5">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight" aria-label={c.back}>
            <ArrowLeft className="size-4 text-muted-foreground" aria-hidden="true" />
            <TrainFront className="size-5 text-primary" aria-hidden="true" />
            <span>TrainTracker<span className="text-muted-foreground">.uz</span></span>
          </Link>
          <div role="group" aria-label={c.langLabel} className="flex gap-0.5 rounded-lg bg-muted p-0.5">{(["uz", "en"] as const).map((code) => <button key={code} aria-pressed={lang === code} onClick={() => setLang(code)} className={`h-8 min-w-10 rounded-md px-2.5 text-xs font-semibold uppercase transition-colors ${lang === code ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{code}</button>)}</div>
        </header>

        <div className="px-1 pt-10 md:px-0 md:pt-14">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{c.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{c.intro}</p>

          <div className="mt-8">
            <Section title={c.dataTitle}>
              <ul className="divide-y divide-border/70">
                {c.sources.map(([what, name, url]) => <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 py-2.5 first:pt-0">
                    <span className="text-sm text-muted-foreground">{what}</span>
                    <span className="flex items-center gap-1 text-sm font-semibold group-hover:text-primary">{name}<ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary" aria-hidden="true" /></span>
                  </a>
                </li>)}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">{c.dataNote}</p>
            </Section>

            <Section title={c.liveTitle}>
              <p className="text-sm leading-relaxed">{c.live}</p>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {c.steps.map((step, index) => <li key={step} className="grid grid-cols-[1.25rem_1fr]"><span className="font-semibold text-foreground tabular-nums">{index + 1}</span><span>{step}</span></li>)}
              </ol>
              <p className="mt-4 rounded-lg bg-muted px-3 py-2.5 font-mono text-xs break-words">{c.formula}</p>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{c.note}</p>
            </Section>

            <Section title={c.authorTitle}>
              <p className="text-sm font-semibold">Uchkun Rakhimov</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.contact}: <a href="mailto:uchkunrakhimov@gmail.com" className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline">uchkunrakhimov@gmail.com</a></p>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
