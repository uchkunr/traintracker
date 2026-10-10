import { SCHEDULE, TIME_ZONE, getServiceState, localDateKey, type DayRule } from "./schedule";
import { estimateStops } from "./train-stops";
import { STATIONS, type Station } from "./train-data";
import { TRAIN_INFO } from "./trains-info";

// Indexable route pages: every pair of stations that at least MIN_TRIPS trains call at, in the right order.
// Only the time of day is used, so the pages do not depend on today's date.
const MIN_TRIPS = 5;
const REFERENCE_DAY = Date.parse("2026-10-06T12:00:00+05:00");
const clock = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false });

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’ʻʼ'`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export interface RouteTrip {
  number: string;
  brand?: string;
  type: "fast" | "regular" | "electric";
  depart: string;
  arrive: string;
  minutes: number;
  nextDay: boolean;
  days: DayRule;
  price?: number;
  origin: string;
  destination: string;
}

export interface RoutePair {
  from: Station;
  to: Station;
  slug: { from: string; to: string };
  trips: RouteTrip[];
}

// The running days are the origin's; a stop reached after midnight is served one (or more) days later.
function shiftDays(rule: DayRule, days: number): DayRule {
  if (!days || rule.kind === "daily") return rule;
  if (rule.kind === "weekdays") return { kind: "weekdays", days: rule.days.map((day) => (day + days) % 7).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)) };
  return days % 2 ? { kind: rule.kind === "even" ? "odd" : "even" } : rule;
}

let cache: RoutePair[] | undefined;

export function getRoutePairs(): RoutePair[] {
  if (cache) return cache;
  const byName = new Map(STATIONS.map((station) => [station.name, station]));
  const pairs = new Map<string, RoutePair>();
  for (const entry of SCHEDULE) {
    if (entry.cancelled) continue;
    const train = getServiceState(entry, REFERENCE_DAY);
    const stops = estimateStops(train);
    const info = TRAIN_INFO[train.number];
    for (let i = 0; i < stops.length; i += 1) {
      const from = byName.get(stops[i].name);
      if (!from) continue;
      for (let j = i + 1; j < stops.length; j += 1) {
        const to = byName.get(stops[j].name);
        if (!to) continue;
        const depart = i === 0 ? stops[0].arrival : stops[i].arrival + stops[i].dwell * 60_000;
        const arrive = stops[j].arrival;
        const key = `${from.id}|${to.id}`;
        const pair = pairs.get(key) ?? { from, to, slug: { from: slugify(from.name), to: slugify(to.name) }, trips: [] };
        pair.trips.push({
          number: train.number,
          brand: info?.brand,
          type: train.kind ? "electric" : info ? "fast" : "regular",
          depart: clock.format(depart),
          arrive: clock.format(arrive),
          minutes: Math.round((arrive - depart) / 60_000),
          nextDay: arrive - depart > 0 && new Date(arrive + 5 * 3_600_000).getUTCDate() !== new Date(depart + 5 * 3_600_000).getUTCDate(),
          days: shiftDays(train.departDays, Math.round((Date.parse(localDateKey(depart)) - Date.parse(localDateKey(train.departure))) / 86_400_000)),
          // The fare is for the whole train route, so it is only shown when the page covers all of it.
          price: i === 0 && j === stops.length - 1 ? train.price : undefined,
          origin: train.from,
          destination: train.to,
        });
        pairs.set(key, pair);
      }
    }
  }
  cache = [...pairs.values()]
    .filter((pair) => pair.trips.length >= MIN_TRIPS)
    .map((pair) => ({ ...pair, trips: pair.trips.sort((a, b) => a.depart.localeCompare(b.depart)) }))
    .sort((a, b) => b.trips.length - a.trips.length || a.slug.from.localeCompare(b.slug.from));
  return cache;
}

export const findRoutePair = (from: string, to: string) =>
  getRoutePairs().find((pair) => pair.slug.from === from && pair.slug.to === to);
