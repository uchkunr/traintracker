import type { Metadata } from "next";
import type { Lang } from "./i18n";

// The public address of the site. Set NEXT_PUBLIC_SITE_URL when the final domain is in place.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://traintracker-beta.vercel.app").replace(/\/$/, "");

export const LANGS: Lang[] = ["uz", "en"];
export const isLang = (value: string): value is Lang => value === "uz" || value === "en";

// Uzbek is the default language and lives at the root, English under /en.
export const localePath = (lang: Lang, path = "/") => (lang === "uz" ? path : `/en${path === "/" ? "" : path}`);

// canonical + hreflang alternates for one page, as paths (metadataBase makes them absolute).
export const alternates = (lang: Lang, path = "/") => ({
  canonical: localePath(lang, path),
  languages: { uz: localePath("uz", path), en: localePath("en", path), "x-default": localePath("uz", path) },
});

export const SEO = {
  uz: {
    locale: "uz_UZ",
    siteName: "TrainTracker.uz",
    title: "O‘zbekiston poyezdlari xaritasi va jadvali",
    description:
      "O‘zbekiston poyezdlarini xaritada kuzating: Afrosiyob, Sharq, Nasaf va elektr poyezdlar jadvali, bekatlar, jo‘nash va yetib borish vaqti, narxlar. Toshkent, Samarqand, Buxoro va boshqa yo‘nalishlar.",
    keywords: [
      "poyezd jadvali", "O‘zbekiston poyezdlari", "Afrosiyob jadvali", "Toshkent Samarqand poyezd", "temir yo‘l",
      "poyezd narxlari", "elektr poyezd", "poyezd xaritasi", "Sharq poyezdi", "Nasaf poyezdi", "TrainTracker",
    ],
    aboutTitle: "Loyiha haqida",
    aboutDescription: "Poyezdlar jadvali xaritada: ma’lumotlar qayerdan olingani va joylashuv qanday hisoblanishi.",
    tripsTitle: "Poyezd yo‘nalishlari",
    tripsDescription: "O‘zbekiston bo‘ylab poyezd yo‘nalishlari: Toshkent, Samarqand, Buxoro, Qarshi va boshqa shaharlar orasidagi reyslar jadvali.",
  },
  en: {
    locale: "en_US",
    siteName: "TrainTracker.uz",
    title: "Uzbekistan train map and timetable",
    description:
      "See Uzbekistan's trains on a map: Afrosiyob, Sharq, Nasaf and suburban electric train timetables, stations, departure and arrival times, and fares. Tashkent, Samarkand, Bukhara and more.",
    keywords: [
      "Uzbekistan train timetable", "Uzbekistan trains", "Afrosiyob schedule", "Tashkent Samarkand train", "Uzbekistan railway",
      "train fares Uzbekistan", "suburban electric train", "train map", "Sharq train", "Nasaf train", "TrainTracker",
    ],
    aboutTitle: "About",
    aboutDescription: "Trains on a map: where the data comes from and how the position is calculated.",
    tripsTitle: "Train routes in Uzbekistan",
    tripsDescription: "Train routes across Uzbekistan: timetables for services between Tashkent, Samarkand, Bukhara, Karshi and other cities.",
  },
} as const satisfies Record<Lang, Record<string, unknown>>;

export const AUTHOR = { name: "Uchkun Rakhimov", url: SITE_URL };

// JSON-LD is serialized with "<" escaped so the payload can never close the script tag.
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

export const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: "TrainTracker.uz" };

// Complete metadata for one page. Next.js replaces nested objects instead of merging them, so every page
// states its own openGraph and twitter data in full rather than inheriting a partial one.
export function pageMetadata(lang: Lang, path: string, { title, description }: { title?: string; description: string }): Metadata {
  const seo = SEO[lang];
  const other = lang === "uz" ? "en" : "uz";
  const full = title ? `${title} | ${seo.siteName}` : `${seo.siteName} | ${seo.title}`;
  const alt = alternates(lang, path);
  return {
    title: title ?? { absolute: full },
    description,
    alternates: alt,
    openGraph: {
      type: "website",
      siteName: seo.siteName,
      title: full,
      description,
      url: alt.canonical,
      locale: seo.locale,
      alternateLocale: [SEO[other].locale],
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: full, description, images: [OG_IMAGE.url] },
  };
}
