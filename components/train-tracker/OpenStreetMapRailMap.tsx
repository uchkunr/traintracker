"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Coordinate, RailNetwork, RailRoute, Station } from "@/lib/train-data";

if (typeof window !== "undefined" && !maplibregl.getWorkerUrl()) {
  maplibregl.setWorkerUrl(`https://unpkg.com/maplibre-gl@${maplibregl.getVersion()}/dist/maplibre-gl-worker.mjs`);
}

// Vector tiles (OpenStreetMap data served by OpenFreeMap) stay sharp at every zoom and on retina screens.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
// Rail lines go under the place names, so labels stay readable above the route.
const labelLayer = (map: MapLibreMap) => map.getStyle().layers.find((layer) => layer.type === "symbol")?.id;

export interface MapTrain {
  number: string;
  status: "running" | "waiting" | "arrived";
  coordinates: Coordinate;
  bearing: number;
}

export interface MapPadding { top: number; bottom: number; left: number; right: number }

export interface OpenStreetMapRailMapRef {
  fitBounds: (bounds: [Coordinate, Coordinate], padding?: MapPadding) => void;
  flyTo: (coordinates: Coordinate, padding?: MapPadding) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

interface OpenStreetMapRailMapProps {
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
  onMapClick?: () => void;
  stationLabel: (name: string) => string;
  trainLabel: (number: string) => string;
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

export const OpenStreetMapRailMap = forwardRef<OpenStreetMapRailMapRef, OpenStreetMapRailMapProps>(function OpenStreetMapRailMap({
  network, stations, trains, selectedRoute, selectedProgress, selectedStationId,
  selectedTrainId, palette, onReady, onError, onStationClick, onTrainClick, onMapClick, stationLabel, trainLabel,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const callbacksRef = useRef({ onStationClick, onTrainClick, onMapClick });
  const lifecycleRef = useRef({ onReady, onError });
  const [styleRevision, setStyleRevision] = useState(0);

  useEffect(() => { callbacksRef.current = { onStationClick, onTrainClick, onMapClick }; }, [onStationClick, onTrainClick, onMapClick]);
  useEffect(() => { lifecycleRef.current = { onReady, onError }; }, [onReady, onError]);

  useImperativeHandle(ref, () => ({
    fitBounds: (bounds, padding) => mapRef.current?.fitBounds(bounds, { padding: padding ?? 72, duration: 650, maxZoom: 10 }),
    flyTo: (coordinates, padding) => mapRef.current?.flyTo({ center: coordinates, zoom: 10, duration: 700, essential: true, ...(padding && { padding }) }),
    zoomIn: () => mapRef.current?.zoomIn({ duration: 200 }),
    zoomOut: () => mapRef.current?.zoomOut({ duration: 200 }),
    reset: () => mapRef.current?.easeTo({ center: [66.5, 40], zoom: 6.2, bearing: 0, pitch: 0, duration: 250 }),
  }), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      lifecycleRef.current.onError();
      return;
    }
    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: [66.5, 40],
      zoom: 6.2,
      attributionControl: false,
      maxZoom: 19,
    });
    const attribution = document.createElement("a");
    attribution.href = "https://openfreemap.org";
    attribution.target = "_blank";
    attribution.rel = "noreferrer";
    attribution.className = "absolute right-1 bottom-1 z-10 rounded bg-background/85 px-1.5 py-0.5 text-[9px] text-muted-foreground shadow-sm backdrop-blur-sm hover:text-foreground";
    attribution.textContent = "OpenFreeMap © OpenMapTiles Data from OpenStreetMap";
    container.appendChild(attribution);
    mapRef.current = map;
    map.on("click", (event) => {
      if ((event.originalEvent.target as HTMLElement).closest("button")) return;
      callbacksRef.current.onMapClick?.();
    });
    map.on("load", () => {
      setStyleRevision((revision) => revision + 1);
      lifecycleRef.current.onReady();
    });
    map.on("error", (event) => {
      if (!map.loaded() && event.error) lifecycleRef.current.onError();
    });
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      attribution.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || styleRevision === 0 || !network || !palette) return;
    const data = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "MultiLineString" as const,
        coordinates: network.features.map((feature) => feature.geometry.coordinates),
      },
    };
    for (const id of ["osm-rail-network-line", "osm-rail-network-casing"]) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    if (map.getSource("osm-rail-network")) map.removeSource("osm-rail-network");
    map.addSource("osm-rail-network", { type: "geojson", data });
    map.addLayer({ id: "osm-rail-network-casing", type: "line", source: "osm-rail-network", paint: { "line-color": palette.casing, "line-width": 7, "line-opacity": 0.8 } }, labelLayer(map));
    map.addLayer({ id: "osm-rail-network-line", type: "line", source: "osm-rail-network", paint: { "line-color": palette.rail, "line-width": 3, "line-opacity": 0.95 } }, labelLayer(map));
  }, [network, palette, styleRevision]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || styleRevision === 0 || !palette) return;
    for (const id of ["osm-selected-route-progress", "osm-selected-route-line"]) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    for (const id of ["osm-selected-route-progress", "osm-selected-route"]) {
      if (map.getSource(id)) map.removeSource(id);
    }
    if (!selectedRoute) return;
    map.addSource("osm-selected-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: selectedRoute.coordinates } } });
    map.addLayer({ id: "osm-selected-route-line", type: "line", source: "osm-selected-route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#64748b", "line-width": 8 } }, labelLayer(map));
    map.addSource("osm-selected-route-progress", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routeUntil(selectedRoute, selectedProgress) } } });
    map.addLayer({ id: "osm-selected-route-progress", type: "line", source: "osm-selected-route-progress", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": palette.accent, "line-width": 8 } }, labelLayer(map));
  }, [selectedRoute, palette, styleRevision]);

  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource("osm-selected-route-progress") as GeoJSONSource | undefined;
    if (!source || !selectedRoute) return;
    source.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routeUntil(selectedRoute, selectedProgress) } });
  }, [selectedProgress, selectedRoute]);

  // While one train is selected only its route stays visible; the rest of the network is hidden.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const id of ["osm-rail-network-line", "osm-rail-network-casing"]) {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", selectedRoute ? "none" : "visible");
    }
  }, [selectedRoute, network, palette, styleRevision]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    const markers: Marker[] = [];

    for (const station of stations) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "group relative flex size-6 items-end justify-center focus:outline-none";
      button.setAttribute("aria-label", stationLabel(station.name));
      const pin = document.createElement("span");
      pin.className = `block origin-bottom text-primary drop-shadow-sm transition-transform group-hover:scale-110 ${selectedStationId === station.id ? "scale-125" : ""}`;
      pin.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg>';
      const label = document.createElement("span");
      label.className = `map-label absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap ${selectedStationId === station.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"}`;
      label.textContent = station.name;
      button.append(pin, label);
      button.addEventListener("click", () => callbacksRef.current.onStationClick(station.id));
      markers.push(new maplibregl.Marker({ element: button, anchor: "bottom" }).setLngLat(station.coordinates).addTo(map));
    }

    for (const train of trains) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `train-marker train-marker-solid relative flex size-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md ${train.status === "running" ? "" : "opacity-55 grayscale"} ${selectedTrainId === train.number ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`;
      button.setAttribute("aria-label", trainLabel(train.number));
      button.innerHTML = `<span class="train-direction pointer-events-none absolute -inset-1 flex justify-center" style="transform:rotate(${train.bearing}deg)"><span class="size-2 rotate-45 rounded-[2px] bg-primary"></span></span><svg class="train-shape relative" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/></svg>`;
      button.addEventListener("click", () => callbacksRef.current.onTrainClick(train.number));
      markers.push(new maplibregl.Marker({ element: button, anchor: "center" }).setLngLat(train.coordinates).addTo(map));
    }

    markersRef.current = markers;
    return () => {
      markers.forEach((marker) => marker.remove());
      if (markersRef.current === markers) markersRef.current = [];
    };
  }, [stations, trains, selectedStationId, selectedTrainId, styleRevision, stationLabel, trainLabel]);

  return <div ref={containerRef} className="relative h-full w-full" aria-label="OpenStreetMap" />;
});
