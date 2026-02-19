"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Amenity } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function escapeHtml(text: string): string {
  if (typeof document === "undefined") return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

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

    map.on("load", () => {
      const attr = map.getContainer().querySelector(".mapboxgl-ctrl-attrib");
      if (attr?.parentNode) attr.parentNode.removeChild(attr);
      const bottomRight = map.getContainer().querySelector(".mapboxgl-ctrl-bottom-right");
      if (bottomRight) {
        const customAttr = document.createElement("div");
        customAttr.className = "mapboxgl-ctrl mapboxgl-ctrl-attrib";
        customAttr.innerHTML = '<a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer">© Mapbox</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>';
        customAttr.style.fontSize = "10px";
        customAttr.style.maxWidth = "200px";
        bottomRight.appendChild(customAttr);
      }
    });

    const safeAddress = escapeHtml(addressLabel ?? "Address");
    new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat([lon, lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${safeAddress}</strong>`))
      .addTo(map);

    amenities.slice(0, 50).forEach((a) => {
      const safeName = escapeHtml(a.name);
      const safeType = escapeHtml(a.type);
      new mapboxgl.Marker({ color: "#16a34a" })
        .setLngLat([a.lon, a.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${safeName}</strong><br/>${safeType}`))
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
