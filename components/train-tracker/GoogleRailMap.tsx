"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Coordinate, RailNetwork, RailRoute, Station } from "@/lib/train-data";

export interface MapTrain {
  number: string;
  status: "running" | "waiting" | "arrived";
  coordinates: Coordinate;
  bearing: number;
}

export interface GoogleRailMapRef {
  fitBounds: (bounds: [Coordinate, Coordinate]) => void;
  flyTo: (coordinates: Coordinate) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

interface GoogleRailMapProps {
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

type LatLngLiteral = { lat: number; lng: number };
type GoogleMap = {
  fitBounds: (bounds: object, padding?: number) => void;
  panTo: (position: LatLngLiteral) => void;
  setCenter: (position: LatLngLiteral) => void;
  getZoom: () => number | undefined;
  setZoom: (zoom: number) => void;
};
type GoogleData = {
  addGeoJson: (data: object) => void;
  setStyle: (style: Record<string, unknown>) => void;
  setMap: (map: GoogleMap | null) => void;
};
type GooglePolyline = { setMap: (map: GoogleMap | null) => void };
type GoogleOverlay = {
  setMap: (map: GoogleMap | null) => void;
  getPanes: () => { overlayMouseTarget: Element } | null;
  getProjection: () => { fromLatLngToDivPixel: (position: object) => { x: number; y: number } | null };
};
type GoogleMapsApi = {
  maps: {
    Map: new (container: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    Data: new (options?: Record<string, unknown>) => GoogleData;
    Polyline: new (options: Record<string, unknown>) => GooglePolyline;
    LatLng: new (lat: number, lng: number) => object;
    LatLngBounds: new (southWest: LatLngLiteral, northEast: LatLngLiteral) => object;
    OverlayView: new () => GoogleOverlay;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
  }
}

let googleMapsPromise: Promise<GoogleMapsApi> | null = null;

function loadGoogleMaps(key: string): Promise<GoogleMapsApi> {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (googleMapsPromise) return googleMapsPromise;
  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("#google-maps-api");
    const script = existing ?? document.createElement("script");
    const complete = () => window.google?.maps ? resolve(window.google) : reject(new Error("Google Maps API unavailable"));
    script.addEventListener("load", complete, { once: true });
    script.addEventListener("error", () => reject(new Error("Google Maps API failed to load")), { once: true });
    if (!existing) {
      script.id = "google-maps-api";
      script.async = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
      document.head.appendChild(script);
    }
  });
  return googleMapsPromise;
}

function toLatLng(coordinates: Coordinate): LatLngLiteral {
  return { lng: coordinates[0], lat: coordinates[1] };
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

export const GoogleRailMap = forwardRef<GoogleRailMapRef, GoogleRailMapProps>(function GoogleRailMap({
  network, stations, trains, selectedRoute, selectedProgress, selectedStationId,
  selectedTrainId, palette, onReady, onError, onStationClick, onTrainClick,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const apiRef = useRef<GoogleMapsApi | null>(null);
  const networkLayersRef = useRef<GoogleData[]>([]);
  const routeLayersRef = useRef<GooglePolyline[]>([]);
  const markersRef = useRef<GoogleOverlay[]>([]);
  const callbacksRef = useRef({ onStationClick, onTrainClick });
  const lifecycleRef = useRef({ onReady, onError });
  const [readyRevision, setReadyRevision] = useState(0);

  useEffect(() => { callbacksRef.current = { onStationClick, onTrainClick }; }, [onStationClick, onTrainClick]);
  useEffect(() => { lifecycleRef.current = { onReady, onError }; }, [onReady, onError]);

  useImperativeHandle(ref, () => ({
    fitBounds: ([southWest, northEast]) => {
      const api = apiRef.current;
      if (api) mapRef.current?.fitBounds(new api.maps.LatLngBounds(toLatLng(southWest), toLatLng(northEast)), 72);
    },
    flyTo: (coordinates) => {
      mapRef.current?.panTo(toLatLng(coordinates));
      mapRef.current?.setZoom(10);
    },
    zoomIn: () => {
      const map = mapRef.current;
      if (map) map.setZoom((map.getZoom() ?? 6.2) + 1);
    },
    zoomOut: () => {
      const map = mapRef.current;
      if (map) map.setZoom((map.getZoom() ?? 6.2) - 1);
    },
    reset: () => {
      mapRef.current?.setCenter({ lng: 66.5, lat: 40 });
      mapRef.current?.setZoom(6.2);
    },
  }), []);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    const key = document.querySelector<HTMLMetaElement>('meta[name="traintracker-google-maps-key"]')?.content;
    if (!container || !key) {
      lifecycleRef.current.onError();
      return;
    }
    loadGoogleMaps(key).then((api) => {
      if (cancelled) return;
      apiRef.current = api;
      mapRef.current = new api.maps.Map(container, {
        center: { lng: 66.5, lat: 40 },
        zoom: 6.2,
        mapTypeId: "roadmap",
        disableDefaultUI: true,
        clickableIcons: true,
        gestureHandling: "greedy",
        streetViewControl: false,
      });
      setReadyRevision((revision) => revision + 1);
      lifecycleRef.current.onReady();
    }).catch(() => {
      if (!cancelled) lifecycleRef.current.onError();
    });
    return () => {
      cancelled = true;
      networkLayersRef.current.forEach((layer) => layer.setMap(null));
      routeLayersRef.current.forEach((layer) => layer.setMap(null));
      markersRef.current.forEach((marker) => marker.setMap(null));
      mapRef.current = null;
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api) return;
    networkLayersRef.current.forEach((layer) => layer.setMap(null));
    networkLayersRef.current = [];
    if (!network || !palette) return;
    const layers = [
      { color: palette.casing, weight: 7, opacity: 0.8 },
      { color: palette.rail, weight: 3, opacity: 0.95 },
    ].map(({ color, weight, opacity }) => {
      const layer = new api.maps.Data();
      layer.addGeoJson(network as object);
      layer.setStyle({ strokeColor: color, strokeWeight: weight, strokeOpacity: opacity });
      layer.setMap(map);
      return layer;
    });
    networkLayersRef.current = layers;
  }, [network, palette, readyRevision]);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api) return;
    routeLayersRef.current.forEach((layer) => layer.setMap(null));
    routeLayersRef.current = [];
    if (!selectedRoute || !palette) return;
    const route = new api.maps.Polyline({ map, path: selectedRoute.coordinates.map(toLatLng), strokeColor: "#64748b", strokeWeight: 6, strokeOpacity: 1, zIndex: 10 });
    const progress = new api.maps.Polyline({ map, path: routeUntil(selectedRoute, selectedProgress).map(toLatLng), strokeColor: palette.accent, strokeWeight: 6, strokeOpacity: 1, zIndex: 11 });
    routeLayersRef.current = [route, progress];
  }, [selectedRoute, selectedProgress, palette, readyRevision]);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api) return;
    const maps = api.maps;
    markersRef.current.forEach((marker) => marker.setMap(null));
    const markers: GoogleOverlay[] = [];

    class HtmlMarker extends api.maps.OverlayView {
      private readonly position: object;
      private readonly element: HTMLElement;

      constructor(coordinates: Coordinate, element: HTMLElement) {
        super();
        this.position = new maps.LatLng(coordinates[1], coordinates[0]);
        this.element = element;
      }

      onAdd() {
        this.getPanes()?.overlayMouseTarget.appendChild(this.element);
      }

      draw() {
        const point = this.getProjection().fromLatLngToDivPixel(this.position);
        if (!point) return;
        this.element.style.position = "absolute";
        this.element.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`;
      }

      onRemove() {
        this.element.remove();
      }
    }

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
      const marker = new HtmlMarker(station.coordinates, button);
      marker.setMap(map);
      markers.push(marker);
    }

    for (const train of trains) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `train-marker flex size-10 items-center justify-center rounded-full ${train.status === "running" ? "" : "opacity-55 grayscale"} ${selectedTrainId === train.number ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`;
      button.setAttribute("aria-label", `${train.number} poyezdi`);
      if (train.status !== "running") button.style.color = "var(--muted-foreground)";
      button.innerHTML = `<svg aria-hidden="true" viewBox="0 0 32 44" width="24" height="33" style="transform:rotate(${train.bearing}deg)"><path d="M7 36V14C7 7 11 2 16 1c5 1 9 6 9 13v22q0 5-4 5H11q-4 0-4-5Z" fill="currentColor" stroke="var(--rail-casing)" stroke-width="2"/><path d="M11 13h10v6H11z" fill="var(--rail-casing)"/></svg>`;
      button.addEventListener("click", () => callbacksRef.current.onTrainClick(train.number));
      const marker = new HtmlMarker(train.coordinates, button);
      marker.setMap(map);
      markers.push(marker);
    }

    markersRef.current = markers;
    return () => {
      markers.forEach((marker) => marker.setMap(null));
      if (markersRef.current === markers) markersRef.current = [];
    };
  }, [stations, trains, selectedStationId, selectedTrainId, readyRevision]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Google temiryo‘l xaritasi" />;
});
