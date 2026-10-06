"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, Clock3, Gauge, LocateFixed, MapPin, TriangleAlert, Ruler, Minus, Plus, Search, TrainFront, X } from "lucide-react";
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
import { SCHEDULE, getServiceState, formatDateTime, formatDays, formatDuration, type ScheduledTrain } from "@/lib/schedule";
import { STATION_INFO } from "@/lib/station-info";
import { TRAIN_INFO } from "@/lib/trains-info";
import { estimateStops, stopNames } from "@/lib/train-stops";
import { ELECTRIC_ROUTES } from "@/lib/electric-trains";

const detailTime = new Intl.DateTimeFormat("uz", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hour12: false });
const detailDate = new Intl.DateTimeFormat("uz", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric" });

const statusLabels = { running: "Yo‘lda", waiting: "Kutilmoqda", arrived: "Yetib keldi" };
const SHEET_TRANSITION = "transform 200ms ease-in-out, opacity 200ms ease-in-out, height 380ms cubic-bezier(0.32, 0.72, 0, 1)";
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
  const trains = useMemo(() => now === null ? [] : SCHEDULE.map((train) => getServiceState(train, now)), [now]);
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
    if (mapStatus !== "ready" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      let nearest = STATIONS[0], closest = Infinity;
      for (const station of STATIONS) {
        const distance = ((station.coordinates[0] - coords.longitude) * Math.cos(coords.latitude * Math.PI / 180)) ** 2 + (station.coordinates[1] - coords.latitude) ** 2;
        if (distance < closest) { closest = distance; nearest = station; }
      }
      setDetailsOpen(false);
      setListOpen(false);
      setStationId(nearest.id);
      mapRef.current?.flyTo(nearest.coordinates, viewPadding(true));
    }, () => { /* Without permission the default map view stays. */ });
  }, [mapStatus]);

  useEffect(() => {
    if (!listOpen && !stationId && !detailsOpen) return;
    const frame = requestAnimationFrame(() => setSheetH(null));
    return () => cancelAnimationFrame(frame);
  }, [listOpen, stationId, detailsOpen]);

  const sheetStyle = isMobile ? { height: sheetH ?? "58dvh", transition: SHEET_TRANSITION } : undefined;
  // The drag writes the height straight to the DOM (one write per frame) so React does not re-render the map and list while the finger moves.
  const sheetHandle = (
    <div
      role="separator"
      aria-label="Panelni surish"
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
        d.h = Math.min(window.innerHeight * 0.92, Math.max(96, d.startH + d.startY - event.clientY));
        if (!d.frame) d.frame = requestAnimationFrame(() => { d.frame = 0; if (d.sheet) d.sheet.style.height = `${d.h}px`; });
      }}
      onPointerUp={() => {
        const d = drag.current;
        if (!d.active || !d.sheet) return;
        d.active = false;
        cancelAnimationFrame(d.frame); d.frame = 0;
        const snaps = [130, window.innerHeight * 0.5, window.innerHeight * 0.9];
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
    return days > 0 ? `${days} kun ${hours} soat` : hours > 0 ? `${hours} soat ${minutes % 60} daq.` : `${minutes} daq.`;
  })();
  const currentStopIndex = selected ? Math.max(0, detailStops.findLastIndex((stop) => stop.progress !== null && stop.progress <= selected.progress)) : 0;

  const search = query.trim().toLocaleLowerCase("uz").replace(/[‘’ʻʼ']/g, "");
  const statusOrder = { running: 0, waiting: 1, arrived: 2 };
  const sortKey = (train: ScheduledTrain) => train.status === "running" ? train.arrival : train.status === "waiting" ? train.departure : train.nextDeparture;
  const categoryTrains = trains.filter((train) => (category === "all" || (category === "electric") === Boolean(train.kind)) && (category !== "electric" || region === "all" || train.region === region));
  const matchingTrains = categoryTrains.filter((train) =>
    `${train.number} ${train.from} ${train.via.join(" ")} ${stopNames(train.number).join(" ")} ${train.to}`.toLocaleLowerCase("uz").replace(/[‘’ʻʼ']/g, "").includes(search),
  );
  const statusCounts = { all: matchingTrains.length, running: matchingTrains.filter((train) => train.status === "running").length, waiting: matchingTrains.filter((train) => train.status === "waiting").length, arrived: matchingTrains.filter((train) => train.status === "arrived").length } as Record<string, number>;
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
  const moving = trains.filter((train) => train.status === "running").length;
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
    setListOpen(false);
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
      <div className="px-5 pt-5">
        <div className="mb-3 flex h-8 items-center justify-between"><h2 className="text-lg font-semibold tracking-tight">Poyezdlar</h2>{filtersActive ? <button onClick={resetFilters} className="-mr-2 flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-primary transition-colors hover:bg-accent"><X className="size-3" />Tozalash</button> : <span className="text-xs text-muted-foreground tabular-nums">{visibleTrains.length} ta reys</span>}</div>
        <div className="relative"><Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" /><Input aria-label="Poyezdni qidirish" placeholder="Poyezd yoki shahar" value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 bg-card pl-9 pr-10" />{query && <Button variant="ghost" size="icon" className="absolute top-0 right-0 size-10" aria-label="Qidiruvni tozalash" onClick={() => setQuery("")}><X className="size-3.5" /></Button>}</div>
        <div role="tablist" aria-label="Poyezd turi" className="mt-3 grid grid-cols-[1fr_0.8fr_1.5fr] gap-1 rounded-lg bg-muted p-1">
          {([["all", "Barchasi", trains.length], ["intercity", "Uzoq", trains.filter((train) => !train.kind).length], ["electric", "Shahar atrofi", trains.filter((train) => train.kind).length]] as const).map(([value, label, count]) => <button key={value} role="tab" aria-selected={category === value} onClick={() => { setCategory(value); setRegion("all"); }} className={`flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors ${category === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{label}<span className="tabular-nums opacity-60">{count}</span></button>)}
        </div>
        <div role="group" aria-label="Poyezd holati" className="mt-3 grid grid-cols-4 gap-1.5">
          {([["all", "Hammasi"], ["running", "Yo‘lda"], ["waiting", "Kutilmoqda"], ["arrived", "Yetib keldi"]] as const).map(([value, label]) => <button key={value} aria-pressed={status === value} onClick={() => changeStatus(value)} className={`flex min-h-12 flex-col items-center justify-center rounded-lg border px-1 py-1.5 transition-colors ${status === value ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}><span className="flex items-center gap-1 text-base leading-none font-semibold text-foreground tabular-nums">{statusCounts[value]}</span><span className="mt-1.5 text-[10.5px] leading-none">{label}</span></button>)}
        </div>
        {category === "electric" && <div
          className="-mx-5 mt-3 flex cursor-grab touch-pan-x gap-1.5 overflow-x-auto px-5 pb-1 select-none [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-32px),transparent)] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          onWheel={(event) => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) event.currentTarget.scrollLeft += event.deltaY; }}
          onPointerDown={(event) => { if (event.pointerType !== "mouse") return; chipDrag.current = { active: true, startX: event.clientX, startLeft: event.currentTarget.scrollLeft, moved: false }; }}
          onPointerMove={(event) => { const d = chipDrag.current; if (!d.active) return; const delta = event.clientX - d.startX; if (Math.abs(delta) > 4) { d.moved = true; event.currentTarget.setPointerCapture(event.pointerId); } if (d.moved) event.currentTarget.scrollLeft = d.startLeft - delta; }}
          onPointerUp={() => { chipDrag.current.active = false; }}
          onPointerCancel={() => { chipDrag.current.active = false; }}
          onClickCapture={(event) => { if (chipDrag.current.moved) { event.preventDefault(); event.stopPropagation(); chipDrag.current.moved = false; } }}
        >{["all", ...electricRegions].map((name) => <button key={name} onClick={() => setRegion(name)} aria-pressed={region === name} className={`h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors ${region === name ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>{name === "all" ? "Hammasi" : name}</button>)}</div>}
      </div>
      <ScrollArea className="mt-3 min-h-0 flex-1"><div className="px-2 pb-3">
          {now === null ? <p role="status" className="p-5 text-sm text-muted-foreground">Jadval yuklanmoqda</p> : visibleTrains.length === 0 && <div role="status" className="px-3 py-10 text-center"><p className="text-sm font-medium">{matchingTrains.length ? "Bu holatda poyezd yo‘q" : "Poyezd topilmadi"}</p>{matchingTrains.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Boshqa holatlarda {matchingTrains.length} ta poyezd bor.</p>}<Button variant="link" className="mt-2 h-10" onClick={() => matchingTrains.length ? setStatus("all") : resetFilters()}>{matchingTrains.length ? "Hammasini ko‘rsatish" : "Filtrlarni tozalash"}</Button></div>}
          {visibleTrains.map((train) => <Button key={train.number} variant="ghost" aria-label={`${train.number} poyezdi haqida`} aria-pressed={selectedId === train.number} data-highlighted={selectedId === train.number || hoveredId === train.number} onMouseEnter={() => setHoveredId(train.number)} onMouseLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(train.number)} onBlur={() => setHoveredId(null)} onClick={() => selectTrain(train)} className="train-row group h-auto w-full items-stretch rounded-md px-3 py-4 text-left whitespace-normal">
            <span className="flex w-full flex-col gap-3">
              <span className="flex items-center justify-between gap-2"><span className="flex items-baseline gap-2"><span className="text-base font-semibold tracking-tight tabular-nums">№ {train.number}</span>{TRAIN_INFO[train.number] && <span className="text-[11px] font-normal text-muted-foreground">{TRAIN_INFO[train.number]!.brand}</span>}{train.kind && <span className="text-[11px] font-normal text-muted-foreground">Shahar atrofi</span>}</span><span className={`shrink-0 text-xs font-medium tabular-nums ${train.cancelled ? "text-red-600 dark:text-red-400" : statusText[train.status]}`}>{train.cancelled ? "Bekor qilingan" : train.status === "running" ? `${statusLabels.running} · ${Math.round(train.progress * 100)}%` : statusLabels[train.status]}</span></span>
              <span className="flex items-center gap-2 text-[13px] font-semibold"><span className="min-w-0 flex-1">{train.from}</span><ArrowRight className="size-3.5 shrink-0 text-primary" /><span className="min-w-0 flex-1 text-right">{train.to}</span></span>
              <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground tabular-nums"><Clock3 className="size-3.5 shrink-0" /><span className="min-w-0 flex-1">{train.status === "running" ? `Kelish: ${formatDateTime(train.arrival)}` : train.status === "waiting" ? `Jo‘nash: ${formatDateTime(train.departure)}` : `Keyingi jo‘nash: ${formatDateTime(train.nextDeparture)}`}</span>{train.price && <span className="shrink-0 font-medium text-foreground">{train.price.toLocaleString("ru-RU").replace(/\s| /g, " ")} so‘m</span>}</span>
            </span>
          </Button>)}
        </div></ScrollArea>
    </div>
  );

  return (
    <main lang="uz" className="relative h-dvh overflow-hidden bg-background text-foreground">
      <section aria-label="O‘zbekiston temiryo‘l xaritasi" className="absolute inset-0">
        <OpenStreetMapRailMap
          key={mapAttempt}
          ref={mapRef}
          network={network}
          stations={mapStations}
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

      <header className="floating-surface absolute inset-x-3 top-3 z-20 flex h-16 items-center justify-between rounded-xl px-4 md:inset-x-5 md:top-5 md:px-5">
        <h1 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"><TrainFront className="size-5 text-primary" aria-hidden="true" />TrainTracker<span className="-ml-2 text-muted-foreground">.uz</span></h1>
      </header>

      {!isMobile && <aside aria-label="Poyezdlar ro‘yxati" className="floating-surface absolute top-24 bottom-6 left-5 z-10 hidden w-80 flex-col overflow-hidden rounded-xl md:flex">{trainList}</aside>}
      {isMobile && <Button variant="outline" className="floating-surface absolute right-3 bottom-6 left-3 z-10 h-14 justify-between rounded-xl bg-card! px-4 text-foreground dark:bg-card!" onClick={() => setListOpen(true)}><span className="flex items-center gap-2"><TrainFront className="size-4 text-primary" />Poyezdlar</span><span className="text-xs font-normal text-muted-foreground tabular-nums">{moving} ta yo‘lda</span></Button>}

      <div className="absolute top-24 right-3 z-10 flex flex-col gap-3 md:right-5">
        <div className="floating-surface flex flex-col rounded-lg p-1"><Button variant="ghost" size="icon" className="size-10" aria-label="Xaritani yaqinlashtirish" onClick={() => mapRef.current?.zoomIn()}><Plus className="size-4" /></Button><Button variant="ghost" size="icon" className="size-10" aria-label="Xaritani uzoqlashtirish" onClick={() => mapRef.current?.zoomOut()}><Minus className="size-4" /></Button></div>
        <Button variant="ghost" size="icon" className="floating-surface size-12 rounded-lg" aria-label="O‘zbekistonni ko‘rsatish" onClick={() => mapRef.current?.reset()}><LocateFixed className="size-4" /></Button>
      </div>
      <div className="absolute top-[88px] left-3 z-10 md:top-auto md:bottom-10 md:left-[360px]">
        {selected && <div className="floating-surface flex gap-3 rounded-lg px-3 py-2 text-[11px] md:mt-2"><span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-muted-foreground" />Bosib o‘tilgan</span><span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-primary" />Qolgan yo‘l</span></div>}
      </div>

      {mapStatus !== "ready" && <div role={mapStatus === "error" ? "alert" : "status"} className="floating-surface absolute top-28 left-3 z-10 w-[min(240px,65vw)] rounded-xl p-4 md:left-[360px]">{mapStatus === "loading" ? <><p className="text-sm">Xarita yuklanmoqda</p><div aria-hidden="true" className="mt-3 space-y-2 motion-safe:animate-pulse"><div className="h-2 w-4/5 rounded bg-muted" /><div className="h-2 w-3/5 rounded bg-muted" /></div></> : <><p className="text-sm">Xaritani yuklab bo‘lmadi</p><Button variant="outline" className="mt-3 h-10" onClick={() => { setMapStatus("loading"); setMapAttempt((attempt) => attempt + 1); }}>Qayta urinish</Button></>}</div>}

      <Sheet open={isMobile && listOpen} onOpenChange={setListOpen} modal={false}><SheetContent side="bottom" showCloseButton={false} className="floating-surface gap-0 rounded-t-2xl" style={sheetStyle}><SheetHeader className="sr-only"><SheetTitle>Poyezdlar ro‘yxati</SheetTitle><SheetDescription>Poyezdni tanlang</SheetDescription></SheetHeader>{sheetHandle}<SheetClose render={<Button variant="ghost" size="icon" className="absolute top-2 right-2 size-10" aria-label="Ro‘yxatni yopish" />}><X className="size-4" /></SheetClose>{isMobile && trainList}</SheetContent></Sheet>
      <Sheet open={Boolean(activeStation)} onOpenChange={(open) => { if (!open) setStationId(null); }} modal={false}>
        <SheetContent side={isMobile ? "bottom" : "right"} showCloseButton={false} style={sheetStyle} className={isMobile ? "gap-0 overflow-hidden rounded-t-3xl border-border bg-background" : "inset-y-24! right-5! h-auto! w-[390px]! max-w-[390px]! gap-0 overflow-hidden rounded-2xl border-border bg-background shadow-xl"}>
          {activeStation && <>
            {isMobile && sheetHandle}
            <SheetHeader className={`gap-0 px-5 pb-4 ${isMobile ? "pt-1" : "pt-4"}`}>
              <div className="mb-5 flex items-center justify-between">
                <SheetClose render={<Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" />}><ArrowLeft className="size-4" />Orqaga</SheetClose>
                <Badge className="h-7 px-3">Bekat</Badge>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Temiryo‘l bekati</p>
              <SheetTitle className="mt-1 text-3xl font-semibold tracking-tight">{activeStation.name}</SheetTitle>
              <SheetDescription className="mt-2 flex items-center gap-1.5 text-sm text-foreground"><MapPin className="size-4 text-primary" />{activeStationInfo?.country ?? "—"}</SheetDescription>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1"><div className="space-y-4 px-4 pb-5">
              {activeStationInfo?.image ? <div>
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted"><Image src={activeStationInfo.image.src} alt={activeStationInfo.image.alt} fill sizes="(max-width: 767px) 100vw, 390px" className="object-cover" /></div>
                <a href={activeStationInfo.image.sourceUrl} target="_blank" rel="noreferrer" className="mt-1.5 block text-right text-[10px] text-muted-foreground underline">Rasm: {activeStationInfo.image.author}, {activeStationInfo.image.license}</a>
              </div> : <div className="flex aspect-video items-center justify-center rounded-2xl bg-muted text-muted-foreground"><TrainFront className="size-10" /><span className="sr-only">Bekat rasmi mavjud emas</span></div>}
              <Card className="gap-3 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bugungi qatnovlar</h3><Badge variant="secondary">{stationServices.length}</Badge></div>
                {stationServices.length ? <div className="space-y-2">{stationServices.map(({ train, time, kind }) => {
                  return <Button key={`${train.number}-${time}`} variant="ghost" className="h-auto w-full justify-start rounded-xl border bg-muted/40 px-3 py-3 text-left" onClick={() => { setStationId(null); selectTrain(train); }}>
                    <span className="mr-3 w-11 shrink-0 text-base font-semibold tabular-nums">{detailTime.format(time)}</span>
                    <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><Badge className="h-5 px-2">{train.number}</Badge><span className="text-[11px] text-muted-foreground">{kind === "departure" ? "Jo‘naydi" : kind === "arrival" ? "Keladi" : "To‘xtaydi"}</span></span><span className="mt-1 block truncate text-xs font-normal text-muted-foreground">{kind === "stop" ? `${train.from} → ${train.to}` : kind === "departure" ? train.to : train.from}</span></span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </Button>;
                })}</div> : <p className="py-5 text-center text-sm text-muted-foreground">Bugun qatnov yo‘q</p>}
              </Card>
            </div></ScrollArea>
          </>}
        </SheetContent>
      </Sheet>
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen} modal={false}>
        <SheetContent side={isMobile ? "bottom" : "right"} showCloseButton={false} style={sheetStyle} className={isMobile ? "gap-0 overflow-hidden rounded-t-3xl border-border bg-background" : "inset-y-24! right-5! h-auto! w-[390px]! max-w-[390px]! gap-0 overflow-hidden rounded-2xl border-border bg-background shadow-xl"}>
          {selected && <>
            {isMobile && sheetHandle}
            <SheetHeader className={`gap-0 px-5 pb-5 ${isMobile ? "pt-1" : "pt-4"}`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <SheetClose render={<Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" />}><ArrowLeft className="size-4" />Orqaga</SheetClose>
                {info && <Badge className="h-7 px-3">{info.brand}</Badge>}
              </div>
              <div className="flex items-center justify-between gap-3"><SheetTitle className="text-4xl font-semibold tracking-tight tabular-nums">№ {selected.number}</SheetTitle></div>
              <SheetDescription render={<div />} className="mt-3 text-xs">
                <div className="flex flex-wrap items-center gap-1" aria-label={`Qatnov kunlari: ${formatDays(selected.departDays)}`}>
                  {selected.departDays.kind === "weekdays"
                    ? [[1, "Du"], [2, "Se"], [3, "Chor"], [4, "Pay"], [5, "Ju"], [6, "Shan"], [0, "Yak"]].map(([day, label]) => <span key={day} className={`flex h-7 min-w-9 items-center justify-center rounded-md px-1.5 text-[11px] ${selected.departDays.kind === "weekdays" && selected.departDays.days.includes(day as number) ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground/50"}`}>{label}</span>)
                    : <span className="flex h-7 items-center rounded-md bg-accent px-2.5 text-[11px] font-semibold text-accent-foreground">{formatDays(selected.departDays)}</span>}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">Vaqtlar Toshkent vaqti bilan{selected.price ? ` · Chipta ${selected.price.toLocaleString("ru-RU").replace(/\s| /g, " ")} so‘m` : ""}</p>
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1"><div className="space-y-4 px-4 pb-5">
              {selected.cancelled && <div role="alert" className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-700 dark:text-red-300"><TriangleAlert className="mt-0.5 size-4 shrink-0" /><div><p className="text-sm font-semibold">Reys bekor qilingan</p><p className="mt-0.5 text-xs">{selected.cancelled}</p></div></div>}
              <Card className="gap-4 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground"><span>Jo‘nash</span><span>Kelish</span></div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div><p className="text-3xl font-semibold tracking-tight tabular-nums">{detailTime.format(selected.departure)}</p><p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{detailDate.format(selected.departure)}</p></div>
                  <ArrowRight className="size-5 text-primary" aria-hidden="true" />
                  <div className="text-right"><p className="text-3xl font-semibold tracking-tight tabular-nums">{detailTime.format(selected.arrival)}{selected.number === "730F" && <span className="text-sm text-muted-foreground">*</span>}</p><p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{detailDate.format(selected.arrival)}</p></div>
                </div>
                <div className="relative mx-1 mt-5"><Progress value={selected.progress * 100} aria-label="Bosib o‘tilgan yo‘l" className="h-1.5" /><span className="absolute bottom-full mb-1.5 flex -translate-x-1/2 flex-col items-center" style={{ left: `${selected.progress * 100}%` }}><span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold leading-4 text-primary-foreground tabular-nums">{Math.round(selected.progress * 100)}%</span><span className="-mt-1 size-2 rotate-45 rounded-[1px] bg-primary" /></span><span className={`absolute -top-1 left-0 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-primary ${selected.progress > 0 ? "bg-primary" : "bg-card"}`} />{selected.progress > 0 && selected.progress < 1 && <span className="absolute -top-1 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-primary bg-card ring-4 ring-primary/20" style={{ left: `${selected.progress * 100}%` }} />}<span className={`absolute -top-1 right-0 size-3.5 translate-x-1/2 rounded-full border-[3px] ${selected.progress >= 1 ? "border-primary bg-primary" : "border-muted-foreground/50 bg-card"}`} /></div>
                <div className="grid grid-cols-2 gap-5 text-[13px] font-medium leading-snug"><p>{selected.from}</p><p className="text-right">{selected.to}</p></div>
              </Card>
              <div className="grid grid-cols-3 gap-2.5">
                <Card className="items-center gap-2 rounded-xl px-2 py-3.5 text-center shadow-sm"><Gauge className="size-4 text-muted-foreground" /><p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">O‘rt. tezlik</p><p className="text-sm font-semibold tabular-nums">{selectedRoute ? Math.round(selectedRoute.distance / ((selected.arrival - selected.departure) / 3_600_000)) : "—"}<span className="ml-1 text-[10px] font-normal text-muted-foreground">km/soat</span></p></Card>
                <Card className="items-center gap-2 rounded-xl px-2 py-3.5 text-center shadow-sm"><Ruler className="size-4 text-muted-foreground" /><p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Masofa</p><p className="text-sm font-semibold tabular-nums">{selectedRoute ? Math.round(selectedRoute.distance) : "—"}<span className="ml-1 text-[10px] font-normal text-muted-foreground">km</span></p></Card>
                <Card className="items-center gap-2 rounded-xl px-2 py-3.5 text-center shadow-sm"><Clock3 className="size-4 text-muted-foreground" /><p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Davomiylik</p><p className="text-xs font-semibold leading-5 tabular-nums">{formatDuration(selected.arrival - selected.departure)}</p></Card>
              </div>
              <Card className="gap-4 rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bekatlar</h3>

                <ol>{detailStops.map((stop, index) => {
                  const passed = stop.progress !== null && selected.progress >= stop.progress;
                  const active = index === currentStopIndex;
                  return <li key={`${stop.name}-${index}`} className="grid grid-cols-[48px_20px_1fr] gap-2.5">
                    <span className={`pt-3 text-xs tabular-nums ${passed ? "text-foreground" : "text-muted-foreground"}`}>{detailTime.format(stop.arrival)}</span>
                    <div className="relative flex justify-center">{index < detailStops.length - 1 && <span className={`absolute top-5 bottom-0 w-px ${selected.progress >= (detailStops[index + 1].progress ?? Infinity) ? "bg-primary" : "bg-border"}`} />}<span className={`relative z-10 mt-3.5 size-3 rounded-full border-2 ${active ? "border-primary bg-card ring-4 ring-primary/15" : passed ? "border-primary bg-primary" : "border-input bg-card"}`} /></div>
                    <div className={`mb-3 min-h-14 rounded-xl border px-3 py-2.5 ${active ? "border-primary/30 bg-accent" : "border-transparent"}`}><p className={`text-[13px] leading-snug ${active ? "font-medium text-accent-foreground" : "text-foreground"}`}>{stop.name}</p>{index === 0 || index === detailStops.length - 1 ? <p className="mt-1 text-[10px] text-muted-foreground">{index === 0 ? "Jo‘nash bekati" : "Oxirgi bekat"}</p> : <p className="mt-1 text-[10px] text-muted-foreground">To‘xtash: {stop.dwell} daq.</p>}</div>
                  </li>;
                })}</ol>
                {detailStops.length > 2 && !selected.kind && <p className="text-[10px] text-muted-foreground">Oraliq bekatlardagi vaqtlar taxminiy.</p>}
              </Card>
              {selected.status !== "running" && <Card className="flex-row items-center gap-3 rounded-2xl p-4 shadow-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"><CalendarClock className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{selected.status === "waiting" ? "Jo‘nashgacha" : "Keyingi jo‘nash"}</p>
                  <p className="mt-0.5 text-lg font-semibold tracking-tight tabular-nums">{untilNext}</p>
                </div>
                <div className="text-right"><p className="text-sm font-semibold tabular-nums">{detailTime.format(selected.nextDeparture)}</p><p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">{detailDate.format(selected.nextDeparture)}</p></div>
              </Card>}
              <p className="px-1 text-[10px] text-muted-foreground">{selected.number === "730F" && " * Kelish vaqti tasdiqlanmagan."}</p>
            </div></ScrollArea>
          </>}
        </SheetContent>
      </Sheet>
    </main>
  );
}
