import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/seo/page-shell";
import { placeName, translate, type Lang, type MessageKey } from "@/lib/i18n";
import { LANGS, absoluteUrl, isLang, jsonLd, localePath, pageMetadata } from "@/lib/seo";
import { findRoutePair, getRoutePairs, type RouteTrip } from "@/lib/seo-routes";

type Props = { params: Promise<{ lang: string; from: string; to: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  LANGS.flatMap((lang) => getRoutePairs().map((pair) => ({ lang, from: pair.slug.from, to: pair.slug.to })));

const COPY = {
  uz: {
    title: (a: string, b: string) => `${a} → ${b} poyezdlari: jadval va davomiyligi`,
    description: (a: string, b: string, n: number, first: string, fastest: string) =>
      `${a} → ${b} yo‘nalishida ${n} ta poyezd reysi: birinchi jo‘nash ${first}, eng tez reys ${fastest}. Jo‘nash va yetib borish vaqtlari, poyezd turi va qatnov kunlari.`,
    h1: (a: string, b: string) => `${a} → ${b}: poyezdlar jadvali`,
    intro: (a: string, b: string, n: number, first: string, last: string, fastest: string) =>
      `${a} → ${b} yo‘nalishi bo‘yicha ${n} ta poyezd reysi mavjud. Birinchi jo‘nash ${first}, oxirgisi ${last}. Eng tez reys yo‘lda ${fastest} bo‘ladi.`,
    trains: "Reyslar",
    fastest: "Eng tez",
    first: "Birinchi jo‘nash",
    last: "Oxirgi jo‘nash",
    train: "Poyezd",
    departs: "Jo‘nash",
    arrives: "Yetib borish",
    duration: "Davomiylik",
    runs: "Qatnov kunlari",
    fare: "Narx",
    nextDay: "ertasi kuni",
    map: "Xaritada ko‘rish",
    mapText: "Poyezdlarning hozirgi joylashuvini va yo‘nalishni xaritada kuzating.",
    reverse: "Teskari yo‘nalish",
    more: (a: string) => `${a} dan boshqa yo‘nalishlar`,
    note: "Vaqtlar Toshkent vaqti (UTC+5) bo‘yicha. Oraliq bekatlardagi vaqtlar taxminiy. Chipta olishdan oldin eticket.railway.uz saytida tekshirib oling.",
    home: "Bosh sahifa",
    all: "Barcha yo‘nalishlar",
    currency: "so‘m",
  },
  en: {
    title: (a: string, b: string) => `${a} to ${b} trains: timetable and journey time`,
    description: (a: string, b: string, n: number, first: string, fastest: string) =>
      `${n} train services from ${a} to ${b}: first departure ${first}, fastest journey ${fastest}. Departure and arrival times, train type and running days.`,
    h1: (a: string, b: string) => `${a} to ${b}: train timetable`,
    intro: (a: string, b: string, n: number, first: string, last: string, fastest: string) =>
      `There are ${n} train services from ${a} to ${b}. The first departs at ${first} and the last at ${last}. The fastest journey takes ${fastest}.`,
    trains: "Services",
    fastest: "Fastest",
    first: "First departure",
    last: "Last departure",
    train: "Train",
    departs: "Departs",
    arrives: "Arrives",
    duration: "Journey time",
    runs: "Runs",
    fare: "Fare",
    nextDay: "next day",
    map: "See it on the map",
    mapText: "Follow the trains and the route on the live map.",
    reverse: "Opposite direction",
    more: (a: string) => `More routes from ${a}`,
    note: "Times are Tashkent time (UTC+5). Times at intermediate stops are estimates. Check eticket.railway.uz before you buy a ticket.",
    home: "Home",
    all: "All routes",
    currency: "UZS",
  },
} as const;

// "bare" drops the abbreviation dot, so a duration inside a sentence never ends with "..".
const duration = (lang: Lang, minutes: number, bare = false) => {
  const text =
    minutes >= 60
      ? translate(lang, "dur.hm", { h: Math.floor(minutes / 60), m: minutes % 60 })
      : translate(lang, "dur.m", { m: minutes });
  return bare ? text.replace(/\.$/, "") : text;
};

const days = (lang: Lang, rule: RouteTrip["days"]) =>
  rule.kind === "weekdays"
    ? rule.days.map((day) => translate(lang, `weekday.${day}` as MessageKey)).join(", ")
    : translate(lang, `days.${rule.kind}` as MessageKey);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, from, to } = await params;
  const pair = isLang(lang) ? findRoutePair(from, to) : undefined;
  if (!isLang(lang) || !pair) notFound();
  const a = placeName(pair.from.name, lang);
  const b = placeName(pair.to.name, lang);
  const fastest = Math.min(...pair.trips.map((trip) => trip.minutes));
  const path = `/trains/${from}/${to}`;
  const description = COPY[lang].description(a, b, pair.trips.length, pair.trips[0].depart, duration(lang, fastest, true));
  return pageMetadata(lang, path, { title: COPY[lang].title(a, b), description });
}

