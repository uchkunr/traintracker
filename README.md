# TrainTracker.uz

Uzbekistan train map and timetable (O‘zbekiston poyezdlari xaritasi va jadvali). Built with Next.js, MapLibre and OpenFreeMap vector tiles.

```bash
npm run dev
```

## Languages and URLs

Each language has its own crawlable URL: Uzbek (default) at the root, English under `/en`.

| Page | Uzbek | English |
| --- | --- | --- |
| Map | `/` | `/en` |
| About | `/about` | `/en/about` |
| All routes | `/trains` | `/en/trains` |
| Route timetable | `/trains/<from>/<to>` | `/en/trains/<from>/<to>` |

`proxy.ts` rewrites the root to `/uz` internally and redirects a stray `/uz` URL back. A returning visitor who chose English (cookie `traintracker-lang`) is redirected to `/en`; crawlers carry no cookie and always get the default URLs.

## SEO

- Per-page `title`, `description`, canonical, `hreflang` (`uz`, `en`, `x-default`), Open Graph and Twitter cards (`lib/seo.ts`, `pageMetadata`).
- JSON-LD: `WebSite`, `WebApplication`, `AboutPage`, `BreadcrumbList`, `ItemList` of `TrainTrip`.
- `/sitemap.xml` lists every page in both languages with alternates, `/robots.txt` points to it.
- Route pages (`lib/seo-routes.ts`) are generated for every pair of stations with at least 5 trains calling at both, from the timetable data.
- Share image and Apple icon are static files in `public/` (`og-image.png` 1200x630, `apple-touch-icon.png`).

Environment variables (all optional):

- `NEXT_PUBLIC_SITE_URL`: the public address, used for canonical URLs, the sitemap and social cards. Defaults to `https://traintracker-beta.vercel.app`; set it when the final domain is in place.
- `GOOGLE_SITE_VERIFICATION`, `YANDEX_SITE_VERIFICATION`: verification tokens for Search Console and Yandex Webmaster.
