import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "dynamic-media-cdn.tripadvisor.com" },
      { protocol: "https", hostname: "uzrailpass.uz" },
      { protocol: "https", hostname: "avatars.mds.yandex.net" },
      { protocol: "https", hostname: "central-asia.guide" },
      { protocol: "https", hostname: "www.advantour.com" },
      { protocol: "https", hostname: "yuz.uz" },
      { protocol: "https", hostname: "cdn.uza.uz" },
      { protocol: "https", hostname: "wikimedia-commons.fra1.cdn.digitaloceanspaces.com" },
      { protocol: "https", hostname: "megotel.ru" },
      { protocol: "https", hostname: "mf.b37mrtl.ru" },
      { protocol: "https", hostname: "vagon-vokzal.ru" },
      { protocol: "https", hostname: "ekaraganda.kz" },
      { protocol: "https", hostname: "files.structurae.net" },
    ],
  },
};

export default nextConfig;
