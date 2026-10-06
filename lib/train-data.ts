import type { ScheduleEntry } from "./schedule";
import { SCHEDULE } from "./schedule";

export type Coordinate = [number, number];
export interface Station { id: string; name: string; coordinates: Coordinate; source: string }
// Station points from OSM/Wikidata, retrieved 2026-10-06. Shahrisabz uses Kitob station.
export const STATIONS: Station[] = [
  {
    "id": "Toshkent Markaziy",
    "name": "Toshkent Markaziy",
    "coordinates": [
      69.2874028,
      41.2909763
    ],
    "source": "https://www.openstreetmap.org/node/2204812766"
  },
  {
    "id": "Toshkent Janubiy",
    "name": "Toshkent Janubiy",
    "coordinates": [
      69.2263009,
      41.2590009
    ],
    "source": "https://www.openstreetmap.org/node/8321581319"
  },
  {
    "id": "Buxoro",
    "name": "Buxoro",
    "coordinates": [
      64.5484124,
      39.7224941
    ],
    "source": "https://www.openstreetmap.org/node/8328285677"
  },
  {
    "id": "Qarshi",
    "name": "Qarshi",
    "coordinates": [
      65.7770168,
      38.8213997
    ],
    "source": "https://www.openstreetmap.org/node/1555410151"
  },
  {
    "id": "Samarqand",
    "name": "Samarqand",
    "coordinates": [
      66.9290035,
      39.6859605
    ],
    "source": "https://www.openstreetmap.org/node/2279305298"
  },
  {
    "id": "Andijon",
    "name": "Andijon",
    "coordinates": [
      72.3505727,
      40.7629613
    ],
    "source": "https://www.openstreetmap.org/node/296078271"
  },
  {
    "id": "Namangan",
    "name": "Namangan",
    "coordinates": [
      71.6440269,
      40.9995907
    ],
    "source": "https://www.openstreetmap.org/node/301722995"
  },
  {
    "id": "Qo'qon",
    "name": "Qo'qon",
    "coordinates": [
      70.9284653,
      40.5190131
    ],
    "source": "https://www.openstreetmap.org/node/1587385859"
  },
  {
    "id": "Marg‘ilon",
    "name": "Marg‘ilon",
    "coordinates": [
      71.7230867,
      40.4425753
    ],
    "source": "https://www.openstreetmap.org/node/246213673"
  },
  {
    "id": "Pop",
    "name": "Pop",
    "coordinates": [
      71.1494379,
      40.8573043
    ],
    "source": "https://www.openstreetmap.org/node/1587386136"
  },
  {
    "id": "Termiz",
    "name": "Termiz",
    "coordinates": [
      67.2860679,
      37.2511428
    ],
    "source": "https://www.openstreetmap.org/node/1584479577"
  },
  {
    "id": "Sariosiyo",
    "name": "Sariosiyo",
    "coordinates": [
      68.0087199,
      38.3671625
    ],
    "source": "https://www.openstreetmap.org/node/245671297"
  },
  {
    "id": "Qo'ng'irot",
    "name": "Qo'ng'irot",
    "coordinates": [
      58.8413277,
      43.0407388
    ],
    "source": "https://www.openstreetmap.org/node/1583746274"
  },
  {
    "id": "Xiva",
    "name": "Xiva",
    "coordinates": [
      60.3765965,
      41.3771547
    ],
    "source": "https://www.openstreetmap.org/node/5793725055"
  },
  {
    "id": "Urganch",
    "name": "Urganch",
    "coordinates": [
      60.6321451,
      41.536503
    ],
    "source": "https://www.openstreetmap.org/node/1585865853"
  },
  {
    "id": "Shovot",
    "name": "Shovot",
    "coordinates": [
      60.2757229,
      41.7071568
    ],
    "source": "https://www.openstreetmap.org/node/1584776372"
  },
  {
    "id": "Olot",
    "name": "Olot",
    "coordinates": [
      63.7968419,
      39.4121559
    ],
    "source": "https://www.openstreetmap.org/node/1588243859"
  },
  {
    "id": "Shahrisabz",
    "name": "Shahrisabz",
    "coordinates": [
      66.8374538,
      39.0902778
    ],
    "source": "https://www.openstreetmap.org/node/245607879"
  },
  {
    "id": "Navoiy",
    "name": "Navoiy",
    "coordinates": [
      65.3963013,
      40.0729708
    ],
    "source": "https://www.openstreetmap.org/node/1238436292"
  },
  {
    "id": "Jizzax",
    "name": "Jizzax",
    "coordinates": [
      67.8424517,
      40.0982111
    ],
    "source": "https://www.openstreetmap.org/node/8327788744"
  },
  {
    "id": "Guliston",
    "name": "Guliston",
    "coordinates": [
      68.7648655,
      40.4961686
    ],
    "source": "https://www.openstreetmap.org/node/8343551120"
  },
  {
    "id": "Volgograd",
    "name": "Volgograd",
    "coordinates": [
      44.51361111111111,
      48.712500000000006
    ],
    "source": "https://www.wikidata.org/wiki/Q4122943"
  },
  {
    "id": "Moskva",
    "name": "Moskva",
    "coordinates": [
      37.63958888888889,
      55.72983055555556
    ],
    "source": "https://www.wikidata.org/wiki/Q1394233"
  },
  {
    "id": "Qozon",
    "name": "Qozon",
    "coordinates": [
      49.100121111111115,
      55.78822888888889
    ],
    "source": "https://www.wikidata.org/wiki/Q34085"
  },
  {
    "id": "Olmaota",
    "name": "Olmaota",
    "coordinates": [
      76.93925,
      43.27376
    ],
    "source": "https://www.openstreetmap.org/way/142743485"
  },
  {
    "id": "Dushanbe",
    "name": "Dushanbe",
    "coordinates": [
      68.79966,
      38.55706
    ],
    "source": "https://www.openstreetmap.org/way/27505635"
  }
];

