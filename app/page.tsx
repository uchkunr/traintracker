"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, Clock3, Gauge, LocateFixed, MapPin, TramFront, SlidersHorizontal, Banknote, Navigation, Hourglass, CircleCheck, CircleX, CalendarDays, ListOrdered, TriangleAlert, Ruler, Minus, Plus, Search, TrainFront, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { OpenStreetMapRailMap, type OpenStreetMapRailMapRef } from "@/components/train-tracker/OpenStreetMapRailMap";
import Image from "next/image";
import { INTERNATIONAL_RAIL_SEGMENTS, STATIONS, buildRoutes, pointAlong, type Coordinate, type RailNetwork } from "@/lib/train-data";
import { SCHEDULE, getServiceState, formatDateTime, type DayRule, type ScheduledTrain } from "@/lib/schedule";
import { initialLang, placeName, translate, type Lang, type MessageKey } from "@/lib/i18n";
import { STATION_INFO } from "@/lib/station-info";
import { TRAIN_INFO } from "@/lib/trains-info";
import { estimateStops, stopNames } from "@/lib/train-stops";
import { ELECTRIC_ROUTES } from "@/lib/electric-trains";

const detailTime = new Intl.DateTimeFormat("uz", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hour12: false });
const detailDate = new Intl.DateTimeFormat("uz", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric" });

const SHEET_TRANSITION = "translate 420ms cubic-bezier(0.32, 0.72, 0, 1), transform 420ms cubic-bezier(0.32, 0.72, 0, 1), opacity 250ms ease-out, height 380ms cubic-bezier(0.32, 0.72, 0, 1)";
const statusIcon = { running: Navigation, waiting: Hourglass, arrived: CircleCheck, cancelled: CircleX };
const statusText = {
  running: "text-emerald-600 dark:text-emerald-400",
  waiting: "text-amber-600 dark:text-amber-400",
  arrived: "text-muted-foreground",
};

export default function Home() {
  const mapRef = useRef<OpenStreetMapRailMapRef>(null);
  const [now, setNow] = useState<number | null>(null);
  const [network, setNetwork] = useState<RailNetwork | null>(null);
  const [palette, setPalette] = useState<{ accent: string; rail: string; casing: string } | null>(null);
  const [electricLines, setElectricLines] = useState<Record<string, Coordinate[]> | null>(null);
  const routes = useMemo(() => network ? buildRoutes(network, electricLines ?? undefined) : {}, [network, electricLines]);
  // The drawn network also includes the suburban lines so those trains always ride on a visible rail.
  const drawnNetwork = useMemo(() => network && electricLines ? { ...network, features: [...network.features, ...Object.entries(electricLines).map(([id, coordinates]) => ({ type: "Feature" as const, properties: { id: `electric-${id}`, fromStation: "", toStation: "", osmWays: [] }, geometry: { type: "LineString" as const, coordinates } }))] } : network, [network, electricLines]);
  const trains = useMemo(() => now === null ? [] : SCHEDULE.map((train) => getServiceState(train, now)), [now]);
  const [lang, setLang] = useState<Lang>("uz");
  const t = (key: MessageKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const place = (name: string) => placeName(name, lang);
  const num = (value: number) => value.toLocaleString("ru-RU").replace(/\s/g, " ");
  const money = (value: number) => `${num(value)} ${t("currency")}`;
  const duration = (ms: number) => { const minutes = Math.round(ms / 60_000); return t("dur.hm", { h: Math.floor(minutes / 60), m: minutes % 60 }); };
  const daysLabel = (rule: DayRule) => rule.kind === "weekdays" ? rule.days.map((day) => t(`weekday.${day}` as MessageKey)).join(", ") : t(`days.${rule.kind}` as MessageKey);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState<"all" | "intercity" | "electric">("all");
  const [region, setRegion] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [stationId, setStationId] = useState<string | null>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mapAttempt, setMapAttempt] = useState(0);
  const [sheetH, setSheetH] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cookieChoice, setCookieChoice] = useState<string | null>("pending");
  const drag = useRef<{ active: boolean; sheet: HTMLElement | null; startY: number; startH: number; h: number; lastY: number; lastT: number; velocity: number; frame: number }>({ active: false, sheet: null, startY: 0, startH: 0, h: 0, lastY: 0, lastT: 0, velocity: 0, frame: 0 });
  const chipDrag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  useEffect(() => {
    const frame = requestAnimationFrame(() => setNow(Date.now()));
    const timer = window.setInterval(() => { if (!drag.current.active) setNow(Date.now()); }, 1000);
    const controller = new AbortController();
    fetch("/railways.geojson", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Rail geometry unavailable"); return response.json(); })
      .then((data: RailNetwork) => setNetwork({ ...data, features: [...data.features, ...INTERNATIONAL_RAIL_SEGMENTS] }))
      .catch((error: Error) => { if (error.name !== "AbortError") setMapStatus("error"); });
    const loadElectric = (attempt: number) => fetch("/electric-routes.json", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Electric routes unavailable"); return response.json(); })
      .then((data: { routes: Record<string, { coordinates: Coordinate[] }> }) => setElectricLines(Object.fromEntries(Object.entries(data.routes).map(([id, route]) => [id, route.coordinates]))))
      .catch((error: Error) => { if (error.name !== "AbortError" && attempt < 3) window.setTimeout(() => loadElectric(attempt + 1), 2000 * (attempt + 1)); });
    loadElectric(0);
    return () => { cancelAnimationFrame(frame); clearInterval(timer); controller.abort(); };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setLang(initialLang()));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translate(lang, "meta.title");
    try { localStorage.setItem("traintracker-lang", lang); } catch { /* The language choice still applies for this visit. */ }
  }, [lang]);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mobile.matches);
    const frame = requestAnimationFrame(() => {
      sync();
      const styles = getComputedStyle(document.documentElement);
      setPalette({ accent: styles.getPropertyValue("--rail-active").trim(), rail: styles.getPropertyValue("--rail-track").trim(), casing: styles.getPropertyValue("--rail-casing").trim() });
    });
    mobile.addEventListener("change", sync);
    return () => { cancelAnimationFrame(frame); mobile.removeEventListener("change", sync); };
  }, []);

  useEffect(() => {
    if (!listOpen && !stationId && !detailsOpen) return;
    const frame = requestAnimationFrame(() => setSheetH(null));
    return () => cancelAnimationFrame(frame);
  }, [listOpen, stationId, detailsOpen]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => { try { setCookieChoice(localStorage.getItem("traintracker-cookies")); } catch { setCookieChoice(null); } });
    return () => cancelAnimationFrame(frame);
  }, []);
  const answerCookies = (choice: "accepted" | "refused") => {
    try { localStorage.setItem("traintracker-cookies", choice); } catch { /* The choice only lasts for this visit. */ }
    setCookieChoice(choice);
  };

  const sheetStyle = isMobile ? { height: sheetH ?? "58dvh", transition: SHEET_TRANSITION } : undefined;
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
        drag.current = { active: true, sheet, startY: event.clientY, startH, h: startH, lastY: event.clientY, lastT: performance.now(), velocity: 0, frame: 0 };
        sheet.style.transition = "transform 200ms ease-in-out, opacity 200ms ease-in-out";
      }}
      onPointerMove={(event) => {
        const d = drag.current;
        if (!d.active || !d.sheet) return;
        const at = performance.now();
        d.velocity = (d.lastY - event.clientY) / Math.max(1, at - d.lastT);
        d.lastY = event.clientY; d.lastT = at;
        d.h = Math.min(window.innerHeight, Math.max(96, d.startH + d.startY - event.clientY));
        if (!d.frame) d.frame = requestAnimationFrame(() => { d.frame = 0; if (d.sheet) d.sheet.style.height = `${d.h}px`; });
      }}
      onPointerUp={() => {
        const d = drag.current;
        if (!d.active || !d.sheet) return;
        d.active = false;
        cancelAnimationFrame(d.frame); d.frame = 0;
        const snaps = [130, window.innerHeight * 0.5, window.innerHeight];
        const projected = d.h + d.velocity * 220;
        const snap = snaps.reduce((best, value) => Math.abs(value - projected) < Math.abs(best - projected) ? value : best);
        d.sheet.style.height = `${d.h}px`;
        d.sheet.style.transition = SHEET_TRANSITION;
        void d.sheet.offsetHeight;
        d.sheet.style.height = `${snap}px`;
        setSheetH(snap);
      }}
      onPointerCancel={() => { drag.current.active = false; cancelAnimationFrame(drag.current.frame); }}
    ><span className="h-1 w-9 rounded-full bg-border" /></div>
  );

  const selected = trains.find((train) => train.number === selectedId);
  const selectedRoute = selected ? routes[selected.number] : undefined;
  const info = selected ? TRAIN_INFO[selected.number] : undefined;
  const detailStops = selected ? estimateStops(selected) : [];
  const untilNext = (() => {
    if (!selected || now === null) return "";
    const minutes = Math.max(0, Math.round((selected.nextDeparture - now) / 60_000));
    const days = Math.floor(minutes / 1440), hours = Math.floor(minutes % 1440 / 60);
    return days > 0 ? t("dur.dh", { d: days, h: hours }) : hours > 0 ? t("dur.hm", { h: hours, m: minutes % 60 }) : t("dur.m", { m: minutes });
  })();
  const currentStopIndex = selected ? Math.max(0, detailStops.findLastIndex((stop) => stop.progress !== null && stop.progress <= selected.progress)) : 0;

  const search = query.trim().toLocaleLowerCase("uz").replace(/[‘’ʻʼ']/g, "");
  const statusOrder = { running: 0, waiting: 1, arrived: 2 };
  const sortKey = (train: ScheduledTrain) => train.status === "running" ? train.arrival : train.status === "waiting" ? train.departure : train.nextDeparture;
  const categoryTrains = trains.filter((train) => (category === "all" || (category === "electric") === Boolean(train.kind)) && (category !== "electric" || region === "all" || train.region === region));
  const matchingTrains = categoryTrains.filter((train) =>
    [train.number, train.from, ...train.via, ...stopNames(train.number), train.to].flatMap((name) => [name, placeName(name, "en")]).join(" ").toLocaleLowerCase("uz").replace(/[‘’ʻʼ']/g, "").includes(search),
  );
  const statusCounts = { all: matchingTrains.length, running: matchingTrains.filter((train) => train.status === "running").length, waiting: matchingTrains.filter((train) => train.status === "waiting").length, arrived: matchingTrains.filter((train) => train.status === "arrived").length } as Record<string, number>;
  const filtersCount = [status, category, region].filter((value) => value !== "all").length;
  const filtersActive = Boolean(query) || status !== "all" || category !== "all" || region !== "all";
  function resetFilters() { setQuery(""); setStatus("all"); setCategory("all"); setRegion("all"); }
  const visibleTrains = matchingTrains.filter((train) => status === "all" || train.status === status).sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || sortKey(a) - sortKey(b));
  const electricRegions = [...new Set(ELECTRIC_ROUTES.map((route) => route.region))];
  const focused = detailsOpen ? selected : undefined;
  const focusedStops = focused ? new Set(estimateStops(focused).map((stop) => stop.name)) : null;
  const mapStations = STATIONS.filter((station) => focusedStops ? focusedStops.has(station.name) : !station.suburban || category === "electric");
  function trainMarker(train: ScheduledTrain): { number: string; status: ScheduledTrain["status"]; coordinates: Coordinate; bearing: number }[] {
    if (train.status === "running") return routes[train.number] ? [{ number: train.number, status: train.status, ...pointAlong(routes[train.number]!, train.progress) }] : [];
    const station = STATIONS.find((item) => item.name === train.from);
    return station ? [{ number: train.number, status: train.status, coordinates: station.coordinates, bearing: 0 }] : [];
  }
  const activeStation = STATIONS.find((station) => station.id === stationId);
  const activeStationInfo = activeStation ? STATION_INFO[activeStation.name] : undefined;
  const stationServices = activeStation ? trains.flatMap<{ train: ScheduledTrain; time: number; kind: "departure" | "arrival" | "stop" }>((train) => {
    if (!train.runsToday) return [];
    if (train.from === activeStation.name) return [{ train, time: train.departure, kind: "departure" as const }];
    if (train.to === activeStation.name) return [{ train, time: train.arrival, kind: "arrival" as const }];
    const stop = estimateStops(train).slice(1, -1).find((item) => item.name === activeStation.name);
    return stop && now !== null && detailDate.format(stop.arrival) === detailDate.format(now) ? [{ train, time: stop.arrival, kind: "stop" as const }] : [];
  }).sort((a, b) => a.time - b.time) : [];
  // Keep the focused point clear of the floating list (left) and the detail/station sheet (right on desktop, bottom on mobile).
  function viewPadding(sheet: boolean) {
    return isMobile
      ? { top: 110, left: 24, right: 24, bottom: sheet ? Math.round(window.innerHeight * 0.6) : 96 }
      : { top: 96, bottom: 48, left: 360, right: sheet ? 450 : 80 };
  }
  function selectTrain(train: ScheduledTrain) {
    setSelectedId(train.number);
    setListOpen(isMobile);
    setDetailsOpen(true);
    if (train.status !== "running") {
      const station = STATIONS.find((item) => item.name === train.from);
      if (station) mapRef.current?.flyTo(station.coordinates, viewPadding(true));
      return;
    }
    const coordinates = routes[train.number]?.coordinates ?? STATIONS.filter((station) => station.name === train.from || station.name === train.to).map((station) => station.coordinates);
    if (!coordinates.length) return;
    const lngs = coordinates.map((point) => point[0]), lats = coordinates.map((point) => point[1]);
    mapRef.current?.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], viewPadding(true));
  }
  function changeStatus(nextStatus: string) {
    setStatus(nextStatus);
    if (nextStatus === "all") return;
    const train = matchingTrains.find((item) => item.status === nextStatus);
    if (!train) return;
    const station = STATIONS.find((item) => item.name === train.from);
    const position = nextStatus === "running" && routes[train.number]
      ? pointAlong(routes[train.number]!, train.progress).coordinates
      : station?.coordinates;
    if (position) mapRef.current?.flyTo(position, viewPadding(false));
  }

  const trainList = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-5 md:pt-5">
        <div className="mb-2 flex h-8 items-center md:mb-3 justify-between"><h2 className="text-lg font-semibold tracking-tight">{t("list.title")}</h2>{filtersActive ? <button onClick={resetFilters} className="-mr-2 flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-primary transition-colors hover:bg-accent"><X className="size-3" />{t("list.reset")}</button> : <span className="text-xs text-muted-foreground tabular-nums">{t("list.trips", { n: visibleTrains.length })}</span>}</div>
        <div className="flex gap-2"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground md:top-3" /><Input aria-label={t("list.searchLabel")} placeholder={t("list.searchPlaceholder")} value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 bg-card pl-9 pr-10 md:h-10" />{query && <Button variant="ghost" size="icon" className="absolute top-0 right-0 size-9 md:size-10" aria-label={t("list.clearSearch")} onClick={() => setQuery("")}><X className="size-3.5" /></Button>}</div><Button variant={filtersOpen ? "secondary" : "outline"} size="icon" className="relative size-9 shrink-0 md:size-10" aria-label={t("list.filters")} aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal className="size-4" />{filtersCount > 0 && <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">{filtersCount}</span>}</Button></div>

        {filtersOpen && <>
        <div role="tablist" aria-label={t("list.typeLabel")} className="mt-2 flex gap-0.5 rounded-lg bg-muted p-1 md:mt-3">
          {([["all", t("list.all"), trains.length], ["intercity", t("list.intercity"), trains.filter((train) => !train.kind).length], ["electric", t("list.suburban"), trains.filter((train) => train.kind).length]] as const).map(([value, label, count]) => <button key={value} role="tab" aria-selected={category === value} onClick={() => { setCategory(value); setRegion("all"); }} className={`flex h-7 flex-auto items-center justify-center gap-1 rounded-md px-2.5 md:h-8 text-xs font-medium whitespace-nowrap transition-colors ${category === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{label}<span className="tabular-nums opacity-60">{count}</span></button>)}
        </div>
        <div role="group" aria-label={t("list.statusLabel")} className="mt-2 grid grid-cols-4 gap-1.5 md:mt-3">
          {([["all", t("list.allStatuses")], ["running", t("status.running")], ["waiting", t("status.waiting")], ["arrived", t("status.arrived")]] as const).map(([value, label]) => <button key={value} aria-pressed={status === value} onClick={() => changeStatus(value)} className={`flex min-h-10 flex-col items-center justify-center rounded-lg border px-1 py-1 md:min-h-12 md:py-1.5 transition-colors ${status === value ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}><span className="flex items-center gap-1 text-base leading-none font-semibold text-foreground tabular-nums">{statusCounts[value]}</span><span className="mt-1 text-[10.5px] leading-none md:mt-1.5">{label}</span></button>)}
        </div>
        {category === "electric" && <div
          className="-mx-5 mt-3 flex cursor-grab touch-pan-x gap-1.5 overflow-x-auto px-5 pb-1 select-none [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-32px),transparent)] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          onWheel={(event) => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) event.currentTarget.scrollLeft += event.deltaY; }}
          onPointerDown={(event) => { if (event.pointerType !== "mouse") return; chipDrag.current = { active: true, startX: event.clientX, startLeft: event.currentTarget.scrollLeft, moved: false }; }}
          onPointerMove={(event) => { const d = chipDrag.current; if (!d.active) return; const delta = event.clientX - d.startX; if (Math.abs(delta) > 4) { d.moved = true; event.currentTarget.setPointerCapture(event.pointerId); } if (d.moved) event.currentTarget.scrollLeft = d.startLeft - delta; }}
          onPointerUp={() => { chipDrag.current.active = false; }}
          onPointerCancel={() => { chipDrag.current.active = false; }}
          onClickCapture={(event) => { if (chipDrag.current.moved) { event.preventDefault(); event.stopPropagation(); chipDrag.current.moved = false; } }}
        >{["all", ...electricRegions].map((name) => <button key={name} onClick={() => setRegion(name)} aria-pressed={region === name} className={`h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors ${region === name ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>{name === "all" ? t("list.allStatuses") : place(name)}</button>)}</div>}
        </>}
      </div>
      <ScrollArea className="mt-2 min-h-0 flex-1 md:mt-3"><div className="px-2 pb-3">
          {now === null ? <p role="status" className="p-5 text-sm text-muted-foreground">{t("list.loading")}</p> : visibleTrains.length === 0 && <div role="status" className="px-3 py-10 text-center"><p className="text-sm font-medium">{matchingTrains.length ? t("list.emptyStatus") : t("list.emptyNone")}</p>{matchingTrains.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{t("list.emptyHint", { n: matchingTrains.length })}</p>}<Button variant="link" className="mt-2 h-10" onClick={() => matchingTrains.length ? setStatus("all") : resetFilters()}>{matchingTrains.length ? t("list.showAll") : t("list.clearFilters")}</Button></div>}
          {visibleTrains.map((train) => <Button key={train.number} variant="ghost" aria-label={t("list.rowLabel", { n: train.number })} aria-pressed={selectedId === train.number} data-highlighted={selectedId === train.number || hoveredId === train.number} onMouseEnter={() => setHoveredId(train.number)} onMouseLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(train.number)} onBlur={() => setHoveredId(null)} onClick={() => selectTrain(train)} className="train-row group h-auto w-full items-stretch rounded-md px-3 py-4 text-left whitespace-normal">
            <span className="flex w-full flex-col gap-3">
              <span className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><span className="flex items-center gap-1.5 text-base font-semibold tracking-tight tabular-nums"><TramFront className="size-4 shrink-0 text-primary" aria-hidden="true" />№ {train.number}</span>{TRAIN_INFO[train.number] && <span className="text-[11px] font-medium text-muted-foreground">{TRAIN_INFO[train.number]!.brand}</span>}{train.kind && <span className="text-[11px] font-medium text-muted-foreground">{t("list.suburban")}</span>}</span><span className={`flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums ${train.cancelled ? "text-red-600 dark:text-red-400" : statusText[train.status]}`}>{(() => { const Icon = statusIcon[train.cancelled ? "cancelled" : train.status]; return <Icon className="size-3.5" aria-hidden="true" />; })()}{train.cancelled ? t("status.cancelled") : train.status === "running" ? `${t("status.running")} · ${Math.round(train.progress * 100)}%` : t(`status.${train.status}` as MessageKey)}</span></span>
              <span className="flex flex-col">
                <span className="grid grid-cols-[10px_1fr_auto] items-center gap-x-3 py-1.5"><span className="relative flex items-center justify-center self-stretch"><span className="absolute top-1/2 -bottom-px w-px bg-primary/30" /><span className="relative z-10 size-2.5 rounded-full border-2 border-primary bg-card" /></span><span className="min-w-0 text-[13px] font-semibold">{place(train.from)}</span><span className="flex items-baseline gap-1.5 tabular-nums"><span className="text-sm font-semibold">{detailTime.format(train.departure)}</span>{detailDate.format(train.departure) !== detailDate.format(now ?? 0) && <span className="text-[11px] text-muted-foreground">{detailDate.format(train.departure).slice(0, 5)}</span>}</span></span>
                <span className="grid grid-cols-[10px_1fr_auto] items-center gap-x-3 py-1.5"><span className="relative flex items-center justify-center self-stretch"><span className="absolute -top-px bottom-1/2 w-px bg-primary/30" /><span className="relative z-10 size-2.5 rounded-full border-2 border-primary bg-primary" /></span><span className="min-w-0 text-[13px] font-semibold">{place(train.to)}</span><span className="flex items-baseline gap-1.5 tabular-nums"><span className="text-sm font-semibold">{detailTime.format(train.arrival)}</span>{detailDate.format(train.arrival) !== detailDate.format(now ?? 0) && <span className="text-[11px] text-muted-foreground">{detailDate.format(train.arrival).slice(0, 5)}</span>}</span></span>
              </span>
              {(train.status === "arrived" || train.price) && <span className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground tabular-nums"><span className="min-w-0 flex-1">{train.status === "arrived" && t("list.nextDeparture", { t: formatDateTime(train.nextDeparture) })}</span>{train.price && <span className="flex shrink-0 items-center gap-1 font-medium text-foreground"><Banknote className="size-3.5 text-muted-foreground" aria-hidden="true" />{money(train.price)}</span>}</span>}
            </span>
          </Button>)}
        </div></ScrollArea>
    </div>
  );

  const detailBody = selected && <>
    <SheetHeader className={`gap-0 px-5 ${isMobile ? "pt-0 pb-2" : "pt-4 pb-4"}`}>
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" onClick={() => { setDetailsOpen(false); if (isMobile) setListOpen(true); }}><ArrowLeft className="size-4" />{t("sheet.back")}</Button>
        <div className="flex items-center gap-1.5">
          {info && <Badge className="h-6 px-2.5">{info.brand}</Badge>}
          {(() => { const key = selected.cancelled ? "cancelled" : selected.status; const Icon = statusIcon[key]; return <span className={`flex h-6 items-center gap-1 rounded-full bg-muted px-2.5 text-xs font-semibold ${key === "cancelled" ? "text-red-600 dark:text-red-400" : statusText[key]}`}><Icon className="size-3.5" aria-hidden="true" />{t(`status.${key}` as MessageKey)}</span>; })()}
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <SheetTitle className="text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">№ {selected.number}</SheetTitle>
        {selected.departDays.kind !== "weekdays" && <span className="flex h-6 items-center gap-1 rounded-full bg-accent px-2.5 text-xs font-semibold text-accent-foreground" aria-label={t("details.daysLabel", { d: daysLabel(selected.departDays) })}><CalendarDays className="size-3.5" aria-hidden="true" />{daysLabel(selected.departDays)}</span>}
      </div>
      <SheetDescription render={<div />} className="mt-1.5 text-xs">
        {selected.departDays.kind === "weekdays" && <div className="mb-1.5 flex items-center gap-1" aria-label={t("details.daysLabel", { d: daysLabel(selected.departDays) })}>
          {[1, 2, 3, 4, 5, 6, 0].map((day) => <span key={day} className={`flex h-6 min-w-9 items-center justify-center rounded-md px-1.5 text-[11px] ${selected.departDays.kind === "weekdays" && selected.departDays.days.includes(day as number) ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground/50"}`}>{t(`weekday.${day}` as MessageKey)}</span>)}
        </div>}
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 className="size-3" aria-hidden="true" />{t("details.timesNote")}{selected.price ? ` · ${t("details.ticket", { p: num(selected.price) })}` : ""}</p>
      </SheetDescription>
    </SheetHeader>
    <ScrollArea className="min-h-0 flex-1"><div className="space-y-3 px-4 pb-5 md:space-y-4">
      {selected.cancelled && <div role="alert" className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-700 dark:text-red-300"><TriangleAlert className="mt-0.5 size-4 shrink-0" /><div><p className="text-sm font-semibold">{t("details.cancelled")}</p><p className="mt-0.5 text-xs">{lang === "en" && /texnik/i.test(selected.cancelled) ? "Due to technical reasons" : selected.cancelled}</p></div></div>}
      <Card className="gap-2.5 rounded-2xl p-3 shadow-sm md:gap-4 md:p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div><p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("details.departure")}</p><p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">{detailTime.format(selected.departure)}</p><p className="text-[11px] text-muted-foreground tabular-nums">{detailDate.format(selected.departure)}</p></div>
          <span className="mt-3 flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold tabular-nums"><Clock3 className="size-3 text-muted-foreground" aria-hidden="true" />{duration(selected.arrival - selected.departure)}</span>
          <div className="text-right"><p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t("details.arrival")}</p><p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">{detailTime.format(selected.arrival)}{selected.number === "730F" && <span className="text-sm text-muted-foreground">*</span>}</p><p className="text-[11px] text-muted-foreground tabular-nums">{detailDate.format(selected.arrival)}</p></div>
        </div>
        <div className="relative mx-1 mt-5"><Progress value={selected.progress * 100} aria-label={t("details.progress")} className="h-1.5" /><span className="absolute bottom-full mb-1.5 flex -translate-x-1/2 flex-col items-center" style={{ left: `${selected.progress * 100}%` }}><span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold leading-4 text-primary-foreground tabular-nums">{Math.round(selected.progress * 100)}%</span><span className="-mt-1 size-2 rotate-45 rounded-[1px] bg-primary" /></span><span className={`absolute -top-1 left-0 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-primary ${selected.progress > 0 ? "bg-primary" : "bg-card"}`} />{selected.progress > 0 && selected.progress < 1 && <span className="absolute -top-1 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-primary bg-card ring-4 ring-primary/20" style={{ left: `${selected.progress * 100}%` }} />}<span className={`absolute -top-1 right-0 size-3.5 translate-x-1/2 rounded-full border-[3px] ${selected.progress >= 1 ? "border-primary bg-primary" : "border-muted-foreground/50 bg-card"}`} /></div>
        <div className="grid grid-cols-2 gap-5 text-[13px] font-medium leading-snug"><p>{place(selected.from)}</p><p className="text-right">{place(selected.to)}</p></div>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Card className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 shadow-sm"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Gauge className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t("details.avgSpeed")}</p><p className="text-sm font-semibold tabular-nums">{selectedRoute ? Math.round(selectedRoute.distance / ((selected.arrival - selected.departure) / 3_600_000)) : "—"}<span className="ml-1 text-[10px] font-medium text-muted-foreground">{t("details.kmh")}</span></p></div></Card>
        <Card className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 shadow-sm"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Ruler className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t("details.distance")}</p><p className="text-sm font-semibold tabular-nums">{selectedRoute ? Math.round(selectedRoute.distance) : "—"}<span className="ml-1 text-[10px] font-medium text-muted-foreground">km</span></p></div></Card>
      </div>
      <Card className="gap-3 rounded-2xl p-3 shadow-sm md:gap-4 md:p-4">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><ListOrdered className="size-3.5" aria-hidden="true" />{t("details.stops")}</h3>

        <ol>{detailStops.map((stop, index) => {
          const passed = stop.progress !== null && selected.progress >= stop.progress;
          const active = index === currentStopIndex;
          return <li key={`${stop.name}-${index}`} className="grid grid-cols-[48px_20px_1fr] gap-2.5">
            <span className={`pt-2.5 text-xs tabular-nums ${passed ? "text-foreground" : "text-muted-foreground"}`}>{detailTime.format(stop.arrival)}</span>
            <div className="relative flex justify-center">{index < detailStops.length - 1 && <span className={`absolute top-5 bottom-0 w-px ${selected.progress >= (detailStops[index + 1].progress ?? Infinity) ? "bg-primary" : "bg-border"}`} />}<span className={`relative z-10 mt-3 size-3 rounded-full border-2 ${active ? "border-primary bg-card ring-4 ring-primary/15" : passed ? "border-primary bg-primary" : "border-input bg-card"}`} /></div>
            <div className={`mb-1 min-h-12 rounded-xl border px-3 py-2 ${active ? "border-primary/30 bg-accent" : "border-transparent"}`}><p className={`text-[13px] leading-snug ${active ? "font-medium text-accent-foreground" : "text-foreground"}`}>{place(stop.name)}</p>{index === 0 || index === detailStops.length - 1 ? <p className="mt-1 text-[10px] text-muted-foreground">{index === 0 ? t("details.firstStop") : t("details.lastStop")}</p> : <p className="mt-1 text-[10px] text-muted-foreground">{t("details.dwell", { n: stop.dwell })}</p>}</div>
          </li>;
        })}</ol>
        {detailStops.length > 2 && !selected.kind && <p className="text-[10px] text-muted-foreground">{t("details.approx")}</p>}
      </Card>
      {selected.status !== "running" && <Card className="flex-row items-center gap-3 rounded-2xl p-3 shadow-sm md:p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"><CalendarClock className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{selected.status === "waiting" ? t("details.departsIn") : t("details.nextDeparture")}</p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight tabular-nums">{untilNext}</p>
        </div>
        <div className="text-right"><p className="text-sm font-semibold tabular-nums">{detailTime.format(selected.nextDeparture)}</p><p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">{detailDate.format(selected.nextDeparture)}</p></div>
      </Card>}
      <p className="px-1 text-[10px] text-muted-foreground">{selected.number === "730F" && t("details.unconfirmed")}</p>
    </div></ScrollArea>
  </>;

  return (
    <main lang={lang} className="relative h-dvh overflow-hidden bg-background text-foreground">
      <section aria-label={t("map.label")} className="absolute inset-0">
        <OpenStreetMapRailMap
          key={mapAttempt}
          ref={mapRef}
          network={drawnNetwork}
          stations={mapStations.map((station) => ({ ...station, name: place(station.name) }))}
          stationLabel={(name) => t("map.stationLabel", { n: name })}
          trainLabel={(number) => t("map.trainLabel", { n: number })}
          trains={focused ? trainMarker(focused) : visibleTrains.filter((train) => train.status === "running" || status !== "all" || train.number === selectedId).flatMap(trainMarker)}
          selectedRoute={selectedRoute}
          selectedProgress={selected?.progress ?? 0}
          selectedStationId={stationId}
          selectedTrainId={selectedId}
          palette={palette}
          onReady={() => setMapStatus("ready")}
          onError={() => setMapStatus("error")}
          onStationClick={(id) => { setDetailsOpen(false); setListOpen(false); setStationId(stationId === id ? null : id); }}
          onTrainClick={(number) => { const train = trains.find((item) => item.number === number); if (train) selectTrain(train); }}
        />
      </section>

      <header className="glass absolute inset-x-3 top-3 z-20 flex h-16 items-center justify-between rounded-2xl px-4 md:inset-x-5 md:top-5 md:px-5">
        <h1 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"><TrainFront className="size-5 text-primary" aria-hidden="true" />TrainTracker<span className="-ml-2 text-muted-foreground">.uz</span></h1>
        <div role="group" aria-label={t("lang.label")} className="flex gap-0.5 rounded-lg bg-muted p-0.5">{(["uz", "en"] as const).map((code) => <button key={code} aria-pressed={lang === code} onClick={() => setLang(code)} className={`h-8 min-w-10 rounded-md px-2.5 text-xs font-semibold uppercase transition-colors ${lang === code ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{code}</button>)}</div>
      </header>

      {!isMobile && <aside aria-label={t("map.listLabel")} className="floating-surface absolute top-24 bottom-6 left-5 z-10 hidden w-80 flex-col overflow-hidden rounded-xl md:flex">{trainList}</aside>}

      <div className="absolute top-24 right-3 z-10 flex flex-col gap-3 md:right-5">
        {isMobile && <Button variant="ghost" size="icon" className="floating-surface size-12 rounded-lg" aria-label={t("list.searchLabel")} onClick={() => setListOpen(true)}><Search className="size-4" /></Button>}
        <div className="floating-surface flex flex-col rounded-lg p-1"><Button variant="ghost" size="icon" className="size-10" aria-label={t("map.zoomIn")} onClick={() => mapRef.current?.zoomIn()}><Plus className="size-4" /></Button><Button variant="ghost" size="icon" className="size-10" aria-label={t("map.zoomOut")} onClick={() => mapRef.current?.zoomOut()}><Minus className="size-4" /></Button></div>
        <Button variant="ghost" size="icon" className="floating-surface size-12 rounded-lg" aria-label={t("map.showUzbekistan")} onClick={() => mapRef.current?.reset()}><LocateFixed className="size-4" /></Button>
      </div>
      <div className="absolute top-[88px] left-3 z-10 md:top-auto md:bottom-10 md:left-[360px]">
        {selected && <div className="floating-surface flex gap-3 rounded-lg px-3 py-2 text-[11px] md:mt-2"><span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-muted-foreground" />{t("map.legendPassed")}</span><span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-primary" />{t("map.legendRemaining")}</span></div>}
      </div>

      {mapStatus !== "ready" && <div role={mapStatus === "error" ? "alert" : "status"} className="floating-surface absolute top-28 left-3 z-10 w-[min(240px,65vw)] rounded-xl p-4 md:left-[360px]">{mapStatus === "loading" ? <><p className="text-sm">{t("map.loading")}</p><div aria-hidden="true" className="mt-3 space-y-2 motion-safe:animate-pulse"><div className="h-2 w-4/5 rounded bg-muted" /><div className="h-2 w-3/5 rounded bg-muted" /></div></> : <><p className="text-sm">{t("map.failed")}</p><Button variant="outline" className="mt-3 h-10" onClick={() => { setMapStatus("loading"); setMapAttempt((attempt) => attempt + 1); }}>{t("map.retry")}</Button></>}</div>}

      <Sheet open={isMobile && (listOpen || detailsOpen)} onOpenChange={(open) => { if (!open) { setListOpen(false); setDetailsOpen(false); } }} modal={false}>
        <SheetContent side="bottom" showCloseButton={false} className="floating-surface gap-0 overflow-hidden rounded-t-2xl data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-starting-style:translate-y-full data-ending-style:opacity-100 data-starting-style:opacity-100" style={sheetStyle && { ...sheetStyle, height: sheetH ?? (detailsOpen ? "66dvh" : "58dvh") }}>
          <SheetHeader className="sr-only"><SheetTitle>{t("map.listLabel")}</SheetTitle><SheetDescription>{t("map.pickTrain")}</SheetDescription></SheetHeader>
          {sheetHandle}
          <SheetClose render={<Button variant="ghost" size="icon" className={`absolute top-2 right-2 size-10 transition-opacity ${detailsOpen ? "pointer-events-none opacity-0" : ""}`} aria-label={t("map.closeList")} />}><X className="size-4" /></SheetClose>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div inert={detailsOpen} className={`absolute inset-0 flex flex-col transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${detailsOpen ? "-translate-x-1/4 opacity-0" : ""}`}>{isMobile && trainList}</div>
            <div inert={!detailsOpen} className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${detailsOpen ? "" : "translate-x-full"}`}>{detailBody}</div>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={Boolean(activeStation)} onOpenChange={(open) => { if (!open) setStationId(null); }} modal={false}>
        <SheetContent side={isMobile ? "bottom" : "right"} showCloseButton={false} style={sheetStyle} className={isMobile ? "gap-0 overflow-hidden rounded-t-3xl border-border bg-background data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-starting-style:translate-y-full data-ending-style:opacity-100 data-starting-style:opacity-100" : "inset-y-24! right-5! h-auto! w-[390px]! max-w-[390px]! gap-0 overflow-hidden rounded-2xl border-border bg-background shadow-xl"}>
          {activeStation && <>
            {isMobile && sheetHandle}
            <SheetHeader className={`gap-0 px-5 ${isMobile ? "pt-0 pb-2" : "pt-4 pb-4"}`}>
              <div className="flex items-center justify-between md:mb-5">
                <SheetClose render={<Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" />}><ArrowLeft className="size-4" />{t("sheet.back")}</SheetClose>
                <Badge className="h-6 px-2.5">{t("station.badge")}</Badge>
              </div>
              <p className="hidden text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:block">{t("station.kicker")}</p>
              <SheetTitle className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{place(activeStation.name)}</SheetTitle>
              <SheetDescription className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground md:mt-2 md:text-sm md:text-foreground"><MapPin className="size-3.5 text-primary md:size-4" />{activeStationInfo?.country ? place(activeStationInfo.country) : "—"}</SheetDescription>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1"><div className="space-y-3 px-4 pb-5 md:space-y-4">
              {activeStationInfo?.image ? <div>
                <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-muted md:aspect-video md:rounded-2xl"><Image src={activeStationInfo.image.src} alt={lang === "en" ? t("station.photoAlt", { n: place(activeStation.name) }) : activeStationInfo.image.alt} fill sizes="(max-width: 767px) 100vw, 390px" className="object-cover" /></div>
                <a href={activeStationInfo.image.sourceUrl} target="_blank" rel="noreferrer" className="mt-1.5 block text-right text-[10px] text-muted-foreground underline">{t("station.photoCredit", { a: activeStationInfo.image.author, l: activeStationInfo.image.license === "Manba sayti" ? t("source") : activeStationInfo.image.license })}</a>
              </div> : <div className="flex aspect-[2/1] items-center justify-center rounded-xl bg-muted md:aspect-video md:rounded-2xl text-muted-foreground"><TrainFront className="size-10" /><span className="sr-only">{t("station.noPhoto")}</span></div>}
              <Card className="gap-3 rounded-2xl p-3 shadow-sm md:p-4">
                <div className="flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("station.today")}</h3><Badge variant="secondary">{stationServices.length}</Badge></div>
                {stationServices.length ? <div className="space-y-2">{stationServices.map(({ train, time, kind }) => {
                  return <Button key={`${train.number}-${time}`} variant="ghost" className="h-auto w-full justify-start rounded-xl border bg-muted/40 px-3 py-2 text-left md:py-3" onClick={() => { setStationId(null); selectTrain(train); }}>
                    <span className="mr-3 w-11 shrink-0 text-base font-semibold tabular-nums">{detailTime.format(time)}</span>
                    <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><Badge className="h-5 px-2">{train.number}</Badge><span className="text-[11px] text-muted-foreground">{kind === "departure" ? t("station.departing") : kind === "arrival" ? t("station.arriving") : t("station.stopping")}</span></span><span className="mt-1 block truncate text-xs font-medium text-muted-foreground">{kind === "stop" ? `${place(train.from)} → ${place(train.to)}` : place(kind === "departure" ? train.to : train.from)}</span></span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </Button>;
                })}</div> : <p className="py-5 text-center text-sm text-muted-foreground">{t("station.none")}</p>}
              </Card>
            </div></ScrollArea>
          </>}
        </SheetContent>
      </Sheet>
      <Sheet open={!isMobile && detailsOpen} onOpenChange={setDetailsOpen} modal={false}>
        <SheetContent side="right" showCloseButton={false} className="inset-y-24! right-5! h-auto! w-[390px]! max-w-[390px]! gap-0 overflow-hidden rounded-2xl border-border bg-background shadow-xl">
          {detailBody}
        </SheetContent>
      </Sheet>
      {cookieChoice === null && <div role="dialog" aria-label={t("cookies.title")} className="floating-surface fixed inset-x-3 bottom-3 z-[70] flex flex-col gap-3 rounded-xl p-4 md:inset-x-auto md:bottom-5 md:left-5 md:w-[420px]">
        <div><p className="text-sm font-semibold">{t("cookies.title")}</p><p className="mt-0.5 text-xs text-muted-foreground">{t("cookies.text")}</p></div>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" className="h-10" onClick={() => answerCookies("refused")}>{t("cookies.refuse")}</Button><Button className="h-10" onClick={() => answerCookies("accepted")}>{t("cookies.accept")}</Button></div>
      </div>}
    </main>
  );
}
