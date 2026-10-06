import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Uzbek (the default language) is served at the root and English under /en, so each language has its own
// crawlable URL. Internally the root is rewritten to /uz, and a stray /uz URL is sent back to the root.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (first === "en") return NextResponse.next();

  if (first === "uz") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  // A returning visitor who picked English goes to the English page. Crawlers carry no cookie, so they
  // always see the default URLs, and no language is guessed from headers.
  if (request.cookies.get("traintracker-lang")?.value === "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/uz${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except Next internals, API routes and files with an extension (icons, robots.txt, sitemap.xml, ...).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
