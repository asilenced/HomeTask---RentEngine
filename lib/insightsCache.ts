import type { GeocodeResult } from "@/types";
import type { Amenity } from "@/types";
import type { UrbanSuburbanLabel } from "@/types";

const CACHE_KEY_PREFIX = "insights:v1:";
const MAX_CACHE_ENTRIES = 20;

export interface CachedInsights {
  address: string;
  geocode: GeocodeResult;
  walkingScore: number;
  drivingScore: number;
  urbanSuburbanIndex: UrbanSuburbanLabel;
  walkingAmenities: Amenity[];
  drivingAmenities: Amenity[];
  amenitiesError: string | null;
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

function cacheKey(address: string): string {
  return CACHE_KEY_PREFIX + normalizeAddress(address);
}

export function getCachedInsights(address: string): CachedInsights | null {
  if (typeof window === "undefined") return null;
  try {
    const key = cacheKey(address);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CachedInsights;
  } catch {
    return null;
  }
}

export function setCachedInsights(address: string, data: CachedInsights): void {
  if (typeof window === "undefined") return;
  try {
    const key = cacheKey(address);
    localStorage.setItem(key, JSON.stringify(data));
    pruneCache();
  } catch {
    // Ignore quota or parse errors
  }
}

function pruneCache(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_KEY_PREFIX)) keys.push(k);
    }
    if (keys.length > MAX_CACHE_ENTRIES) {
      keys.sort();
      for (let i = 0; i < keys.length - MAX_CACHE_ENTRIES; i++) {
        localStorage.removeItem(keys[i]);
      }
    }
  } catch {
    // Ignore
  }
}
