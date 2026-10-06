import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/seo/page-shell";
import { placeName } from "@/lib/i18n";
import { SEO, absoluteUrl, isLang, jsonLd, localePath, pageMetadata } from "@/lib/seo";
import { getRoutePairs } from "@/lib/seo-routes";

type Props = { params: Promise<{ lang: string }> };

const COPY = {
  uz: {
    h1: "Poyezd yo‘nalishlari",
    intro: (n: number) =>
      `O‘zbekiston bo‘ylab ${n} ta yo‘nalish bo‘yicha poyezdlar jadvali: har bir yo‘nalishda jo‘nash va yetib borish vaqtlari, poyezd turi, davomiylik va qatnov kunlari.`,
    trips: (n: number) => `${n} ta reys`,
    home: "Bosh sahifa",
  },
  en: {
    h1: "Train routes in Uzbekistan",
    intro: (n: number) =>
      `Train timetables for ${n} routes across Uzbekistan: departure and arrival times, train type, journey time and running days for each route.`,
    trips: (n: number) => `${n} services`,
    home: "Home",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const seo = SEO[lang];
  return pageMetadata(lang, "/trains", { title: seo.tripsTitle, description: seo.tripsDescription });
}

export default async function TrainsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = COPY[lang];
  const pairs = getRoutePairs();
  const groups = new Map<string, typeof pairs>();
  for (const pair of pairs) groups.set(pair.from.name, [...(groups.get(pair.from.name) ?? []), pair]);
  const ordered = [...groups.entries()].sort((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0]));

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: c.home, item: absoluteUrl(localePath(lang)) },
        { "@type": "ListItem", position: 2, name: c.h1, item: absoluteUrl(localePath(lang, "/trains")) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: c.h1,
      description: SEO[lang].tripsDescription,
      inLanguage: lang,
      url: absoluteUrl(localePath(lang, "/trains")),
    },
  ];

  return (
    <PageShell lang={lang} path="/trains">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">{c.h1}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{c.intro(pairs.length)}</p>
      <div className="mt-8 space-y-8">
        {ordered.map(([origin, items]) => (
          <section key={origin}>
            <h2 className="text-lg font-semibold tracking-tight">{placeName(origin, lang)}</h2>
            <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {items.map((pair) => (
                <li key={pair.slug.to} className="border-b border-border/60">
                  <Link
                    href={localePath(lang, `/trains/${pair.slug.from}/${pair.slug.to}`)}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:text-primary"
                  >
                    <span className="font-medium">{placeName(pair.to.name, lang)}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{c.trips(pair.trips.length)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
