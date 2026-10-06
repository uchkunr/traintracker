import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { placeName } from "@/lib/i18n";
import { AUTHOR, SEO, SITE_URL, absoluteUrl, isLang, jsonLd, localePath, pageMetadata } from "@/lib/seo";
import { getRoutePairs } from "@/lib/seo-routes";
import Home from "./home-client";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "/", { description: SEO[lang].description });
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const seo = SEO[lang];
  const url = absoluteUrl(localePath(lang));
  const popular = getRoutePairs().slice(0, 12);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: seo.siteName,
      description: seo.description,
      inLanguage: ["uz", "en"],
      publisher: { "@id": `${SITE_URL}/#author` },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${url}#app`,
      url,
      name: seo.siteName,
      description: seo.description,
      applicationCategory: "TravelApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      inLanguage: lang,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
      author: { "@id": `${SITE_URL}/#author` },
    },
    { "@context": "https://schema.org", "@type": "Person", "@id": `${SITE_URL}/#author`, name: AUTHOR.name, url: SITE_URL },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <Home />
      {/* Plain text for crawlers and screen readers: what the page is, and links to the route timetables. */}
      <section className="sr-only" aria-label={seo.siteName}>
        <h2>{seo.title}</h2>
        <p>{seo.description}</p>
        <nav aria-label={seo.tripsTitle}>
          <ul>
            {popular.map((pair) => (
              <li key={`${pair.slug.from}-${pair.slug.to}`}>
                <Link href={localePath(lang, `/trains/${pair.slug.from}/${pair.slug.to}`)}>
                  {placeName(pair.from.name, lang)} → {placeName(pair.to.name, lang)}
                </Link>
              </li>
            ))}
            <li>
              <Link href={localePath(lang, "/trains")}>{seo.tripsTitle}</Link>
            </li>
            <li>
              <Link href={localePath(lang, "/about")}>{seo.aboutTitle}</Link>
            </li>
          </ul>
        </nav>
      </section>
    </>
  );
}
