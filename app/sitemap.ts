import type { MetadataRoute } from "next";
import { absoluteUrl, localePath } from "@/lib/seo";
import { getRoutePairs } from "@/lib/seo-routes";

// Every page is listed in both languages, each entry pointing at its translation (hreflang).
const LAST_MODIFIED = new Date("2026-10-06");

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly") => ({
    url: absoluteUrl(localePath("uz", path)),
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
    alternates: { languages: { uz: absoluteUrl(localePath("uz", path)), en: absoluteUrl(localePath("en", path)) } },
  });
  const pages = [
    page("/", 1, "daily"),
    page("/trains", 0.8, "weekly"),
    page("/about", 0.5, "monthly"),
    page("/privacy", 0.2, "monthly"),
    page("/terms", 0.2, "monthly"),
  ];
  for (const pair of getRoutePairs()) pages.push(page(`/trains/${pair.slug.from}/${pair.slug.to}`, 0.7, "weekly"));
  // The English URLs get their own entries, so the sitemap lists every indexable URL once.
  return pages.flatMap((entry) => {
    const english = entry.alternates.languages.en;
    return [entry, { ...entry, url: english }];
  });
}
