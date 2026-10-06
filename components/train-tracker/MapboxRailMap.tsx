"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import mapboxgl, { type GeoJSONSource, type Map as MapboxMap, type Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Coordinate, RailNetwork, RailRoute, Station } from "@/lib/train-data";

export interface MapTrain {
  number: string;
  status: "running" | "waiting" | "arrived";
  coordinates: Coordinate;
  bearing: number;
}

export interface MapboxRailMapRef {
  fitBounds: (bounds: [Coordinate, Coordinate]) => void;
  flyTo: (coordinates: Coordinate) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

interface MapboxRailMapProps {
  network: RailNetwork | null;
  stations: Station[];
  trains: MapTrain[];
  selectedRoute?: RailRoute;
  selectedProgress: number;
  selectedStationId: string | null;
  selectedTrainId: string | null;
  theme: "light" | "dark";
  palette: { accent: string; rail: string; casing: string } | null;
  onReady: () => void;
  onError: () => void;
  onStationClick: (id: string) => void;
  onTrainClick: (number: string) => void;
}

function routeUntil(route: RailRoute, progress: number): Coordinate[] {
  const target = Math.max(0, Math.min(1, progress)) * route.distance;
  const coordinates = [route.coordinates[0]];
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

function basemapConfig() {
  return {
    theme: "default",
    lightPreset: "day",
    showHdRoads: true,
    showPedestrianRoads: true,
    showPlaceLabels: true,
    showPointOfInterestLabels: true,
    showRoadLabels: true,
    showTransitLabels: true,
    show3dObjects: true,
    showLandmarkIcons: true,
    showLandmarkIconLabels: true,
    showAdminBoundaries: true,
    densityPointOfInterestLabels: 4,
    colorModePointOfInterestLabels: "default",
    colorWater: "#80c7ee",
    colorGreenspace: "#9fd39a",
    colorLand: "#f5efe2",
    colorCommercial: "#ead8de",
    colorEducation: "#dedcf0",
    colorMedical: "#f0d9dd",
    colorIndustrial: "#ded9d0",
    colorMotorways: "#e9793f",
    colorTrunks: "#edaa62",
    colorRoads: "#e2c594",
    colorBuildings: "#d8c9b5",
    colorPlaceLabels: "#213547",
    colorRoadLabels: "#425466",
    colorAdminBoundaries: "#8799a8",
  };
}

export const MapboxRailMap = forwardRef<MapboxRailMapRef, MapboxRailMapProps>(function MapboxRailMap({
  network, stations, trains, selectedRoute, selectedProgress, selectedStationId,
  selectedTrainId, theme, palette, onReady, onError, onStationClick, onTrainClick,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const callbacksRef = useRef({ onStationClick, onTrainClick });
  const lifecycleRef = useRef({ onReady, onError });
  const [styleRevision, setStyleRevision] = useState(0);

  useEffect(() => { callbacksRef.current = { onStationClick, onTrainClick }; }, [onStationClick, onTrainClick]);
  useEffect(() => { lifecycleRef.current = { onReady, onError }; }, [onReady, onError]);

  useImperativeHandle(ref, () => ({
    fitBounds: (bounds) => mapRef.current?.fitBounds(bounds, { padding: 72, duration: 650, maxZoom: 10 }),
    flyTo: (coordinates) => mapRef.current?.flyTo({ center: coordinates, zoom: 10, duration: 700, essential: true }),
    zoomIn: () => mapRef.current?.zoomIn({ duration: 200 }),
    zoomOut: () => mapRef.current?.zoomOut({ duration: 200 }),
    reset: () => mapRef.current?.easeTo({ center: [66.5, 40], zoom: 6.2, pitch: 18, bearing: 0, duration: 250 }),
  }), []);

  useEffect(() => {
    const container = containerRef.current;
    const token = document.querySelector<HTMLMetaElement>('meta[name="traintracker-mapbox-token"]')?.content;
    if (!container || !token) {
      lifecycleRef.current.onError();
      return;
    }

    const map = new mapboxgl.Map({
      accessToken: token,
      container,
      style: "mapbox://styles/mapbox/standard",
      config: { basemap: basemapConfig() },
      center: [66.5, 40],
      zoom: 6.2,
      pitch: 18,
      bearing: 0,
      antialias: true,
      attributionControl: true,
    });
    mapRef.current = map;
    map.on("load", () => {
      setStyleRevision((revision) => revision + 1);
      lifecycleRef.current.onReady();
    });
    map.on("style.load", () => setStyleRevision((revision) => revision + 1));
    map.on("error", (event) => {
      if (!map.loaded() && event.error) lifecycleRef.current.onError();
    });
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    for (const [property, value] of Object.entries(basemapConfig())) {
      map.setConfigProperty("basemap", property, value);
    }
  }, [theme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !network || !palette) return;
    const data = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "MultiLineString" as const,
        coordinates: network.features.map((feature) => feature.geometry.coordinates),
      },
    };
    for (const id of ["rail-network-line", "rail-network-casing"]) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    if (map.getSource("rail-network")) map.removeSource("rail-network");
    map.addSource("rail-network", { type: "geojson", data });
    map.addLayer({ id: "rail-network-casing", type: "line", source: "rail-network", slot: "middle", paint: { "line-color": "#dbe7e4", "line-width": 7, "line-opacity": 0.78 } });
    map.addLayer({ id: "rail-network-line", type: "line", source: "rail-network", slot: "middle", paint: { "line-color": "#0f766e", "line-width": 3, "line-opacity": 0.92, "line-emissive-strength": 0.15 } });
  }, [network, palette, theme, styleRevision]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !palette) return;
    for (const id of ["selected-route-progress", "selected-route-line"]) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    for (const id of ["selected-route-progress", "selected-route"]) {
      if (map.getSource(id)) map.removeSource(id);
    }
    if (!selectedRoute) return;
    map.addSource("selected-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: selectedRoute.coordinates } } });
    map.addLayer({ id: "selected-route-line", type: "line", source: "selected-route", slot: "top", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#64748b", "line-width": 6, "line-emissive-strength": 0.35 } });
    map.addSource("selected-route-progress", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routeUntil(selectedRoute, selectedProgress) } } });
    map.addLayer({ id: "selected-route-progress", type: "line", source: "selected-route-progress", slot: "top", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#059669", "line-width": 6, "line-emissive-strength": 0.8 } });
  }, [selectedRoute, palette, styleRevision]);

  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource("selected-route-progress") as GeoJSONSource | undefined;
    if (!source || !selectedRoute) return;
    source.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routeUntil(selectedRoute, selectedProgress) } });
  }, [selectedProgress, selectedRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    const markers: Marker[] = [];

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
      markers.push(new mapboxgl.Marker({ element: button, anchor: "center" }).setLngLat(station.coordinates).addTo(map));
    }

    for (const train of trains) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `train-marker flex size-10 items-center justify-center rounded-full ${train.status === "running" ? "" : "opacity-55 grayscale"} ${selectedTrainId === train.number ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`;
      button.setAttribute("aria-label", `${train.number} poyezdi`);
      if (train.status !== "running") button.style.color = "var(--muted-foreground)";
      button.innerHTML = `<svg aria-hidden="true" viewBox="0 0 32 44" width="24" height="33" style="transform:rotate(${train.bearing}deg)"><path d="M7 36V14C7 7 11 2 16 1c5 1 9 6 9 13v22q0 5-4 5H11q-4 0-4-5Z" fill="currentColor" stroke="var(--rail-casing)" stroke-width="2"/><path d="M11 13h10v6H11z" fill="var(--rail-casing)"/></svg>`;
      button.addEventListener("click", () => callbacksRef.current.onTrainClick(train.number));
      markers.push(new mapboxgl.Marker({ element: button, anchor: "center" }).setLngLat(train.coordinates).addTo(map));
    }

    markersRef.current = markers;
    return () => {
      markers.forEach((marker) => marker.remove());
      if (markersRef.current === markers) markersRef.current = [];
    };
  }, [stations, trains, selectedStationId, selectedTrainId, styleRevision]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Mapbox temiryo‘l xaritasi" />;
});
