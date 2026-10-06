import { cookies, headers } from "next/headers";
import type { Lang } from "./i18n";

// Saved choice first, then the browser language, so the server renders the right language from the start.
export async function getLang(): Promise<Lang> {
  const saved = (await cookies()).get("traintracker-lang")?.value;
  if (saved === "uz" || saved === "en") return saved;
  return (await headers()).get("accept-language")?.toLowerCase().startsWith("en") ? "en" : "uz";
}