export interface RailNetwork {
  type: "FeatureCollection";
  features: { type: "Feature"; properties: { id: string; fromStation: string; toStation: string; osmWays: number[] }; geometry: { type: "LineString"; coordinates: Coordinate[] } }[];
}
export interface RailRoute { coordinates: Coordinate[]; cumulative: number[]; distance: number }

// International passenger corridors are simplified through their principal railway junctions.
export const INTERNATIONAL_RAIL_SEGMENTS: RailNetwork["features"] = [
  {
    type: "Feature",
    properties: { id: "Toshkent Markaziy|Arys", fromStation: "Toshkent Markaziy", toStation: "Arys", osmWays: [] },
    geometry: {
      type: "LineString",
      coordinates: [
        [69.2874028, 41.2909763], [69.196, 41.387], [69.165, 41.464],
        [69.399, 42.02], [69.59, 42.315], [68.804, 42.43],
      ],
    },
  },
  {
    type: "Feature",
    properties: { id: "Arys|Olmaota", fromStation: "Arys", toStation: "Olmaota", osmWays: [] },
    geometry: {
      type: "LineString",
      coordinates: [
        [68.804, 42.43], [69.88, 42.48], [70.26, 42.49], [71.37, 42.9],
        [72.7, 43.3], [73.76, 43.6], [75.21, 43.53], [76.48, 43.41], [76.93925, 43.27376],
      ],
    },
  },
  {
    type: "Feature",
    properties: { id: "Arys|Aqtobe", fromStation: "Arys", toStation: "Aqtobe", osmWays: [] },
    geometry: {
      type: "LineString",
      coordinates: [
        [68.804, 42.43], [68.25, 43.3], [67.25, 43.92], [66.75, 44.18],
        [65.49, 44.85], [64.08, 45.49], [62.11, 45.76], [61.67, 46.8],
        [60.74, 47.17], [59.62, 47.83], [58.46, 48.82], [57.43, 49.47], [57.17, 50.28],
      ],
    },
  },
  {
    type: "Feature",
    properties: { id: "Aqtobe|Orenburg", fromStation: "Aqtobe", toStation: "Orenburg", osmWays: [] },
    geometry: {
      type: "LineString",
      coordinates: [[57.17, 50.28], [56.49, 50.73], [55.0, 51.16], [55.1, 51.77]],
    },
  },
  {
    type: "Feature",
    properties: { id: "Orenburg|Moskva", fromStation: "Orenburg", toStation: "Moskva", osmWays: [] },
    geometry: {
      type: "LineString",
      coordinates: [
        [55.1, 51.77], [52.26, 52.78], [50.1, 53.19], [48.47, 53.16],
        [45.02, 53.2], [42.27, 53.71], [40.07, 53.71], [38.56, 54.76], [37.6395889, 55.7298306],
      ],
    },
  },
  {
    type: "Feature",
    properties: { id: "Orenburg|Qozon", fromStation: "Orenburg", toStation: "Qozon", osmWays: [] },
    geometry: {
      type: "LineString",
      coordinates: [
        [55.1, 51.77], [52.26, 52.78], [50.1, 53.19], [48.47, 53.16],
        [48.39, 54.31], [48.74, 55.19], [49.1001211, 55.7882289],
      ],
    },
  },
  {
    type: "Feature",
    properties: { id: "Qo'ng'irot|Volgograd", fromStation: "Qo'ng'irot", toStation: "Volgograd", osmWays: [] },
    geometry: {
      type: "LineString",
      coordinates: [
        [58.8413277, 43.0407667], [57.76, 44.06], [56.12, 44.89], [55.1, 45.32],
        [54.02, 46.95], [52.76, 47.11], [51.92, 47.11], [50.28, 46.68],
        [48.8, 46.37], [47.91, 46.36], [46.82, 48.23], [45.21, 48.49],
        [44.74, 48.79], [44.5136111, 48.7125],
      ],
    },
  },
];

