import type { GeocodeResult } from "@/types";

const MAPBOX_GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export async function geocodeAddress(
  address: string,
  accessToken: string
): Promise<GeocodeResult | null> {
  const encoded = encodeURIComponent(address.trim());
  if (!encoded) return null;

  const url = `${MAPBOX_GEOCODE_URL}/${encoded}.json?access_token=${accessToken}&limit=1&types=address,place,poi`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Mapbox geocoding failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    features?: Array<{
      center: [number, number];
      place_name?: string;
      text?: string;
      context?: Array<{ id: string; text: string }>;
    }>;
  };

  const feature = data.features?.[0];
  if (!feature?.center) return null;

  const [lon, lat] = feature.center;
  const displayName = feature.place_name ?? `${lat}, ${lon}`;

  return {
    lat,
    lon,
    displayName,
    address: feature.place_name,
  };
}
