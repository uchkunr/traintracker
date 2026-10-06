"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Coordinate, RailNetwork, RailRoute, Station } from "@/lib/train-data";

export interface MapTrain {
  number: string;
  status: "running" | "waiting" | "arrived";
  coordinates: Coordinate;
  bearing: number;
}

export interface YandexRailMapRef {
  fitBounds: (bounds: [Coordinate, Coordinate]) => void;
  flyTo: (coordinates: Coordinate) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

interface YandexRailMapProps {
  network: RailNetwork | null;
  stations: Station[];
  trains: MapTrain[];
  selectedRoute?: RailRoute;
  selectedProgress: number;
  selectedStationId: string | null;
  selectedTrainId: string | null;
  palette: { accent: string; rail: string; casing: string } | null;
  onReady: () => void;
  onError: () => void;
  onStationClick: (id: string) => void;
  onTrainClick: (number: string) => void;
}

type YandexEntity = object;
type YandexMap = {
  zoom: number;
  addChild: (entity: YandexEntity) => void;
  removeChild: (entity: YandexEntity) => void;
  setLocation: (location: Record<string, unknown>) => void;
  destroy: () => void;
};
type YandexApi = {
  ready: Promise<void>;
  YMap: new (container: HTMLElement, props: Record<string, unknown>) => YandexMap;
  YMapDefaultSchemeLayer: new (props: Record<string, unknown>) => YandexEntity;
  YMapDefaultFeaturesLayer: new (props: Record<string, unknown>) => YandexEntity;
  YMapFeature: new (props: Record<string, unknown>) => YandexEntity;
  YMapMarker: new (props: Record<string, unknown>, element: HTMLElement) => YandexEntity;
};

declare global {
  interface Window {
    ymaps3?: YandexApi;
  }
}

function routeUntil(route: RailRoute, progress: number): Coordinate[] {
  const target = Math.max(0, Math.min(1, progress)) * route.distance;
  const coordinates: Coordinate[] = [route.coordinates[0]];
  for (let index = 1; index < route.coordinates.length; index += 1) {
    const previous = route.cumulative[index - 1];
    const current = route.cumulative[index];
    if (current <= target) {
      coordinates.push(route.coordinates[index]);
      continue;
    }
    const ratio = (target - previous) / (current - previous || 1);
    const from = route.coordinates[index - 1];
    const to = route.coordinates[index];
    coordinates.push([from[0] + (to[0] - from[0]) * ratio, from[1] + (to[1] - from[1]) * ratio]);
    break;
  }
  return coordinates;
}

export const YandexRailMap = forwardRef<YandexRailMapRef, YandexRailMapProps>(function YandexRailMap({
  network, stations, trains, selectedRoute, selectedProgress, selectedStationId,
  selectedTrainId, palette, onReady, onError, onStationClick, onTrainClick,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMap | null>(null);
  const apiRef = useRef<YandexApi | null>(null);
  const railEntitiesRef = useRef<YandexEntity[]>([]);
  const routeEntitiesRef = useRef<YandexEntity[]>([]);
  const markerEntitiesRef = useRef<YandexEntity[]>([]);
  const callbacksRef = useRef({ onStationClick, onTrainClick });
  const lifecycleRef = useRef({ onReady, onError });
  const [readyRevision, setReadyRevision] = useState(0);

  useEffect(() => { callbacksRef.current = { onStationClick, onTrainClick }; }, [onStationClick, onTrainClick]);
  useEffect(() => { lifecycleRef.current = { onReady, onError }; }, [onReady, onError]);

  useImperativeHandle(ref, () => ({
    fitBounds: (bounds) => mapRef.current?.setLocation({ bounds, duration: 650 }),
    flyTo: (coordinates) => mapRef.current?.setLocation({ center: coordinates, zoom: 10, duration: 700 }),
    zoomIn: () => {
      const map = mapRef.current;
      if (map) map.setLocation({ zoom: map.zoom + 1, duration: 200 });
    },
    zoomOut: () => {
      const map = mapRef.current;
      if (map) map.setLocation({ zoom: map.zoom - 1, duration: 200 });
    },
    reset: () => mapRef.current?.setLocation({ center: [66.5, 40], zoom: 6.2, duration: 250 }),
  }), []);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      const container = containerRef.current;
      const api = window.ymaps3;
      if (!container || !api) {
        lifecycleRef.current.onError();
        return;
      }
      try {
        await api.ready;
        if (cancelled) return;
        const map = new api.YMap(container, {
          location: { center: [66.5, 40], zoom: 6.2 },
          behaviors: ["drag", "scrollZoom", "dblClick", "pinchZoom"],
        });
        map.addChild(new api.YMapDefaultSchemeLayer({ theme: "light" }));
        map.addChild(new api.YMapDefaultFeaturesLayer({}));
        apiRef.current = api;
        mapRef.current = map;
        setReadyRevision((revision) => revision + 1);
        lifecycleRef.current.onReady();
      } catch {
        if (!cancelled) lifecycleRef.current.onError();
      }
    }
    initialize();
    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api) return;
    railEntitiesRef.current.forEach((entity) => map.removeChild(entity));
    railEntitiesRef.current = [];
    if (!network || !palette) return;
    const geometry = {
      type: "MultiLineString",
      coordinates: network.features.map((feature) => feature.geometry.coordinates),
    };
    const casing = new api.YMapFeature({ geometry, style: { stroke: [{ color: palette.casing, width: 7, opacity: 0.8 }] } });
    const rail = new api.YMapFeature({ geometry, style: { stroke: [{ color: palette.rail, width: 3, opacity: 0.95 }] } });
    map.addChild(casing);
    map.addChild(rail);
    railEntitiesRef.current = [casing, rail];
  }, [network, palette, readyRevision]);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api) return;
    routeEntitiesRef.current.forEach((entity) => map.removeChild(entity));
    routeEntitiesRef.current = [];
    if (!selectedRoute || !palette) return;
    const route = new api.YMapFeature({
      geometry: { type: "LineString", coordinates: selectedRoute.coordinates },
      style: { stroke: [{ color: "#64748b", width: 6 }] },
    });
    const progress = new api.YMapFeature({
      geometry: { type: "LineString", coordinates: routeUntil(selectedRoute, selectedProgress) },
      style: { stroke: [{ color: palette.accent, width: 6 }] },
    });
    map.addChild(route);
    map.addChild(progress);
    routeEntitiesRef.current = [route, progress];
  }, [selectedRoute, selectedProgress, palette, readyRevision]);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api) return;
    markerEntitiesRef.current.forEach((entity) => map.removeChild(entity));
    const entities: YandexEntity[] = [];

    for (const station of stations) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "group flex flex-col items-center focus:outline-none";
      button.setAttribute("aria-label", `${station.name} bekati`);
      const dot = document.createElement("span");
      dot.className = `block rounded-full border-2 border-primary bg-card shadow-sm transition-transform group-hover:scale-125 ${selectedStationId === station.id ? "size-4 ring-4 ring-primary/20" : "size-3"}`;
      const label = document.createElement("span");
      label.className = `map-label mt-1 whitespace-nowrap ${selectedStationId === station.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"}`;
      label.textContent = station.name;
      button.append(dot, label);
      button.addEventListener("click", () => callbacksRef.current.onStationClick(station.id));
      const marker = new api.YMapMarker({ coordinates: station.coordinates, zIndex: 20 }, button);
      map.addChild(marker);
      entities.push(marker);
    }

    for (const train of trains) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `train-marker flex size-10 items-center justify-center rounded-full ${train.status === "running" ? "" : "opacity-55 grayscale"} ${selectedTrainId === train.number ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`;
      button.setAttribute("aria-label", `${train.number} poyezdi`);
      if (train.status !== "running") button.style.color = "var(--muted-foreground)";
      button.innerHTML = `<svg aria-hidden="true" viewBox="0 0 32 44" width="24" height="33" style="transform:rotate(${train.bearing}deg)"><path d="M7 36V14C7 7 11 2 16 1c5 1 9 6 9 13v22q0 5-4 5H11q-4 0-4-5Z" fill="currentColor" stroke="var(--rail-casing)" stroke-width="2"/><path d="M11 13h10v6H11z" fill="var(--rail-casing)"/></svg>`;
      button.addEventListener("click", () => callbacksRef.current.onTrainClick(train.number));
      const marker = new api.YMapMarker({ coordinates: train.coordinates, zIndex: 30 }, button);
      map.addChild(marker);
      entities.push(marker);
    }

    markerEntitiesRef.current = entities;
    return () => {
      if (!mapRef.current) return;
      entities.forEach((entity) => map.removeChild(entity));
      if (markerEntitiesRef.current === entities) markerEntitiesRef.current = [];
    };
  }, [stations, trains, selectedStationId, selectedTrainId, readyRevision]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Yandex temiryo‘l xaritasi" />;
});
