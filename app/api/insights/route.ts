import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/mapbox";
import { fetchNearbyAmenities } from "@/lib/overpass";
import { computeScores } from "@/lib/scores";
import { WALKING_RADIUS_M, DRIVING_RADIUS_M } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || typeof address !== "string" || !address.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid 'address' query parameter" },
      { status: 400 }
    );
  }

  const trimmed = address.trim();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Mapbox token not configured" },
      { status: 500 }
    );
  }

  const geocode = await geocodeAddress(trimmed, token);
  if (!geocode) {
    return NextResponse.json(
      { error: "Address not found" },
      { status: 404 }
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

  return NextResponse.json({
    address: trimmed,
    geocode,
    walkingScore: scores.walkingScore,
    drivingScore: scores.drivingScore,
    urbanSuburbanIndex: scores.urbanSuburbanIndex,
    walkingAmenities,
    drivingAmenities,
    amenitiesError,
  });
}
