"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Gauge,
  LocateFixed,
  MapPin,
  TramFront,
  Info,
  SlidersHorizontal,
  Banknote,
  ListOrdered,
  TriangleAlert,
  Ruler,
  Minus,
  Plus,
  ArrowUpDown,
  Search,
  TrainFront,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  OpenStreetMapRailMap,
  type OpenStreetMapRailMapRef,
} from "@/components/train-tracker/OpenStreetMapRailMap";
import Image from "next/image";
import {
  INTERNATIONAL_RAIL_SEGMENTS,
  STATIONS,
  buildRoutes,
  pointAlong,
  type Coordinate,
  type RailNetwork,
} from "@/lib/train-data";
import {
  SCHEDULE,
  getServiceState,
  type DayRule,
  type ScheduledTrain,
} from "@/lib/schedule";
import {
  placeName,
  translate,
  type MessageKey,
} from "@/lib/i18n";
import { STATION_INFO } from "@/lib/station-info";
import { TRAIN_INFO } from "@/lib/trains-info";
import { useLang } from "@/lib/use-lang";
import { estimateStops, stopNames } from "@/lib/train-stops";

const detailTime = new Intl.DateTimeFormat("uz", {
  timeZone: "Asia/Tashkent",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const detailDate = new Intl.DateTimeFormat("uz", {
  timeZone: "Asia/Tashkent",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const SHEET_TRANSITION =
  "translate 420ms cubic-bezier(0.32, 0.72, 0, 1), transform 420ms cubic-bezier(0.32, 0.72, 0, 1), opacity 250ms ease-out, height 380ms cubic-bezier(0.32, 0.72, 0, 1)";
type TrainType = "fast" | "regular" | "electric";
const trainType = (train: ScheduledTrain): TrainType =>
  train.kind ? "electric" : TRAIN_INFO[train.number] ? "fast" : "regular";

export default function Home() {
  const mapRef = useRef<OpenStreetMapRailMapRef>(null);
  const [now, setNow] = useState<number | null>(null);
  const [network, setNetwork] = useState<RailNetwork | null>(null);
  const [palette, setPalette] = useState<{
    accent: string;
    rail: string;
    casing: string;
  } | null>(null);
  const [electricLines, setElectricLines] = useState<Record<
    string,
    Coordinate[]
  > | null>(null);
  const routes = useMemo(
    () => (network ? buildRoutes(network, electricLines ?? undefined) : {}),
    [network, electricLines],
  );
  // The drawn network also includes the suburban lines so those trains always ride on a visible rail.
  const drawnNetwork = useMemo(
    () =>
      network && electricLines
        ? {
            ...network,
            features: [
              ...network.features,
              ...Object.entries(electricLines).map(([id, coordinates]) => ({
                type: "Feature" as const,
                properties: {
                  id: `electric-${id}`,
                  fromStation: "",
                  toStation: "",
                  osmWays: [],
                },
                geometry: { type: "LineString" as const, coordinates },
              })),
            ],
          }
        : network,
    [network, electricLines],
  );
  const trains = useMemo(
    () =>
      now === null ? [] : SCHEDULE.map((train) => getServiceState(train, now)),
    [now],
  );
  const [lang, setLang] = useLang();
  const t = (key: MessageKey, vars?: Record<string, string | number>) =>
    translate(lang, key, vars);
  const place = (name: string) => placeName(name, lang);
  const num = (value: number) =>
    value.toLocaleString("ru-RU").replace(/\s/g, " ");
  const money = (value: number) => `${num(value)} ${t("currency")}`;
  const duration = (ms: number) => {
    const minutes = Math.round(ms / 60_000);
    return t("dur.hm", { h: Math.floor(minutes / 60), m: minutes % 60 });
  };
  const daysLabel = (rule: DayRule) =>
    rule.kind === "weekdays"
      ? rule.days.map((day) => t(`weekday.${day}` as MessageKey)).join(", ")
      : t(`days.${rule.kind}` as MessageKey);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("running");
  const [category, setCategory] = useState<TrainType | "all">("all");
  const [region, setRegion] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [stationId, setStationId] = useState<string | null>(null);
  const [stationViewState, setStationViewState] = useState<{
    id: string | null;
    tab: string;
    type: string;
  }>({ id: null, tab: "departure", type: "all" });
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [mapAttempt, setMapAttempt] = useState(0);
  const [sheetH, setSheetH] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [routeField, setRouteField] = useState<"from" | "to">("from");
  const [routeText, setRouteText] = useState({ from: "", to: "" });
  const [leg, setLeg] = useState<{
    from: string;
    to: string;
    depart: number;
    arrive: number;
  } | null>(null);
  const [routePick, setRoutePick] = useState<{
    from: string | null;
    to: string | null;
  }>({ from: null, to: null });
  const [cookieChoice, setCookieChoice] = useState<string | null>("pending");
  const drag = useRef<{
    active: boolean;
    sheet: HTMLElement | null;
    startY: number;
    startH: number;
    h: number;
    lastY: number;
    lastT: number;
    velocity: number;
    frame: number;
  }>({
    active: false,
    sheet: null,
    startY: 0,
    startH: 0,
    h: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
    frame: 0,
  });
  useEffect(() => {
    const frame = requestAnimationFrame(() => setNow(Date.now()));
    const timer = window.setInterval(() => {
      if (!drag.current.active) setNow(Date.now());
    }, 1000);
    const controller = new AbortController();
    fetch("/railways.geojson", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Rail geometry unavailable");
        return response.json();
      })
      .then((data: RailNetwork) =>
        setNetwork({
          ...data,
          features: [...data.features, ...INTERNATIONAL_RAIL_SEGMENTS],
        }),
      )
      .catch((error: Error) => {
        if (error.name !== "AbortError") setMapStatus("error");
      });
    const loadElectric = (attempt: number) =>
      fetch("/electric-routes.json", { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Electric routes unavailable");
          return response.json();
        })
        .then(
          (data: { routes: Record<string, { coordinates: Coordinate[] }> }) =>
            setElectricLines(
              Object.fromEntries(
                Object.entries(data.routes).map(([id, route]) => [
                  id,
                  route.coordinates,
                ]),
              ),
            ),
        )
        .catch((error: Error) => {
          if (error.name !== "AbortError" && attempt < 3)
            window.setTimeout(
              () => loadElectric(attempt + 1),
              2000 * (attempt + 1),
            );
        });
    loadElectric(0);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    document.title = translate(lang, "meta.title");
  }, [lang]);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mobile.matches);
    const frame = requestAnimationFrame(() => {
      sync();
      const styles = getComputedStyle(document.documentElement);
      setPalette({
        accent: styles.getPropertyValue("--rail-active").trim(),
        rail: styles.getPropertyValue("--rail-track").trim(),
        casing: styles.getPropertyValue("--rail-casing").trim(),
      });
    });
    mobile.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      mobile.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!listOpen && !stationId && !detailsOpen) return;
    const frame = requestAnimationFrame(() => setSheetH(null));
    return () => cancelAnimationFrame(frame);
  }, [listOpen, stationId, detailsOpen]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setCookieChoice(localStorage.getItem("traintracker-cookies"));
      } catch {
        setCookieChoice(null);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const answerCookies = (choice: "accepted" | "refused") => {
    try {
      localStorage.setItem("traintracker-cookies", choice);
    } catch {
      /* The choice only lasts for this visit. */
    }
    setCookieChoice(choice);
  };

  useEffect(() => {
    if (!photoOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhotoOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [photoOpen]);

  const sheetStyle = isMobile
    ? { height: sheetH ?? "58dvh", transition: SHEET_TRANSITION }
    : undefined;
  // The drag writes the height straight to the DOM (one write per frame) so React does not re-render the map and list while the finger moves.
  const sheetHandle = (
    <div
      role="separator"
      aria-label={t("sheet.drag")}
      className="flex h-10 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      onPointerDown={(event) => {
        const sheet = event.currentTarget.parentElement as HTMLElement;
        event.currentTarget.setPointerCapture(event.pointerId);
        const startH = sheet.offsetHeight;
        drag.current = {
          active: true,
          sheet,
          startY: event.clientY,
          startH,
          h: startH,
          lastY: event.clientY,
          lastT: performance.now(),
          velocity: 0,
          frame: 0,
        };
        sheet.style.transition =
          "transform 200ms ease-in-out, opacity 200ms ease-in-out";
      }}
      onPointerMove={(event) => {
        const d = drag.current;
        if (!d.active || !d.sheet) return;
        const at = performance.now();
        d.velocity = (d.lastY - event.clientY) / Math.max(1, at - d.lastT);
        d.lastY = event.clientY;
        d.lastT = at;
        d.h = Math.min(
          window.innerHeight,
          Math.max(96, d.startH + d.startY - event.clientY),
        );
        if (!d.frame)
          d.frame = requestAnimationFrame(() => {
            d.frame = 0;
            if (d.sheet) d.sheet.style.height = `${d.h}px`;
          });
      }}
      onPointerUp={() => {
        const d = drag.current;
        if (!d.active || !d.sheet) return;
        d.active = false;
        cancelAnimationFrame(d.frame);
        d.frame = 0;
        const snaps = [130, window.innerHeight * 0.5, window.innerHeight];
        const projected = d.h + d.velocity * 220;
        const snap = snaps.reduce((best, value) =>
          Math.abs(value - projected) < Math.abs(best - projected)
            ? value
            : best,
        );
        d.sheet.style.height = `${d.h}px`;
        d.sheet.style.transition = SHEET_TRANSITION;
        void d.sheet.offsetHeight;
        d.sheet.style.height = `${snap}px`;
        setSheetH(snap);
      }}
      onPointerCancel={() => {
        drag.current.active = false;
        cancelAnimationFrame(drag.current.frame);
      }}
    >
      <span className="h-1 w-9 rounded-full bg-border" />
    </div>
  );

  const selected = trains.find((train) => train.number === selectedId);
  const selectedRoute = selected ? routes[selected.number] : undefined;
  const info = selected ? TRAIN_INFO[selected.number] : undefined;
  const detailStops = selected ? estimateStops(selected) : [];
  const untilNext = (() => {
    if (!selected || now === null) return "";
    const minutes = Math.max(
      0,
      Math.round((selected.nextDeparture - now) / 60_000),
    );
    const days = Math.floor(minutes / 1440),
      hours = Math.floor((minutes % 1440) / 60);
    return days > 0
      ? t("dur.dh", { d: days, h: hours })
      : hours > 0
        ? t("dur.hm", { h: hours, m: minutes % 60 })
        : t("dur.m", { m: minutes });
  })();
  const currentStopIndex = selected
    ? Math.max(
        0,
        detailStops.findLastIndex(
          (stop) =>
            stop.progress !== null && stop.progress <= selected.progress,
        ),
      )
    : 0;

  // Opened from a route search: the detail focuses on that part of the journey.
  const legFrom = leg ? detailStops.findIndex((stop) => stop.name === leg.from) : -1;
  const legTo = leg ? detailStops.findIndex((stop) => stop.name === leg.to) : -1;
  const legOn = Boolean(selected && leg && legFrom >= 0 && legTo > legFrom);
  const legShift =
    legOn && leg
      ? leg.depart -
        (legFrom === 0
          ? detailStops[0].arrival
          : detailStops[legFrom].arrival + detailStops[legFrom].dwell * 60_000)
      : 0;
  const trip = selected
    ? legOn && leg && now !== null
      ? {
          from: leg.from,
          to: leg.to,
          departure: leg.depart,
          arrival: leg.arrive,
          progress: Math.max(0, Math.min(1, (now - leg.depart) / (leg.arrive - leg.depart))),
        }
      : {
          from: selected.from,
          to: selected.to,
          departure: selected.departure,
          arrival: selected.arrival,
          progress: selected.progress,
        }
    : undefined;
  const tripDistance = selectedRoute
    ? selectedRoute.distance *
      (legOn ? (detailStops[legTo].progress ?? 0) - (detailStops[legFrom].progress ?? 0) : 1)
    : undefined;
  const shownStops = legOn ? detailStops.slice(legFrom, legTo + 1) : detailStops;
  const stopPassed = (stop: (typeof detailStops)[number]) =>
    legOn
      ? now !== null && now >= stop.arrival + legShift
      : stop.progress !== null && Boolean(selected && selected.progress >= stop.progress);
  const shownActive = legOn
    ? Math.max(0, shownStops.findLastIndex(stopPassed))
    : currentStopIndex;

  const search = query
    .trim()
    .toLocaleLowerCase("uz")
    .replace(/[‘’ʻʼ']/g, "");
  const statusOrder = { running: 0, waiting: 1, arrived: 2 };
  const sortKey = (train: ScheduledTrain) =>
    train.status === "running"
      ? train.arrival
      : train.status === "waiting"
        ? train.departure
        : train.nextDeparture;
  const categoryTrains = trains.filter(
    (train) =>
      (category === "all" || trainType(train) === category) &&
      (category !== "electric" || region === "all" || train.region === region),
  );
  const matchingTrains = categoryTrains.filter((train) =>
    [
      train.number,
      train.from,
      ...train.via,
      ...stopNames(train.number),
      train.to,
    ]
      .flatMap((name) => [name, placeName(name, "en")])
      .join(" ")
      .toLocaleLowerCase("uz")
      .replace(/[‘’ʻʼ']/g, "")
      .includes(search),
  );
  const filtersCount =
    Number(status !== "running") +
    Number(category !== "all") +
    Number(region !== "all");
  const filtersActive =
    Boolean(query) || filtersCount > 0 || Boolean(routePick.from || routePick.to);
  function resetFilters() {
    setQuery("");
    setStatus("running");
    setCategory("all");
    setRegion("all");
    setRoutePick({ from: null, to: null });
    setRouteText({ from: "", to: "" });
  }
  const visibleTrains = matchingTrains
    .filter((train) => status === "all" || train.status === status)
    .sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        sortKey(a) - sortKey(b),
    );
  const focused = detailsOpen ? selected : undefined;
  const focusedStops = focused
    ? new Set(estimateStops(focused).map((stop) => stop.name))
    : null;
  const mapStations = STATIONS.filter((station) =>
    focusedStops
      ? focusedStops.has(station.name)
      : !station.suburban || category === "electric",
  );
  function trainMarker(
    train: ScheduledTrain,
  ): {
    number: string;
    status: ScheduledTrain["status"];
    coordinates: Coordinate;
    bearing: number;
  }[] {
    if (train.status === "running")
      return routes[train.number]
        ? [
            {
              number: train.number,
              status: train.status,
              ...pointAlong(routes[train.number]!, train.progress),
            },
          ]
        : [];
    const station = STATIONS.find((item) => item.name === train.from);
    return station
      ? [
          {
            number: train.number,
            status: train.status,
            coordinates: station.coordinates,
            bearing: 0,
          },
        ]
      : [];
  }
  const activeStation = STATIONS.find((station) => station.id === stationId);
  const activeStationInfo = activeStation
    ? STATION_INFO[activeStation.name]
    : undefined;
  // Departure board: a train that already passed is moved to its next run. A pass-through train
  // appears under both arrivals (stop time) and departures (stop time + dwell).
  const stationBoard = (() => {
    if (!activeStation || now === null) return [];
    return trains.flatMap<{
      train: ScheduledTrain;
      arrive: number | null;
      depart: number | null;
      dwell: number;
      shifted: boolean;
    }>((train) => {
      const isFrom = train.from === activeStation.name;
      const isTo = train.to === activeStation.name;
      const stop =
        isFrom || isTo
          ? null
          : estimateStops(train)
              .slice(1, -1)
              .find((item) => item.name === activeStation.name);
      if (!isFrom && !isTo && !stop) return [];
      let arrive = isFrom ? null : isTo ? train.arrival : stop!.arrival;
      let depart = isTo
        ? null
        : isFrom
          ? train.departure
          : stop!.arrival + stop!.dwell * 60_000;
      const first = (arrive ?? depart)!;
      const shifted =
        first < now - 60_000 && train.nextDeparture > train.departure;
      if (shifted) {
        const gap = train.nextDeparture - train.departure;
        if (arrive !== null) arrive += gap;
        if (depart !== null) depart += gap;
      }
      const upcoming = (value: number | null) =>
        value !== null && value >= now - 60_000 && value <= now + 36 * 3_600_000;
      return upcoming(first + (shifted ? train.nextDeparture - train.departure : 0)) ||
        upcoming(arrive) ||
        upcoming(depart)
        ? [{ train, arrive, depart, dwell: stop?.dwell ?? 0, shifted }]
        : [];
    });
  })();
  const stationView =
    stationViewState.id === stationId
      ? stationViewState
      : { id: stationId, tab: "departure", type: "all" };
  const tabRows = (tab: string) =>
    stationBoard
      .map((row) => ({ ...row, time: tab === "arrival" ? row.arrive : row.depart }))
      .filter(
        (row): row is typeof row & { time: number } =>
          row.time !== null &&
          now !== null &&
          row.time >= now - 60_000 &&
          row.time <= now + 36 * 3_600_000,
      )
      .sort((x, y) => x.time - y.time);
  const tabBoard = tabRows(stationView.tab);
  const stationTypeCounts = {
    all: tabBoard.length,
    fast: tabBoard.filter(({ train }) => trainType(train) === "fast").length,
    regular: tabBoard.filter(({ train }) => trainType(train) === "regular")
      .length,
    electric: tabBoard.filter(({ train }) => trainType(train) === "electric")
      .length,
  } as Record<string, number>;
  const shownServices = tabBoard.filter(
    ({ train }) =>
      stationView.type === "all" || trainType(train) === stationView.type,
  );
  // Trips that call at both stations in the right order, as the next 36 hours of departures.
  const routeActive = Boolean(routePick.from && routePick.to);
  const routeTrips =
    routeActive && now !== null
      ? trains
          .flatMap<{ train: ScheduledTrain; depart: number; arrive: number }>(
            (train) => {
              const stops = estimateStops(train);
              const i = stops.findIndex((stop) => stop.name === routePick.from);
              const j = stops.findIndex((stop) => stop.name === routePick.to);
              if (i < 0 || j <= i) return [];
              let depart =
                i === 0
                  ? stops[0].arrival
                  : stops[i].arrival + stops[i].dwell * 60_000;
              let arrive = stops[j].arrival;
              if (
                depart < now - 60_000 &&
                train.nextDeparture > train.departure
              ) {
                const gap = train.nextDeparture - train.departure;
                depart += gap;
                arrive += gap;
              }
              return depart >= now - 60_000 && depart <= now + 36 * 3_600_000
                ? [{ train, depart, arrive }]
                : [];
            },
          )
          .sort((a, b) => a.depart - b.depart)
      : [];
  // The type filter narrows the results; the counts on its buttons come from the unfiltered trips.
  const routeResults = routeTrips.filter(
    ({ train }) => category === "all" || trainType(train) === category,
  );
  const routeCounts = {
    fast: routeTrips.filter(({ train }) => trainType(train) === "fast").length,
    regular: routeTrips.filter(({ train }) => trainType(train) === "regular")
      .length,
  } as Record<string, number>;
  const routeTyped = routeText[routeField]
    .toLocaleLowerCase("uz")
    .replace(/[‘’ʻʼ']/g, "");
  const routeSuggestions =
    routeTyped && !routePick[routeField]
      ? STATIONS.filter((station) =>
          [station.name, placeName(station.name, "en")]
            .join(" ")
            .toLocaleLowerCase("uz")
            .replace(/[‘’ʻʼ']/g, "")
            .includes(routeTyped),
        ).slice(0, 4)
      : [];
  // Keep the focused point clear of the floating list (left) and the detail/station sheet (right on desktop, bottom on mobile).
  function viewPadding(sheet: boolean) {
    return isMobile
      ? {
          top: 110,
          left: 24,
          right: 24,
          bottom: sheet ? Math.round(window.innerHeight * 0.6) : 96,
        }
      : { top: 96, bottom: 48, left: 360, right: sheet ? 450 : 80 };
  }
  function selectTrain(train: ScheduledTrain, trainLeg?: NonNullable<typeof leg>) {
    setLeg(trainLeg ?? null);
    setSelectedId(train.number);
    setListOpen(isMobile);
    setDetailsOpen(true);
    if (train.status !== "running") {
      const station = STATIONS.find((item) => item.name === train.from);
      if (station)
        mapRef.current?.flyTo(station.coordinates, viewPadding(true));
      return;
    }
    const coordinates =
      routes[train.number]?.coordinates ??
      STATIONS.filter(
        (station) => station.name === train.from || station.name === train.to,
      ).map((station) => station.coordinates);
    if (!coordinates.length) return;
    const lngs = coordinates.map((point) => point[0]),
      lats = coordinates.map((point) => point[1]);
    mapRef.current?.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      viewPadding(true),
    );
  }
  const stationBody = activeStation && (
    <>
      <SheetHeader className="gap-0 px-5 pt-0 pb-2 md:pt-4 md:pb-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-1.5 text-muted-foreground"
            onClick={() => {
              setStationId(null);
              if (isMobile) setListOpen(true);
            }}
          >
            <ArrowLeft className="size-4" />
            {t("sheet.back")}
          </Button>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-2xl font-semibold tracking-tight md:text-3xl">
              {place(activeStation.name)}
            </SheetTitle>
            <SheetDescription className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              {activeStationInfo?.country
                ? place(activeStationInfo.country)
                : "-"}
            </SheetDescription>
          </div>
          {activeStationInfo?.image && (
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              aria-label={t("station.openPhoto")}
              className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted transition-transform active:scale-95"
            >
              <Image
                src={activeStationInfo.image.src}
                alt={
                  lang === "en"
                    ? t("station.photoAlt", { n: place(activeStation.name) })
                    : activeStationInfo.image.alt
                }
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          )}
        </div>
        <div
          role="tablist"
          aria-label={t("station.badge")}
          className="mt-3 flex gap-0.5 rounded-lg bg-muted p-1"
        >
          {(
            [
              ["departure", t("station.fDeparture")],
              ["arrival", t("station.fArrival")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              role="tab"
              aria-selected={stationView.tab === value}
              onClick={() =>
                setStationViewState({ ...stationView, id: stationId, tab: value })
              }
              className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors ${stationView.tab === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
              <span className="text-xs tabular-nums opacity-60">
                {tabRows(value).length}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {(
            [
              ["all", t("list.all")],
              ["fast", t("list.fast")],
              ["regular", t("list.regular")],
              ["electric", t("list.suburban")],
            ] as const
          )
            .filter(([value]) => value === "all" || stationTypeCounts[value] > 0)
            .map(([value, label]) => (
              <button
                key={value}
                aria-pressed={stationView.type === value}
                onClick={() =>
                  setStationViewState({ ...stationView, id: stationId, type: value })
                }
                className={`flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-medium transition-colors ${stationView.type === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {label}
                <span className="tabular-nums opacity-70">
                  {stationTypeCounts[value]}
                </span>
              </button>
            ))}
        </div>
      </SheetHeader>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 px-4 pb-5">
          {shownServices.length ? (
            shownServices.map(({ train, time, dwell, shifted }) => {
              const wait = now === null ? 0 : time - now;
              const gap = shifted ? train.nextDeparture - train.departure : 0;
              const here = place(activeStation.name);
              const arrivalTab = stationView.tab === "arrival";
              const brand = TRAIN_INFO[train.number]?.brand;
              return (
                <Button
                  key={`${train.number}-${time}`}
                  variant="ghost"
                  aria-label={t("list.rowLabel", { n: train.number })}
                  aria-pressed={selectedId === train.number}
                  data-highlighted={selectedId === train.number}
                  onClick={() => {
                    setStationId(null);
                    selectTrain(train);
                  }}
                  className="group h-auto w-full items-stretch rounded-xl border bg-card px-3 py-3 text-left whitespace-normal shadow-none hover:bg-accent/60 focus-visible:bg-accent/60 active:bg-secondary data-[highlighted=true]:border-primary/30 data-[highlighted=true]:bg-accent"
                >
                  <span className="flex w-full flex-col gap-3">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-baseline gap-2">
                        <span className="flex items-center gap-1.5 text-base font-semibold tracking-tight tabular-nums">
                          <TramFront
                            className="size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          № {train.number}
                        </span>
                        {brand && (
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {brand}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs font-medium whitespace-nowrap text-emerald-700 tabular-nums dark:text-emerald-400">
                        {wait < 60_000
                          ? t("station.now")
                          : wait < 3_600_000
                            ? t("dur.m", { m: Math.round(wait / 60_000) })
                            : wait < 6 * 3_600_000
                              ? duration(wait)
                              : t("dur.h", { h: Math.round(wait / 3_600_000) })}
                      </span>
                    </span>
                    <span className="flex flex-col">
                    <span className="grid grid-cols-[10px_1fr_auto] items-center gap-x-3 py-1.5">
                      <span className="relative flex items-center justify-center self-stretch">
                        <span className="absolute top-1/2 -bottom-px w-px bg-primary/30" />
                        <span className="relative z-10 size-2.5 rounded-full border-2 border-primary bg-card" />
                      </span>
                      <span className="min-w-0 text-[13px] font-semibold">
                        {arrivalTab ? place(train.from) : here}
                      </span>
                      <span className="flex items-baseline gap-1.5 tabular-nums">
                        <span className="text-sm font-semibold">
                          {detailTime.format(arrivalTab ? train.departure + gap : time)}
                        </span>
                        {now !== null &&
                          detailDate.format(arrivalTab ? train.departure + gap : time) !== detailDate.format(now) && (
                            <span className="text-[11px] text-muted-foreground">
                              {detailDate.format(arrivalTab ? train.departure + gap : time).slice(5)}
                            </span>
                          )}
                      </span>
                    </span>
                    <span className="grid grid-cols-[10px_1fr_auto] items-center gap-x-3 py-1.5">
                      <span className="relative flex items-center justify-center self-stretch">
                        <span className="absolute -top-px bottom-1/2 w-px bg-primary/30" />
                        <span className="relative z-10 size-2.5 rounded-full border-2 border-primary bg-primary" />
                      </span>
                      <span className="min-w-0 text-[13px] font-semibold">
                        {arrivalTab ? here : place(train.to)}
                      </span>
                      <span className="flex items-baseline gap-1.5 tabular-nums">
                        <span className="text-sm font-semibold">
                          {detailTime.format(arrivalTab ? time : train.arrival + gap)}
                        </span>
                        {now !== null &&
                          detailDate.format(arrivalTab ? time : train.arrival + gap) !== detailDate.format(now) && (
                            <span className="text-[11px] text-muted-foreground">
                              {detailDate.format(arrivalTab ? time : train.arrival + gap).slice(5)}
                            </span>
                          )}
                      </span>
                    </span>
                    </span>
                    {(dwell > 0 || train.price) && (
                      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground tabular-nums">
                        <span>
                          {dwell > 0 ? t("details.dwell", { n: dwell }) : ""}
                        </span>
                        {train.price ? (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Banknote
                              className="size-3.5 text-muted-foreground"
                              aria-hidden="true"
                            />
                            {money(train.price)}
                          </span>
                        ) : null}
                      </span>
                    )}
                  </span>
                </Button>
              );
            })
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("station.none")}
            </p>
          )}
        </div>
      </ScrollArea>
    </>
  );

  const routeListJsx = (
    <>
      {routeResults.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t("route.none")}
        </p>
      ) : (
        routeResults.map(({ train, depart, arrive }) => {
          const wait = now === null ? 0 : depart - now;
          const brand = TRAIN_INFO[train.number]?.brand;
          return (
            <Button
              key={`${train.number}-${depart}`}
              variant="ghost"
              aria-label={t("list.rowLabel", { n: train.number })}
              aria-pressed={selectedId === train.number}
              data-highlighted={
                selectedId === train.number || hoveredId === train.number
              }
              onMouseEnter={() => setHoveredId(train.number)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(train.number)}
              onBlur={() => setHoveredId(null)}
              onClick={() =>
                selectTrain(train, {
                  from: routePick.from!,
                  to: routePick.to!,
                  depart,
                  arrive,
                })
              }
              className="group h-auto w-full items-stretch rounded-xl border bg-card px-3 py-3 text-left whitespace-normal shadow-none hover:bg-accent/60 focus-visible:bg-accent/60 active:bg-secondary data-[highlighted=true]:border-primary/30 data-[highlighted=true]:bg-accent"
            >
              <span className="flex w-full flex-col gap-3">
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-baseline gap-2">
                    <span className="flex items-center gap-1.5 text-base font-semibold tracking-tight tabular-nums">
                      <TramFront
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      № {train.number}
                    </span>
                    {brand && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {brand}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs font-medium whitespace-nowrap text-emerald-700 tabular-nums dark:text-emerald-400">
                    {wait < 60_000
                      ? t("station.now")
                      : wait < 3_600_000
                        ? t("dur.m", { m: Math.round(wait / 60_000) })
                        : wait < 6 * 3_600_000
                          ? duration(wait)
                          : t("dur.h", { h: Math.round(wait / 3_600_000) })}
                  </span>
                </span>
                <span className="flex flex-col">
                  <span className="grid grid-cols-[10px_1fr_auto] items-center gap-x-3 py-1.5">
                    <span className="relative flex items-center justify-center self-stretch">
                      <span className="absolute top-1/2 -bottom-px w-px bg-primary/30" />
                      <span className="relative z-10 size-2.5 rounded-full border-2 border-primary bg-card" />
                    </span>
                    <span className="min-w-0 text-[13px] font-semibold">
                      {place(routePick.from!)}
                    </span>
                    <span className="flex items-baseline gap-1.5 tabular-nums">
                      <span className="text-sm font-semibold">
                        {detailTime.format(depart)}
                      </span>
                      {now !== null &&
                        detailDate.format(depart) !== detailDate.format(now) && (
                          <span className="text-[11px] text-muted-foreground">
                            {detailDate.format(depart).slice(5)}
                          </span>
                        )}
                    </span>
                  </span>
                  <span className="grid grid-cols-[10px_1fr_auto] items-center gap-x-3 py-1.5">
                    <span className="relative flex items-center justify-center self-stretch">
                      <span className="absolute -top-px bottom-1/2 w-px bg-primary/30" />
                      <span className="relative z-10 size-2.5 rounded-full border-2 border-primary bg-primary" />
                    </span>
                    <span className="min-w-0 text-[13px] font-semibold">
                      {place(routePick.to!)}
                    </span>
                    <span className="flex items-baseline gap-1.5 tabular-nums">
                      <span className="text-sm font-semibold">
                        {detailTime.format(arrive)}
                      </span>
                      {now !== null &&
                        detailDate.format(arrive) !== detailDate.format(now) && (
                          <span className="text-[11px] text-muted-foreground">
                            {detailDate.format(arrive).slice(5)}
                          </span>
                        )}
                    </span>
                  </span>
                </span>
                <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground tabular-nums">
                  <span>{duration(arrive - depart)}</span>
                  {train.price ? (
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Banknote
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {money(train.price)}
                    </span>
                  ) : null}
                </span>
              </span>
            </Button>
          );
        })
      )}
    </>
  );

  const trainList = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={`px-5 md:pt-5 ${routeActive ? "" : "pb-5"}`}>
        <div className="mb-2 flex h-8 items-center md:mb-3 justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("list.title")}
          </h2>
          {filtersActive && !routeActive ? (
            <button
              onClick={resetFilters}
              className="-mr-2 flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-primary transition-colors hover:bg-accent"
            >
              <X className="size-3" />
              {t("list.reset")}
            </button>
          ) : (
            routeActive && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {t("list.trips", { n: routeResults.length })}
              </span>
            )
          )}
        </div>
        <div>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                {(["from", "to"] as const).map((field) => (
                  <div key={field} className="relative">
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute top-1/2 left-3 size-2.5 -translate-y-1/2 rounded-full border-2 border-primary ${field === "to" ? "bg-primary" : "bg-card"}`}
                    />
                    <Input
                      aria-label={t(field === "from" ? "route.from" : "route.to")}
                      placeholder={t(
                        field === "from" ? "route.from" : "route.to",
                      )}
                      value={
                        routePick[field]
                          ? place(routePick[field]!)
                          : routeText[field]
                      }
                      onFocus={() => setRouteField(field)}
                      onChange={(event) => {
                        setRouteField(field);
                        setRouteText({ ...routeText, [field]: event.target.value });
                        setRoutePick({ ...routePick, [field]: null });
                      }}
                      className="h-9 bg-card pr-9 pl-8 md:h-10"
                    />
                    {(routePick[field] || routeText[field]) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 size-9 md:size-10"
                        aria-label={t("list.clearSearch")}
                        onClick={(event) => {
                          setRoutePick({ ...routePick, [field]: null });
                          setRouteText({ ...routeText, [field]: "" });
                          setRouteField(field);
                          event.currentTarget.parentElement
                            ?.querySelector("input")
                            ?.focus();
                        }}
                      >
                        <X className="size-3.5" />
                      </Button>
                    )}
                    {routeField === field && routeSuggestions.length > 0 && (
                      <ul className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                        {routeSuggestions.map((station) => (
                          <li key={station.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setRoutePick({ ...routePick, [field]: station.name });
                                if (field === "from" && !routePick.to)
                                  setRouteField("to");
                              }}
                              className="flex h-11 w-full items-center gap-2.5 px-3 text-left text-sm font-medium transition-colors hover:bg-accent active:bg-accent"
                            >
                              <MapPin
                                className="size-4 shrink-0 text-primary"
                                aria-hidden="true"
                              />
                              {place(station.name)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 md:size-10"
                  aria-label={t("route.swap")}
                  onClick={() => {
                    setRoutePick({ from: routePick.to, to: routePick.from });
                    setRouteText({ from: routeText.to, to: routeText.from });
                  }}
                >
                  <ArrowUpDown className="size-4" />
                </Button>
                  <Button
                    variant={filtersOpen ? "secondary" : "outline"}
                    size="icon"
                    className="relative size-9 shrink-0 md:size-10"
                    aria-label={t("list.filters")}
                    aria-expanded={filtersOpen}
                    onClick={() => setFiltersOpen((open) => !open)}
                  >
                    <SlidersHorizontal className="size-4" />
                    {filtersCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
                        {filtersCount}
                      </span>
                    )}
                  </Button>
              </div>
            </div>
          </div>
        {filtersOpen && (
          <div
            role="group"
            aria-label={t("list.typeLabel")}
            className="mt-2 flex gap-1.5"
          >
            {(["fast", "regular"] as const).map((value) => (
              <button
                key={value}
                aria-pressed={category === value}
                onClick={() => setCategory(category === value ? "all" : value)}
                className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors ${category === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {t(value === "fast" ? "list.fast" : "list.regular")}
                {routeActive && (
                  <span className="tabular-nums opacity-70">
                    {routeCounts[value]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {routeActive && (
        <ScrollArea className="mt-2 min-h-0 flex-1 md:mt-3">
          <div className="space-y-2 px-4 pb-4">{routeListJsx}</div>
        </ScrollArea>
      )}
    </div>
  );

  const detailBody = selected && trip && (
    <>
      <SheetHeader
        className={`gap-0 px-5 ${isMobile ? "pt-0 pb-2" : "pt-4 pb-4"}`}
      >
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-1.5 text-muted-foreground"
            onClick={() => {
              setDetailsOpen(false);
              if (isMobile) setListOpen(true);
            }}
          >
            <ArrowLeft className="size-4" />
            {t("sheet.back")}
          </Button>
          <div className="flex items-center gap-2">
            {info && <Badge className="h-6 px-2.5">{info.brand}</Badge>}
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <SheetTitle className="text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">
            № {selected.number}
          </SheetTitle>
          {selected.price ? (
            <span
              className="flex items-center gap-1.5 text-sm font-semibold tabular-nums"
              aria-label={t("details.ticket", { p: num(selected.price) })}
            >
              <Banknote
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              {money(selected.price)}
            </span>
          ) : null}
        </div>
        <SheetDescription render={<div />} className="mt-1 text-xs">
          {selected.departDays.kind === "weekdays" && (
            <div
              className="mb-1.5 flex items-center gap-1"
              aria-label={t("details.daysLabel", {
                d: daysLabel(selected.departDays),
              })}
            >
              {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                <span
                  key={day}
                  className={`flex h-6 min-w-9 items-center justify-center rounded-md px-1.5 text-[11px] ${selected.departDays.kind === "weekdays" && selected.departDays.days.includes(day as number) ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground/50"}`}
                >
                  {t(`weekday.${day}` as MessageKey)}
                </span>
              ))}
            </div>
          )}
          {selected.departDays.kind !== "weekdays" && (
            <p className="text-muted-foreground">
              {daysLabel(selected.departDays)}
            </p>
          )}
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 px-4 pb-5 md:space-y-4">
          {selected.cancelled && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-700 dark:text-red-300"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-semibold">
                  {t("details.cancelled")}
                </p>
                <p className="mt-0.5 text-xs">
                  {lang === "en" && /texnik/i.test(selected.cancelled)
                    ? "Due to technical reasons"
                    : selected.cancelled}
                </p>
              </div>
            </div>
          )}
          <Card className="gap-2.5 rounded-2xl p-3 shadow-sm md:gap-4 md:p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("details.departure")}
                </p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">
                  {detailTime.format(trip.departure)}
                </p>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {detailDate.format(trip.departure)}
                </p>
              </div>
              <span className="mt-3 flex flex-col items-center gap-1">
                <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold tabular-nums">
                  <Clock3
                    className="size-3 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {duration(trip.arrival - trip.departure)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {t("details.timesNote")}
                </span>
              </span>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("details.arrival")}
                </p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">
                  {detailTime.format(trip.arrival)}
                  {selected.number === "730F" && (
                    <span className="text-sm text-muted-foreground">*</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {detailDate.format(trip.arrival)}
                </p>
              </div>
            </div>
            <div className="relative mx-1 mt-5">
              <Progress
                value={trip.progress * 100}
                aria-label={t("details.progress")}
                className="h-1.5"
              />
              <span
                className={`absolute bottom-full mb-1.5 flex flex-col ${trip.progress > 0.9 ? "-translate-x-[calc(100%-12px)] items-end" : trip.progress < 0.1 ? "-translate-x-3 items-start" : "-translate-x-1/2 items-center"}`}
                style={{ left: `${trip.progress * 100}%` }}
              >
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold leading-4 text-primary-foreground tabular-nums">
                  {Math.round(trip.progress * 100)}%
                </span>
                <span
                  className={`-mt-1 size-2 rotate-45 rounded-[1px] bg-primary ${trip.progress > 0.9 ? "-translate-x-2" : trip.progress < 0.1 ? "translate-x-2" : ""}`}
                />
              </span>
              <span
                className={`absolute -top-1 left-0 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-primary ${trip.progress > 0 ? "bg-primary" : "bg-card"}`}
              />
              {trip.progress > 0 && trip.progress < 1 && (
                <span
                  className="absolute -top-1 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-primary bg-card ring-4 ring-primary/20"
                  style={{ left: `${trip.progress * 100}%` }}
                />
              )}
              <span
                className={`absolute -top-1 right-0 size-3.5 translate-x-1/2 rounded-full border-[3px] ${trip.progress >= 1 ? "border-primary bg-primary" : "border-muted-foreground/50 bg-card"}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-5 text-[13px] font-medium leading-snug">
              <p>{place(trip.from)}</p>
              <p className="text-right">{place(trip.to)}</p>
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-2">
            <Card className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 shadow-sm">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Gauge className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("details.avgSpeed")}
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {tripDistance !== undefined
                    ? Math.round(
                        tripDistance /
                          ((trip.arrival - trip.departure) / 3_600_000),
                      )
                    : "-"}
                  <span className="ml-1 text-[10px] font-medium text-muted-foreground">
                    {t("details.kmh")}
                  </span>
                </p>
              </div>
            </Card>
            <Card className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 shadow-sm">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Ruler className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("details.distance")}
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {tripDistance !== undefined ? Math.round(tripDistance) : "-"}
                  <span className="ml-1 text-[10px] font-medium text-muted-foreground">
                    km
                  </span>
                </p>
              </div>
            </Card>
          </div>
          <Card className="gap-3 rounded-2xl p-3 shadow-sm md:gap-4 md:p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ListOrdered className="size-3.5" aria-hidden="true" />
              {t("details.stops")}
            </h3>

            <ol>
              {shownStops.map((stop, index) => {
                const passed = stopPassed(stop);
                const active = index === shownActive;
                return (
                  <li
                    key={`${stop.name}-${index}`}
                    className="grid grid-cols-[48px_20px_1fr] gap-2.5"
                  >
                    <span
                      className={`pt-2.5 text-xs tabular-nums ${passed ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {detailTime.format(stop.arrival + legShift)}
                    </span>
                    <div className="relative flex justify-center">
                      {index < shownStops.length - 1 && (
                        <span
                          className={`absolute top-5 bottom-0 w-px ${stopPassed(shownStops[index + 1]) ? "bg-primary" : "bg-border"}`}
                        />
                      )}
                      <span
                        className={`relative z-10 mt-3 size-3 rounded-full border-2 ${active ? "border-primary bg-card ring-4 ring-primary/15" : passed ? "border-primary bg-primary" : "border-input bg-card"}`}
                      />
                    </div>
                    <div
                      className={`mb-1 min-h-12 rounded-xl border px-3 py-2 ${active ? "border-primary/30 bg-accent" : "border-transparent"}`}
                    >
                      <p
                        className={`text-[13px] leading-snug ${active ? "font-medium text-accent-foreground" : "text-foreground"}`}
                      >
                        {place(stop.name)}
                      </p>
                      {index === 0 || index === shownStops.length - 1 ? (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {index === 0
                            ? t(legOn ? "details.legFrom" : "details.firstStop")
                            : t(legOn ? "details.legTo" : "details.lastStop")}
                        </p>
                      ) : (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {t("details.dwell", { n: stop.dwell })}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            {detailStops.length > 2 && !selected.kind && (
              <p className="text-[10px] text-muted-foreground">
                {t("details.approx")}
              </p>
            )}
          </Card>
          {legOn && (
            <p className="px-1 text-xs text-muted-foreground">
              {t("details.fullRoute", {
                a: place(selected.from),
                b: place(selected.to),
              })}
            </p>
          )}
          {selected.status !== "running" && !legOn && (
            <Card className="flex-row items-center gap-3 rounded-2xl p-3 shadow-sm md:p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <CalendarClock className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {selected.status === "waiting"
                    ? t("details.departsIn")
                    : t("details.nextDeparture")}
                </p>
                <p className="mt-0.5 text-lg font-semibold tracking-tight tabular-nums">
                  {untilNext}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {detailTime.format(selected.nextDeparture)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                  {detailDate.format(selected.nextDeparture)}
                </p>
              </div>
            </Card>
          )}
          <p className="px-1 text-[10px] text-muted-foreground">
            {selected.number === "730F" && t("details.unconfirmed")}
          </p>
        </div>
      </ScrollArea>
    </>
  );

  return (
    <main
      lang={lang}
      className="relative h-dvh overflow-hidden bg-background text-foreground"
    >
      <section aria-label={t("map.label")} className="absolute inset-0">
        <OpenStreetMapRailMap
          key={mapAttempt}
          ref={mapRef}
          network={drawnNetwork}
          stations={mapStations.map((station) => ({
            ...station,
            name: place(station.name),
          }))}
          stationLabel={(name) => t("map.stationLabel", { n: name })}
          trainLabel={(number) => t("map.trainLabel", { n: number })}
          trains={
            focused
              ? trainMarker(focused)
              : visibleTrains
                  .filter(
                    (train) =>
                      train.status === "running" ||
                      status !== "all" ||
                      train.number === selectedId,
                  )
                  .flatMap(trainMarker)
          }
          selectedRoute={detailsOpen ? selectedRoute : undefined}
          selectedProgress={selected?.progress ?? 0}
          selectedStationId={stationId}
          selectedTrainId={selectedId}
          palette={palette}
          onMapClick={() => {
            if (isMobile && (listOpen || detailsOpen || stationId))
              setSheetH(130);
          }}
          onReady={() => setMapStatus("ready")}
          onError={() => setMapStatus("error")}
          onStationClick={(id) => {
            setDetailsOpen(false);
            setListOpen(false);
            setStationId(stationId === id ? null : id);
          }}
          onTrainClick={(number) => {
            const train = trains.find((item) => item.number === number);
            if (train) selectTrain(train);
          }}
        />
      </section>

      <header className="floating-surface absolute inset-x-3 top-3 z-20 flex h-16 items-center justify-between rounded-xl px-4 md:inset-x-5 md:top-5 md:px-5">
        <h1 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <TrainFront className="size-5 text-primary" aria-hidden="true" />
          TrainTracker<span className="-ml-2 text-muted-foreground">.uz</span>
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/about"
            aria-label={t("about.link")}
            title={t("about.link")}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Info className="size-[18px]" aria-hidden="true" />
          </Link>
          <div
            role="group"
            aria-label={t("lang.label")}
            className="flex gap-0.5 rounded-lg bg-muted p-0.5"
          >
            {(["uz", "en"] as const).map((code) => (
              <button
                key={code}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
                className={`h-8 min-w-10 rounded-md px-2.5 text-xs font-semibold uppercase transition-colors ${lang === code ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </header>

      {!isMobile && (
        <aside
          aria-label={t("map.listLabel")}
          className={`floating-surface absolute top-24 left-5 z-10 hidden w-80 flex-col rounded-xl md:flex ${routeActive ? "bottom-6 overflow-hidden" : ""}`}
        >
          {trainList}
        </aside>
      )}

      <div className="absolute top-24 right-3 z-10 flex flex-col gap-3 md:right-5">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="floating-surface size-12 rounded-lg"
            aria-label={t("list.searchLabel")}
            onClick={() => setListOpen(true)}
          >
            <Search className="size-4" />
          </Button>
        )}
        <div className="floating-surface flex flex-col rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label={t("map.zoomIn")}
            onClick={() => mapRef.current?.zoomIn()}
          >
            <Plus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label={t("map.zoomOut")}
            onClick={() => mapRef.current?.zoomOut()}
          >
            <Minus className="size-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="floating-surface size-12 rounded-lg"
          aria-label={t("map.showUzbekistan")}
          onClick={() => mapRef.current?.reset()}
        >
          <LocateFixed className="size-4" />
        </Button>
      </div>
      <div className="absolute top-[88px] left-3 z-10 md:top-auto md:bottom-10 md:left-[360px]">
        {selected && (
          <div className="floating-surface flex gap-3 rounded-lg px-3 py-2 text-[11px] md:mt-2">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-muted-foreground" />
              {t("map.legendPassed")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-primary" />
              {t("map.legendRemaining")}
            </span>
          </div>
        )}
      </div>

      {mapStatus !== "ready" && (
        <div
          role={mapStatus === "error" ? "alert" : "status"}
          className="floating-surface absolute top-28 left-3 z-10 w-[min(240px,65vw)] rounded-xl p-4 md:left-[360px]"
        >
          {mapStatus === "loading" ? (
            <>
              <p className="text-sm">{t("map.loading")}</p>
              <div
                aria-hidden="true"
                className="mt-3 space-y-2 motion-safe:animate-pulse"
              >
                <div className="h-2 w-4/5 rounded bg-muted" />
                <div className="h-2 w-3/5 rounded bg-muted" />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm">{t("map.failed")}</p>
              <Button
                variant="outline"
                className="mt-3 h-10"
                onClick={() => {
                  setMapStatus("loading");
                  setMapAttempt((attempt) => attempt + 1);
                }}
              >
                {t("map.retry")}
              </Button>
            </>
          )}
        </div>
      )}

      <Sheet
        open={isMobile && (listOpen || detailsOpen || Boolean(activeStation))}
        onOpenChange={(open) => {
          if (!open) {
            setListOpen(false);
            setDetailsOpen(false);
            setStationId(null);
          }
        }}
        modal={false}
        disablePointerDismissal
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="floating-surface gap-0 overflow-hidden rounded-t-2xl data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-starting-style:translate-y-full data-ending-style:opacity-100 data-starting-style:opacity-100"
          style={
            sheetStyle && {
              ...sheetStyle,
              height:
                sheetH ??
                (detailsOpen
                  ? "66dvh"
                  : activeStation || routeActive
                    ? "58dvh"
                    : "max(23rem, 44dvh)"),
            }
          }
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t("map.listLabel")}</SheetTitle>
            <SheetDescription>{t("map.pickTrain")}</SheetDescription>
          </SheetHeader>
          {sheetHandle}
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-2 right-2 size-10 transition-opacity ${detailsOpen || activeStation ? "pointer-events-none opacity-0" : ""}`}
                aria-label={t("map.closeList")}
              />
            }
          >
            <X className="size-4" />
          </SheetClose>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div
              inert={detailsOpen || Boolean(activeStation)}
              className={`absolute inset-0 flex flex-col transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${detailsOpen || activeStation ? "-translate-x-1/4 opacity-0" : ""}`}
            >
              {isMobile && trainList}
            </div>
            <div
              inert={detailsOpen || !activeStation}
              className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${!detailsOpen && activeStation ? "" : "translate-x-full"}`}
            >
              {stationBody}
            </div>
            <div
              inert={!detailsOpen}
              className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${detailsOpen ? "" : "translate-x-full"}`}
            >
              {detailBody}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet
        open={!isMobile && Boolean(activeStation)}
        onOpenChange={(open) => {
          if (!open && !photoOpen) setStationId(null);
        }}
        modal={false}
        disablePointerDismissal={photoOpen}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="top-24! bottom-6! right-5! h-auto! w-[390px]! max-w-[390px]! gap-0 overflow-hidden rounded-2xl border-border bg-background shadow-xl"
        >
          {stationBody}
        </SheetContent>
      </Sheet>
      <Sheet
        open={!isMobile && detailsOpen}
        onOpenChange={setDetailsOpen}
        modal={false}
        disablePointerDismissal
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="top-24! bottom-6! right-5! h-auto! w-[390px]! max-w-[390px]! gap-0 overflow-hidden rounded-2xl border-border bg-background shadow-xl"
        >
          {detailBody}
        </SheetContent>
      </Sheet>
      {photoOpen && activeStationInfo?.image && activeStation && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={place(activeStation.name)}
          className="fixed inset-0 z-[80] flex flex-col bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setPhotoOpen(false)}
        >
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 text-white hover:bg-white/15 hover:text-white"
              aria-label={t("map.closeList")}
              onClick={() => setPhotoOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image
              src={activeStationInfo.image.src}
              alt={
                lang === "en"
                  ? t("station.photoAlt", { n: place(activeStation.name) })
                  : activeStationInfo.image.alt
              }
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <a
            href={activeStationInfo.image.sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="mt-3 text-center text-xs text-white/70 underline"
          >
            {t("station.photoCredit", {
              a: activeStationInfo.image.author,
              l:
                activeStationInfo.image.license === "Manba sayti"
                  ? t("source")
                  : activeStationInfo.image.license,
            })}
          </a>
        </div>
      )}
      {cookieChoice === null && (
        <div
          role="dialog"
          aria-label={t("cookies.title")}
          className="floating-surface fixed inset-x-3 bottom-3 z-[70] flex flex-col gap-3 rounded-xl p-4 md:inset-x-auto md:bottom-5 md:left-5 md:w-[420px]"
        >
          <div>
            <p className="text-sm font-semibold">{t("cookies.title")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("cookies.text")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-10"
              onClick={() => answerCookies("refused")}
            >
              {t("cookies.refuse")}
            </Button>
            <Button className="h-10" onClick={() => answerCookies("accepted")}>
              {t("cookies.accept")}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
