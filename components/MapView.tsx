"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Amenity } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapViewProps {
  lat: number;
  lon: number;
  amenities: Amenity[];
  addressLabel?: string;
}

export default function MapView({ lat, lon, amenities, addressLabel }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lon, lat],
      zoom: 14,
    });

    new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat([lon, lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${addressLabel ?? "Address"}</strong>`))
      .addTo(map);

    amenities.slice(0, 50).forEach((a) => {
      new mapboxgl.Marker({ color: "#16a34a" })
        .setLngLat([a.lon, a.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${a.name}</strong><br/>${a.type}`))
        .addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [lat, lon, addressLabel, amenities]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 min-h-[320px]">
        Map unavailable: Mapbox token not set
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
      style={{ minHeight: 320 }}
    />
  );
}
