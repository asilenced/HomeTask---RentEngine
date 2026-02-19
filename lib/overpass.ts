import type { Amenity } from "@/types";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchNearbyAmenities(
  lat: number,
  lon: number,
  radiusMeters: number
): Promise<Amenity[]> {
  const radius = Math.round(radiusMeters);
  const query = `
    [out:json][timeout:15];
    (
      node(around:${radius},${lat},${lon})["amenity"];
      node(around:${radius},${lat},${lon})["shop"];
    );
    out body;
  `;

  let lastError: Error | null = null;
  for (const baseUrl of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(baseUrl, {
          method: "POST",
          body: query,
          headers: { "Content-Type": "text/plain" },
        });

        if (!res.ok) {
          if (res.status === 504 || res.status === 503) {
            lastError = new Error(`Overpass API failed: ${res.status} (timeout or overloaded)`);
            if (attempt < MAX_RETRIES) {
              await sleep(RETRY_DELAY_MS);
              continue;
            }
            throw lastError;
          }
          throw new Error(`Overpass API failed: ${res.status}`);
        }

        const data = (await res.json()) as {
          elements?: Array<{
            id: number;
            lat: number;
            lon: number;
            tags?: { name?: string; amenity?: string; shop?: string };
          }>;
        };

        const elements = data.elements ?? [];
        const amenities: Amenity[] = [];

        for (const el of elements) {
          const type = el.tags?.amenity ?? el.tags?.shop ?? "unknown";
          const name = el.tags?.name ?? type;
          const distance = haversineMeters(lat, lon, el.lat, el.lon);
          amenities.push({
            id: `node/${el.id}`,
            name,
            type,
            lat: el.lat,
            lon: el.lon,
            distance: Math.round(distance),
          });
        }

        return amenities;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
        }
      }
    }
  }

  throw lastError ?? new Error("Overpass API failed");
}

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
