import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Outfit, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "@/lib/use-lang";
import { LANGS, SEO, SITE_URL, isLang, pageMetadata } from "@/lib/seo";

const outfit = Outfit({
  variable: "--font-outfit",
  weight: "variable",
  style: "normal",
  display: "swap",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Only the two supported languages exist; anything else under /[lang] is a 404.
export const dynamicParams = false;
export const generateStaticParams = () => LANGS.map((lang) => ({ lang }));

export const viewport: Viewport = {
  themeColor: "#176451",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const seo = SEO[lang];
  const { title: _title, ...page } = pageMetadata(lang, "/", { description: seo.description });
  void _title;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${seo.siteName} | ${seo.title}`, template: `%s | ${seo.siteName}` },
    ...page,
    applicationName: seo.siteName,
    keywords: [...seo.keywords],
    authors: [{ name: "Uchkun Rakhimov" }],
    creator: "Uchkun Rakhimov",
    category: "travel",
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.svg", type: "image/svg+xml" }],
      apple: "/apple-touch-icon.png",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    formatDetection: { telephone: false, address: false, email: false },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_SITE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const mapboxToken = process.env.MAPBOX_API_KEY;
  const yandexMapsKey = process.env.YANDEX_MAPS_KEY;
  const googleMapsKey = process.env.GMAP_API_KEY;

  return (
    <html lang={lang} className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* The map style and tiles are the first thing the page asks for, so open the connection early. */}
        <link rel="preconnect" href="https://tiles.openfreemap.org" crossOrigin="anonymous" />
        {yandexMapsKey && (
          <Script
            id="yandex-maps-api"
            src={`https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(yandexMapsKey)}&lang=ru_RU`}
            strategy="beforeInteractive"
          />
        )}
        <meta name="traintracker-mapbox-token" content={mapboxToken?.startsWith("pk.") ? mapboxToken : ""} />
        <meta name="traintracker-google-maps-key" content={googleMapsKey ?? ""} />
      </head>
      <body className={`${outfit.className} h-full w-full overflow-hidden flex flex-col bg-background text-foreground`}>
        <LangProvider initial={lang}>
          <TooltipProvider>{children}</TooltipProvider>
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