export default async function RoutePage({ params }: Props) {
  const { lang, from, to } = await params;
  const pair = isLang(lang) ? findRoutePair(from, to) : undefined;
  if (!isLang(lang) || !pair) notFound();
  const c = COPY[lang];
  const a = placeName(pair.from.name, lang);
  const b = placeName(pair.to.name, lang);
  const path = `/trains/${from}/${to}`;
  const fastest = Math.min(...pair.trips.map((trip) => trip.minutes));
  const first = pair.trips[0].depart;
  const last = pair.trips[pair.trips.length - 1].depart;
  const hasFare = pair.trips.some((trip) => trip.price);
  const pairs = getRoutePairs();
  const reverse = pairs.find((item) => item.from.id === pair.to.id && item.to.id === pair.from.id);
  const related = pairs.filter((item) => item.from.id === pair.from.id && item !== pair && item !== reverse).slice(0, 8);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: c.home, item: absoluteUrl(localePath(lang)) },
        { "@type": "ListItem", position: 2, name: c.all, item: absoluteUrl(localePath(lang, "/trains")) },
        { "@type": "ListItem", position: 3, name: `${a} → ${b}`, item: absoluteUrl(localePath(lang, path)) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: c.h1(a, b),
      numberOfItems: pair.trips.length,
      itemListElement: pair.trips.map((trip, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TrainTrip",
          trainName: trip.brand ?? `№ ${trip.number}`,
          trainNumber: trip.number,
          departureStation: { "@type": "TrainStation", name: a },
          arrivalStation: { "@type": "TrainStation", name: b },
          departureTime: `${trip.depart}:00+05:00`,
          arrivalTime: `${trip.arrive}:00+05:00`,
        },
      })),
    },
  ];

  return (
    <PageShell lang={lang} path={path}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link href={localePath(lang)} className="hover:text-foreground">{c.home}</Link>
        <span aria-hidden="true">/</span>
        <Link href={localePath(lang, "/trains")} className="hover:text-foreground">{c.all}</Link>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance md:text-4xl">{c.h1(a, b)}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {c.intro(a, b, pair.trips.length, first, last, duration(lang, fastest, true))}
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-2.5">
        {[
          [c.trains, String(pair.trips.length)],
          [c.first, first],
          [c.fastest, duration(lang, fastest)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card px-3 py-3">
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
            <dd className="mt-1 text-base font-semibold tabular-nums md:text-lg">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">{c.h1(a, b)}</caption>
          <thead>
            <tr className="border-b text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="py-2 pr-3 font-medium">{c.train}</th>
              <th scope="col" className="py-2 pr-3 font-medium">{c.departs}</th>
              <th scope="col" className="py-2 pr-3 font-medium">{c.arrives}</th>
              <th scope="col" className="py-2 pr-3 font-medium">{c.duration}</th>
              <th scope="col" className="py-2 pr-3 font-medium">{c.runs}</th>
              {hasFare && <th scope="col" className="py-2 font-medium">{c.fare}</th>}
            </tr>
          </thead>
          <tbody>
            {pair.trips.map((trip) => (
              <tr key={trip.number} className="border-b border-border/60">
                <th scope="row" className="py-3 pr-3 font-semibold tabular-nums">
                  № {trip.number}
                  {trip.brand && <span className="ml-2 text-xs font-medium text-muted-foreground">{trip.brand}</span>}
                </th>
                <td className="py-3 pr-3 font-semibold tabular-nums">{trip.depart}</td>
                <td className="py-3 pr-3 tabular-nums">
                  <span className="font-semibold">{trip.arrive}</span>
                  {trip.nextDay && <span className="ml-1.5 text-[11px] text-muted-foreground">{c.nextDay}</span>}
                </td>
                <td className="py-3 pr-3 whitespace-nowrap tabular-nums">{duration(lang, trip.minutes)}</td>
                <td className="py-3 pr-3 text-muted-foreground">{days(lang, trip.days)}</td>
                {hasFare && (
                  <td className="py-3 whitespace-nowrap tabular-nums">
                    {trip.price ? `${new Intl.NumberFormat("en").format(trip.price).replace(/,/g, " ")} ${c.currency}` : "-"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.note}</p>

      <div className="mt-8 flex flex-col items-start gap-1 rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold">{c.map}</p>
        <p className="text-sm text-muted-foreground">{c.mapText}</p>
        <Link href={localePath(lang)} className="mt-2 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
          {c.map}
        </Link>
      </div>

      {(reverse || related.length > 0) && (
        <section className="mt-10">
          {reverse && (
            <p className="text-sm">
              {c.reverse}:{" "}
              <Link href={localePath(lang, `/trains/${reverse.slug.from}/${reverse.slug.to}`)} className="font-semibold text-primary underline-offset-4 hover:underline">
                {placeName(reverse.from.name, lang)} → {placeName(reverse.to.name, lang)}
              </Link>
            </p>
          )}
          {related.length > 0 && (
            <>
              <h2 className="mt-6 text-sm font-semibold text-muted-foreground">{c.more(a)}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {related.map((item) => (
                  <li key={item.slug.to}>
                    <Link
                      href={localePath(lang, `/trains/${item.slug.from}/${item.slug.to}`)}
                      className="inline-flex h-8 items-center rounded-full border bg-card px-3 text-xs font-semibold transition-colors hover:bg-accent"
                    >
                      {placeName(item.to.name, lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </PageShell>
  );
}
