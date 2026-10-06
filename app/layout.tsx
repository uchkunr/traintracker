import type { Metadata } from "next";
import Script from "next/script";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

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

export const metadata: Metadata = {
  title: "TrainTracker.uz - Poyezdlar xaritasi",
  description:
    "O‘zbekiston poyezdlari, bekatlari va yo‘nalishlari xaritasi. Namoyish rejimi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mapboxToken = process.env.MAPBOX_API_KEY;
  const yandexMapsKey = process.env.YANDEX_MAPS_KEY;
  const googleMapsKey = process.env.GMAP_API_KEY;

  return (
    <html
      lang="uz"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {yandexMapsKey && (
          <Script
            id="yandex-maps-api"
            src={`https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(yandexMapsKey)}&lang=ru_RU`}
            strategy="beforeInteractive"
          />
        )}
        <meta
          name="traintracker-mapbox-token"
          content={mapboxToken?.startsWith("pk.") ? mapboxToken : ""}
        />
        <meta name="traintracker-google-maps-key" content={googleMapsKey ?? ""} />
      </head>
      <body className={`${outfit.className} h-full w-full overflow-hidden flex flex-col bg-background text-foreground`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
