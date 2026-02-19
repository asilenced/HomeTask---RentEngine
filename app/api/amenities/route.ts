import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyAmenities } from "@/lib/overpass";
import { WALKING_RADIUS_M } from "@/lib/constants";

const MAX_RADIUS_M = 10000;

export async function GET(request: NextRequest) {
  const latParam = request.nextUrl.searchParams.get("lat");
  const lonParam = request.nextUrl.searchParams.get("lon");
  const radiusParam = request.nextUrl.searchParams.get("radius");

  const lat = latParam ? parseFloat(latParam) : NaN;
  const lon = lonParam ? parseFloat(lonParam) : NaN;

  if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: "Valid 'lat' and 'lon' query parameters required" },
      { status: 400 }
    );
  }

  let radiusM = radiusParam ? parseInt(radiusParam, 10) : WALKING_RADIUS_M;
  if (Number.isNaN(radiusM) || radiusM < 100) radiusM = WALKING_RADIUS_M;
  if (radiusM > MAX_RADIUS_M) radiusM = MAX_RADIUS_M;

  try {
    const amenities = await fetchNearbyAmenities(lat, lon, radiusM);
    return NextResponse.json({
      amenities,
      radius: radiusM,
    });
  } catch (e) {
    console.error("Amenities fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch amenities" },
      { status: 502 }
    );
  }
}
