import { redirect } from "next/navigation";
import { geocodeAddress } from "@/lib/mapbox";
import { fetchNearbyAmenities } from "@/lib/overpass";
import { computeScores } from "@/lib/scores";
import { WALKING_RADIUS_M, DRIVING_RADIUS_M } from "@/lib/constants";
import InsightsContent from "@/components/InsightsContent";

interface PageProps {
  searchParams: { address?: string | string[] };
}

export default async function InsightsPage({ searchParams }: PageProps) {
  const raw = searchParams.address;
  const address = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (!address || typeof address !== "string" || !address.trim()) {
    redirect("/");
  }

  const trimmed = address.trim();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <p className="text-red-600">Mapbox token not configured. Set NEXT_PUBLIC_MAPBOX_TOKEN.</p>
        <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to search
        </a>
      </main>
    );
  }

  const geocode = await geocodeAddress(trimmed, token);
  if (!geocode) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <p className="text-red-600">Address not found. Try a different search.</p>
        <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to search
        </a>
      </main>
    );
  }

  let walkingAmenities: Awaited<ReturnType<typeof fetchNearbyAmenities>> = [];
  let drivingAmenities: Awaited<ReturnType<typeof fetchNearbyAmenities>> = [];
  let amenitiesError: string | null = null;

  try {
    [walkingAmenities, drivingAmenities] = await Promise.all([
      fetchNearbyAmenities(geocode.lat, geocode.lon, WALKING_RADIUS_M),
      fetchNearbyAmenities(geocode.lat, geocode.lon, DRIVING_RADIUS_M),
    ]);
  } catch (e) {
    amenitiesError = e instanceof Error ? e.message : "Failed to load nearby amenities.";
  }

  const scores = computeScores(walkingAmenities, drivingAmenities);

  return (
    <InsightsContent
      address={trimmed}
      geocode={geocode}
      walkingScore={scores.walkingScore}
      drivingScore={scores.drivingScore}
      urbanSuburbanIndex={scores.urbanSuburbanIndex}
      walkingAmenities={walkingAmenities}
      drivingAmenities={drivingAmenities}
      amenitiesError={amenitiesError}
    />
  );
}
