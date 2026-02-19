import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/mapbox";

const MAX_ADDRESS_LENGTH = 500;

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || typeof address !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'address' query parameter" },
      { status: 400 }
    );
  }

  const trimmed = address.trim();
  if (trimmed.length > MAX_ADDRESS_LENGTH) {
    return NextResponse.json(
      { error: "Address too long" },
      { status: 400 }
    );
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Mapbox token not configured" },
      { status: 500 }
    );
  }

  try {
    const result = await geocodeAddress(trimmed, token);
    if (!result) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error("Geocode error:", e);
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 502 }
    );
  }
}