function distance(a: Coordinate, b: Coordinate) {
  const radians = Math.PI / 180;
  return 6371 * Math.hypot((b[0] - a[0]) * radians * Math.cos((a[1] + b[1]) / 2 * radians), (b[1] - a[1]) * radians);
}

// Shared static segments are joined once; no browser routing or external data requests.
export function buildRoutes(network: RailNetwork): Record<string, RailRoute | undefined> {
  const segments = network.features.map((feature) => ({ ...feature.properties, coordinates: feature.geometry.coordinates,
    length: feature.geometry.coordinates.reduce((sum, point, i, points) => sum + (i ? distance(points[i - 1], point) : 0), 0) }));
  function connect(from: string, to: string): Coordinate[] | undefined {
    const costs = new Map<string, number>([[from, 0]]);
    const paths = new Map<string, Coordinate[]>([[from, []]]);
    const visited = new Set<string>();
    while (true) {
      const current = [...costs.keys()].filter((key) => !visited.has(key)).sort((a, b) => costs.get(a)! - costs.get(b)!)[0];
      if (!current) return undefined;
      if (current === to) return paths.get(current);
      visited.add(current);
      for (const segment of segments) {
        if (segment.fromStation !== current && segment.toStation !== current) continue;
        const forward = segment.fromStation === current;
        const next = forward ? segment.toStation : segment.fromStation;
        const cost = costs.get(current)! + segment.length;
        if (cost >= (costs.get(next) ?? Infinity)) continue;
        const part = forward ? segment.coordinates : [...segment.coordinates].reverse();
        const previous = paths.get(current)!;
        costs.set(next, cost);
        paths.set(next, [...previous, ...part.slice(previous.length ? 1 : 0)]);
      }
    }
  }
  const routes: Record<string, RailRoute | undefined> = {};
  const cache = new Map<string, RailRoute | undefined>();
  for (const train of SCHEDULE) {
    const stops = routeWaypoints(train);
    const key = stops.join("|");
    if (cache.has(key)) { routes[train.number] = cache.get(key); continue; }
    const points: Coordinate[] = [];
    let complete = true;
    for (let i = 1; i < stops.length; i++) {
      const part = connect(stops[i - 1], stops[i]);
      if (!part) { complete = false; break; }
      points.push(...part.slice(points.length ? 1 : 0));
    }
    if (!complete || points.length < 2) { cache.set(key, undefined); continue; }
    const cumulative = [0];
    for (let i = 1; i < points.length; i++) cumulative.push(cumulative[i - 1] + distance(points[i - 1], points[i]));
    const route = { coordinates: points, cumulative, distance: cumulative.at(-1)! };
    routes[train.number] = route;
    cache.set(key, route);
  }
  return routes;
}

function routeWaypoints(train: ScheduleEntry) {
  // These shape the railway corridor, not the advertised stopping timetable.
  if (!train.via.length && train.from === "Andijon") return [train.from, "Marg‘ilon", "Qo'qon", "Pop", train.to];
  if (!train.via.length && train.to === "Andijon") return [train.from, "Pop", "Qo'qon", "Marg‘ilon", train.to];
  return [train.from, ...train.via, train.to];
}

export function pointAlong(route: RailRoute, progress: number) {
  const target = Math.max(0, Math.min(1, progress)) * route.distance;
  let low = 1, high = route.cumulative.length - 1;
  while (low < high) { const middle = (low + high) >> 1; if (route.cumulative[middle] < target) low = middle + 1; else high = middle; }
  const a = route.coordinates[low - 1], b = route.coordinates[low];
  const fraction = (target - route.cumulative[low - 1]) / (route.cumulative[low] - route.cumulative[low - 1] || 1);
  const coordinates: Coordinate = [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction];
  const radians = Math.PI / 180;
  const longitude = (b[0] - a[0]) * radians;
  const bearing = Math.atan2(Math.sin(longitude) * Math.cos(b[1] * radians), Math.cos(a[1] * radians) * Math.sin(b[1] * radians) - Math.sin(a[1] * radians) * Math.cos(b[1] * radians) * Math.cos(longitude)) / radians;
  return { coordinates, bearing };
}
