import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AUTHOR, SEO, SITE_URL, absoluteUrl, isLang, jsonLd, localePath, pageMetadata } from "@/lib/seo";
import { AboutContent } from "./about-content";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const seo = SEO[lang];
  return pageMetadata(lang, "/about", { title: seo.aboutTitle, description: seo.aboutDescription });
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const seo = SEO[lang];
  const url = absoluteUrl(localePath(lang, "/about"));
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      url,
      name: `${seo.aboutTitle} | ${seo.siteName}`,
      description: seo.aboutDescription,
      inLanguage: lang,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${absoluteUrl(localePath(lang))}#app` },
      author: { "@type": "Person", name: AUTHOR.name },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: seo.siteName, item: absoluteUrl(localePath(lang)) },
        { "@type": "ListItem", position: 2, name: seo.aboutTitle, item: url },
      ],
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <AboutContent />
    </>
  );
}
