"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, Gauge, ListFilter, LocateFixed, MapPin, Ruler, Minus, Monitor, Moon, Plus, Search, Sun, TrainFront, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { OpenStreetMapRailMap, type OpenStreetMapRailMapRef } from "@/components/train-tracker/OpenStreetMapRailMap";
import Image from "next/image";
import { INTERNATIONAL_RAIL_SEGMENTS, STATIONS, buildRoutes, pointAlong, type RailNetwork } from "@/lib/train-data";
import { SCHEDULE, getServiceState, formatDateTime, formatDays, formatDuration, type ScheduledTrain } from "@/lib/schedule";
import { STATION_INFO } from "@/lib/station-info";
import { TRAIN_INFO } from "@/lib/trains-info";

const detailTime = new Intl.DateTimeFormat("uz", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hour12: false });
const detailDate = new Intl.DateTimeFormat("uz", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric" });

const statusLabels = { running: "Yo‘lda", waiting: "Kutilmoqda", arrived: "Yetib keldi" };
const statusClasses = {
  running: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 [&>span]:bg-emerald-500",
  waiting: "bg-amber-500/15 text-amber-700 dark:text-amber-300 [&>span]:bg-amber-500",
  arrived: "bg-sky-500/15 text-sky-700 dark:text-sky-300 [&>span]:bg-sky-500",
};

export default function Home() {
  const mapRef = useRef<OpenStreetMapRailMapRef>(null);
  const [now, setNow] = useState<number | null>(null);
  const [network, setNetwork] = useState<RailNetwork | null>(null);
  const [palette, setPalette] = useState<{ accent: string; rail: string; casing: string } | null>(null);
  const routes = useMemo(() => network ? buildRoutes(network) : {}, [network]);
  const trains = useMemo(() => now === null ? [] : SCHEDULE.map((train) => getServiceState(train, now)), [now]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [themeChoice, setThemeChoice] = useState("system");
  const [systemDark, setSystemDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [stationId, setStationId] = useState<string | null>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mapAttempt, setMapAttempt] = useState(0);
  const theme = themeChoice === "system" ? (systemDark ? "dark" : "light") : themeChoice === "dark" ? "dark" : "light";
  useEffect(() => {
    const frame = requestAnimationFrame(() => setNow(Date.now()));
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const controller = new AbortController();
    fetch("/railways.geojson", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Rail geometry unavailable"); return response.json(); })
      .then((data: RailNetwork) => setNetwork({ ...data, features: [...data.features, ...INTERNATIONAL_RAIL_SEGMENTS] }))
      .catch((error: Error) => { if (error.name !== "AbortError") setMapStatus("error"); });
    return () => { cancelAnimationFrame(frame); clearInterval(timer); controller.abort(); };
  }, []);

  useEffect(() => {
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const mobile = window.matchMedia("(max-width: 767px)");
    const sync = () => { setSystemDark(colorScheme.matches); setIsMobile(mobile.matches); };
    const frame = requestAnimationFrame(() => {
      sync();
      try {
        const saved = localStorage.getItem("traintracker-theme");
        if (saved === "light" || saved === "dark" || saved === "system") setThemeChoice(saved);
      } catch { /* System theme still works when storage is unavailable. */ }
    });
    colorScheme.addEventListener("change", sync);
    mobile.addEventListener("change", sync);
    return () => { cancelAnimationFrame(frame); colorScheme.removeEventListener("change", sync); mobile.removeEventListener("change", sync); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    const frame = requestAnimationFrame(() => {
      const styles = getComputedStyle(document.documentElement);
      setPalette({ accent: styles.getPropertyValue("--rail-active").trim(), rail: styles.getPropertyValue("--rail-track").trim(), casing: styles.getPropertyValue("--rail-casing").trim() });
    });
    return () => cancelAnimationFrame(frame);
  }, [theme]);

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
      mapRef.current?.flyTo(nearest.coordinates);
    }, () => { /* Without permission the default map view stays. */ });
  }, [mapStatus]);

  const selected = trains.find((train) => train.number === selectedId);
  const selectedRoute = selected ? routes[selected.number] : undefined;
  const info = selected ? TRAIN_INFO[selected.number] : undefined;
  const detailStops = (() => {
    if (!selected) return [];
    return [selected.from, ...selected.via, selected.to].map((name, index, stops) => {
      let progress: number | null = index === 0 ? 0 : index === stops.length - 1 ? 1 : null;
      const station = STATIONS.find((item) => item.name === name);
      if (progress === null && station && selectedRoute) {
        let nearest = 0, closest = Infinity;
        selectedRoute.coordinates.forEach((point, i) => {
          const distance = ((point[0] - station.coordinates[0]) * Math.cos(station.coordinates[1] * Math.PI / 180)) ** 2 + (point[1] - station.coordinates[1]) ** 2;
          if (distance < closest) { closest = distance; nearest = i; }
        });
        progress = selectedRoute.cumulative[nearest] / selectedRoute.distance;
      }
      return { name, progress, time: index === 0 ? selected.departure : index === stops.length - 1 ? selected.arrival : null };
    });
  })();
  const currentStopIndex = selected ? Math.max(0, detailStops.findLastIndex((stop) => stop.progress !== null && stop.progress <= selected.progress)) : 0;

  const search = query.trim().toLocaleLowerCase("uz").replace(/[‘’ʻʼ']/g, "");
  const matchingTrains = trains.filter((train) =>
    `${train.number} ${train.from} ${train.via.join(" ")} ${train.to}`.toLocaleLowerCase("uz").replace(/[‘’ʻʼ']/g, "").includes(search),
  );
  const visibleTrains = matchingTrains.filter((train) => status === "all" || train.status === status);
  const moving = trains.filter((train) => train.status === "running").length;
  const activeStation = STATIONS.find((station) => station.id === stationId);
  const activeStationInfo = activeStation ? STATION_INFO[activeStation.name] : undefined;
  const stationServices = activeStation ? trains
    .filter((train) => train.runsToday && (train.from === activeStation.name || train.to === activeStation.name))
    .map((train) => ({ train, time: train.from === activeStation.name ? train.departure : train.arrival }))
    .sort((a, b) => a.time - b.time) : [];
  function selectTrain(train: ScheduledTrain) {
    setSelectedId(train.number);
    setListOpen(false);
    setDetailsOpen(true);
    if (train.status !== "running") {
      const station = STATIONS.find((item) => item.name === train.from);
      if (station) mapRef.current?.flyTo(station.coordinates);
      return;
    }
    const coordinates = routes[train.number]?.coordinates ?? STATIONS.filter((station) => station.name === train.from || station.name === train.to).map((station) => station.coordinates);
    if (!coordinates.length) return;
    const lngs = coordinates.map((point) => point[0]), lats = coordinates.map((point) => point[1]);
    mapRef.current?.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]]);
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
    if (position) mapRef.current?.flyTo(position);
  }

  const trainList = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-5 pt-5">
        <div className="mb-4 flex items-baseline justify-between"><h2 className="text-lg font-semibold tracking-tight">Poyezdlar</h2><span className="text-xs text-muted-foreground tabular-nums">{visibleTrains.length} ta reys</span></div>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" /><Input aria-label="Poyezdni qidirish" placeholder="Poyezd yoki shahar" value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 bg-card pl-9 pr-10" />{query && <Button variant="ghost" size="icon" className="absolute top-0 right-0 size-10" aria-label="Qidiruvni tozalash" onClick={() => setQuery("")}><X className="size-3.5" /></Button>}</div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="relative size-10 shrink-0 bg-card" aria-label="Holat bo‘yicha filtrlash" />}><ListFilter className="size-4" />{status !== "all" && <span className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-card bg-primary" />}</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuRadioGroup value={status} onValueChange={(value) => changeStatus(String(value))}>
                <DropdownMenuLabel>Poyezd holati</DropdownMenuLabel>
                {[["all", "Barchasi"], ["running", "Yo‘lda"], ["waiting", "Kutilmoqda"], ["arrived", "Yetib keldi"]].map(([value, label]) => <DropdownMenuRadioItem key={value} value={value} className="min-h-9">{label}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea className="mt-3 min-h-0 flex-1"><div className="px-2 pb-3">
          {now === null ? <p role="status" className="p-5 text-sm text-muted-foreground">Jadval yuklanmoqda</p> : visibleTrains.length === 0 && <div role="status" className="px-3 py-10 text-center"><p className="text-sm font-medium">Poyezd topilmadi</p><Button variant="link" className="mt-2 h-10" onClick={() => { setQuery(""); setStatus("all"); }}>Filtrlarni tozalash</Button></div>}
          {visibleTrains.map((train) => <Button key={train.number} variant="ghost" aria-label={`${train.number} poyezdi haqida`} aria-pressed={selectedId === train.number} data-highlighted={selectedId === train.number || hoveredId === train.number} onMouseEnter={() => setHoveredId(train.number)} onMouseLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(train.number)} onBlur={() => setHoveredId(null)} onClick={() => selectTrain(train)} className="train-row group h-auto w-full items-stretch rounded-md border-l-2 border-l-transparent px-3 py-4 text-left whitespace-normal">
            <span className="flex w-full flex-col gap-3">
              <span className="flex items-center justify-between gap-2"><span className="flex items-baseline gap-2"><span className="text-base font-semibold tracking-tight tabular-nums">№ {train.number}</span>{TRAIN_INFO[train.number] && <span className="text-[11px] font-normal text-muted-foreground">{TRAIN_INFO[train.number]!.brand}</span>}</span><span className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${statusClasses[train.status]}`}><span className="size-1.5 rounded-full" />{statusLabels[train.status]}</span></span>
              <span className="flex items-center gap-2 text-[13px] font-semibold"><span className="min-w-0 flex-1">{train.from}</span><ArrowRight className="size-3.5 shrink-0 text-primary" /><span className="min-w-0 flex-1 text-right">{train.to}</span></span>
              <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground tabular-nums"><Clock3 className="size-3.5" />{train.status === "running" ? `Kelish: ${formatDateTime(train.arrival)}` : train.status === "waiting" ? `Jo‘nash: ${formatDateTime(train.departure)}` : `Keyingi jo‘nash: ${formatDateTime(train.nextDeparture)}`}</span>
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
          stations={STATIONS}
          trains={visibleTrains.filter((train) => train.status === "running" || status !== "all" || train.number === selectedId).flatMap((train) => {
            if (train.status === "running" && routes[train.number]) return [{ number: train.number, status: train.status, ...pointAlong(routes[train.number]!, train.progress) }];
            const station = STATIONS.find((item) => item.name === train.from);
            return station ? [{ number: train.number, status: train.status, coordinates: station.coordinates, bearing: 0 }] : [];
          })}
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
        <span className="text-[11px] text-muted-foreground md:hidden">Jadval bo‘yicha</span>
        <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-10" aria-label="Mavzuni tanlash" />}>{themeChoice === "system" ? <Monitor className="size-4" /> : theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}</DropdownMenuTrigger><DropdownMenuContent align="end" className="floating-surface min-w-40">{[["light", "Yorug‘"], ["dark", "Qorong‘i"], ["system", "Tizimga mos"]].map(([value, label]) => <DropdownMenuItem key={value} className="min-h-10 cursor-pointer" onClick={() => { setThemeChoice(value); try { localStorage.setItem("traintracker-theme", value); } catch { /* Theme selection remains available without storage. */ } }}><span className="flex-1">{label}</span>{themeChoice === value && <Check className="size-4" />}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
      </header>

      {!isMobile && <aside aria-label="Poyezdlar ro‘yxati" className="floating-surface absolute top-24 bottom-6 left-5 z-10 hidden w-80 flex-col overflow-hidden rounded-xl md:flex">{trainList}</aside>}
      {isMobile && <Button className="floating-surface absolute right-3 bottom-10 left-3 z-10 h-14 justify-between rounded-xl px-4 text-foreground" onClick={() => setListOpen(true)}><span className="flex items-center gap-2"><TrainFront className="size-4 text-primary" />Poyezdlar</span><span className="text-xs font-normal text-muted-foreground tabular-nums">{moving} ta yo‘lda</span></Button>}

      <div className="absolute top-24 right-3 z-10 flex flex-col gap-3 md:right-5">
        <div className="floating-surface flex flex-col rounded-lg p-1"><Button variant="ghost" size="icon" className="size-10" aria-label="Xaritani yaqinlashtirish" onClick={() => mapRef.current?.zoomIn()}><Plus className="size-4" /></Button><Button variant="ghost" size="icon" className="size-10" aria-label="Xaritani uzoqlashtirish" onClick={() => mapRef.current?.zoomOut()}><Minus className="size-4" /></Button></div>
        <Button variant="ghost" size="icon" className="floating-surface size-12 rounded-lg" aria-label="O‘zbekistonni ko‘rsatish" onClick={() => mapRef.current?.reset()}><LocateFixed className="size-4" /></Button>
      </div>
      <div className="absolute bottom-28 left-3 z-10 md:bottom-10 md:left-[360px]">
        {selected && <div className="floating-surface mt-2 flex gap-3 rounded-lg px-3 py-2 text-[11px]"><span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-muted-foreground" />Bosib o‘tilgan</span><span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-primary" />Qolgan yo‘l</span></div>}
      </div>

      {mapStatus !== "ready" && <div role={mapStatus === "error" ? "alert" : "status"} className="floating-surface absolute top-28 left-3 z-10 w-[min(240px,65vw)] rounded-xl p-4 md:left-[360px]">{mapStatus === "loading" ? <><p className="text-sm">Xarita yuklanmoqda</p><div aria-hidden="true" className="mt-3 space-y-2 motion-safe:animate-pulse"><div className="h-2 w-4/5 rounded bg-muted" /><div className="h-2 w-3/5 rounded bg-muted" /></div></> : <><p className="text-sm">Xaritani yuklab bo‘lmadi</p><Button variant="outline" className="mt-3 h-10" onClick={() => { setMapStatus("loading"); setMapAttempt((attempt) => attempt + 1); }}>Qayta urinish</Button></>}</div>}

      <Sheet open={isMobile && listOpen} onOpenChange={setListOpen}><SheetContent side="bottom" showCloseButton={false} className="floating-surface h-[65dvh] gap-0 rounded-t-2xl"><SheetHeader className="sr-only"><SheetTitle>Poyezdlar ro‘yxati</SheetTitle><SheetDescription>Poyezdni tanlang</SheetDescription></SheetHeader><div className="mx-auto mt-2 h-1 w-8 rounded-full bg-border" /><SheetClose render={<Button variant="ghost" size="icon" className="absolute top-2 right-2 size-10" aria-label="Ro‘yxatni yopish" />}><X className="size-4" /></SheetClose>{isMobile && trainList}</SheetContent></Sheet>
      <Sheet open={Boolean(activeStation)} onOpenChange={(open) => { if (!open) setStationId(null); }} modal={false}>
        <SheetContent side={isMobile ? "bottom" : "right"} showCloseButton={false} className={isMobile ? "h-[72dvh] gap-0 overflow-hidden rounded-t-3xl border-border bg-background" : "inset-y-24! right-5! h-auto! w-[390px]! max-w-[390px]! gap-0 overflow-hidden rounded-2xl border-border bg-background shadow-xl"}>
          {activeStation && <>
            <SheetHeader className="gap-0 px-5 pt-4 pb-4">
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
                {stationServices.length ? <div className="space-y-2">{stationServices.map(({ train, time }) => {
                  const departure = train.from === activeStation.name;
                  return <Button key={`${train.number}-${time}`} variant="ghost" className="h-auto w-full justify-start rounded-xl border bg-muted/40 px-3 py-3 text-left" onClick={() => { setStationId(null); selectTrain(train); }}>
                    <span className="mr-3 w-11 shrink-0 text-base font-semibold tabular-nums">{detailTime.format(time)}</span>
                    <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><Badge className="h-5 px-2">{train.number}</Badge><span className="text-[11px] text-muted-foreground">{departure ? "Jo‘naydi" : "Keladi"}</span></span><span className="mt-1 block truncate text-xs font-normal text-muted-foreground">{departure ? train.to : train.from}</span></span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </Button>;
                })}</div> : <p className="py-5 text-center text-sm text-muted-foreground">Bugun qatnov yo‘q</p>}
              </Card>
            </div></ScrollArea>
          </>}
        </SheetContent>
      </Sheet>
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen} modal={false}>
        <SheetContent side={isMobile ? "bottom" : "right"} showCloseButton={false} className={isMobile ? "h-[70dvh] gap-0 overflow-hidden rounded-t-3xl border-border bg-background" : "inset-y-24! right-5! h-auto! w-[390px]! max-w-[390px]! gap-0 overflow-hidden rounded-2xl border-border bg-background shadow-xl"}>
          {selected && <>
            <SheetHeader className="gap-0 px-5 pt-4 pb-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <SheetClose render={<Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" />}><ArrowLeft className="size-4" />Orqaga</SheetClose>
                {info && <Badge className="h-7 px-3">{info.brand}</Badge>}
              </div>
              <div className="flex items-center justify-between gap-3"><SheetTitle className="text-4xl font-semibold tracking-tight tabular-nums">№ {selected.number}</SheetTitle><Badge variant="secondary" className="h-7 gap-1.5 px-2.5"><span className={`size-1.5 rounded-full ${selected.status === "running" ? "bg-primary" : "bg-muted-foreground"}`} />{statusLabels[selected.status]}</Badge></div>
              <SheetDescription className="mt-2 text-xs">{formatDays(selected.departDays)} · Toshkent vaqti</SheetDescription>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1"><div className="space-y-4 px-4 pb-5">
              <Card className="gap-4 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground"><span>Jo‘nash</span><span>Kelish</span></div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div><p className="text-3xl font-semibold tracking-tight tabular-nums">{detailTime.format(selected.departure)}</p><p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{detailDate.format(selected.departure)}</p></div>
                  <ArrowRight className="size-5 text-primary" aria-hidden="true" />
                  <div className="text-right"><p className="text-3xl font-semibold tracking-tight tabular-nums">{detailTime.format(selected.arrival)}{selected.number === "730F" && <span className="text-sm text-muted-foreground">*</span>}</p><p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{detailDate.format(selected.arrival)}</p></div>
                </div>
                <div className="relative mx-1 mt-5"><Progress value={selected.progress * 100} aria-label="Bosib o‘tilgan yo‘l" className="h-1.5" /><span className="absolute -top-7 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground tabular-nums" style={{ left: `clamp(18px, ${selected.progress * 100}%, calc(100% - 18px))` }}>{Math.round(selected.progress * 100)}%</span><span className="absolute -top-1 left-0 size-3.5 rounded-full border-[3px] border-primary bg-card" /><span className="absolute -top-1 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-primary bg-card" style={{ left: `${selected.progress * 100}%` }} /><span className="absolute -top-1 right-0 size-3.5 rounded-full border-[3px] border-primary bg-card" /></div>
                <div className="grid grid-cols-2 gap-5 text-[13px] font-medium leading-snug"><p>{selected.from}</p><p className="text-right">{selected.to}</p></div>
              </Card>
              <div className="grid grid-cols-3 gap-2.5">
                <Card className="items-center gap-2 rounded-xl px-2 py-3.5 text-center shadow-sm"><Gauge className="size-4 text-muted-foreground" /><p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">O‘rt. tezlik</p><p className="text-sm font-semibold tabular-nums">{selectedRoute ? Math.round(selectedRoute.distance / ((selected.arrival - selected.departure) / 3_600_000)) : "—"}<span className="ml-1 text-[10px] font-normal text-muted-foreground">km/soat</span></p></Card>
                <Card className="items-center gap-2 rounded-xl px-2 py-3.5 text-center shadow-sm"><Ruler className="size-4 text-muted-foreground" /><p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Masofa</p><p className="text-sm font-semibold tabular-nums">{selectedRoute ? Math.round(selectedRoute.distance) : "—"}<span className="ml-1 text-[10px] font-normal text-muted-foreground">km</span></p></Card>
                <Card className="items-center gap-2 rounded-xl px-2 py-3.5 text-center shadow-sm"><Clock3 className="size-4 text-muted-foreground" /><p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Davomiylik</p><p className="text-xs font-semibold leading-5 tabular-nums">{formatDuration(selected.arrival - selected.departure)}</p></Card>
              </div>
              <Card className="gap-4 rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bekatlar</h3>
                <div className="flex items-start gap-2 rounded-xl bg-accent px-3 py-2.5 text-accent-foreground"><MapPin className="mt-0.5 size-4 shrink-0" /><p className="text-xs leading-relaxed">{selected.status === "running" ? `${detailStops[currentStopIndex]?.name} → ${detailStops[currentStopIndex + 1]?.name ?? selected.to}` : selected.status === "arrived" ? selected.to : selected.from}</p></div>
                <ol>{detailStops.map((stop, index) => {
                  const passed = stop.progress !== null && selected.progress >= stop.progress;
                  const active = index === currentStopIndex;
                  return <li key={`${stop.name}-${index}`} className="grid grid-cols-[48px_20px_1fr] gap-2.5">
                    <span className={`pt-3 text-xs tabular-nums ${passed ? "text-foreground" : "text-muted-foreground"}`}>{stop.time === null ? "—" : detailTime.format(stop.time)}</span>
                    <div className="relative flex justify-center">{index < detailStops.length - 1 && <span className={`absolute top-5 bottom-0 w-px ${selected.progress >= (detailStops[index + 1].progress ?? Infinity) ? "bg-primary" : "bg-border"}`} />}<span className={`relative z-10 mt-3.5 size-3 rounded-full border-2 ${active ? "border-primary bg-card ring-4 ring-primary/15" : passed ? "border-primary bg-primary" : "border-input bg-card"}`} /></div>
                    <div className={`mb-3 min-h-14 rounded-xl border px-3 py-2.5 ${active ? "border-primary/30 bg-accent" : "border-transparent"}`}><p className={`text-[13px] leading-snug ${active ? "font-medium text-accent-foreground" : "text-foreground"}`}>{stop.name}</p>{index === 0 || index === detailStops.length - 1 ? <p className="mt-1 text-[10px] text-muted-foreground">{index === 0 ? "Jo‘nash bekati" : "Oxirgi bekat"}</p> : null}</div>
                  </li>;
                })}</ol>
              </Card>
              {selected.status !== "running" && <div className="flex items-center justify-between gap-3 px-1 text-xs"><span className="text-muted-foreground">Keyingi jo‘nash</span><span className="font-medium tabular-nums">{formatDateTime(selected.nextDeparture)}</span></div>}
              <p className="px-1 text-[10px] text-muted-foreground">{selected.number === "730F" && " * Kelish vaqti tasdiqlanmagan."}</p>
            </div></ScrollArea>
          </>}
        </SheetContent>
      </Sheet>
    </main>
  );
}
