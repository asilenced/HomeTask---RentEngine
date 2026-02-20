import { NextRequest, NextResponse } from "next/server";
import { suggestAddress } from "@/lib/mapbox";

const MAX_QUERY_LENGTH = 200;
const MIN_QUERY_LENGTH = 2;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || typeof q !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'q' query parameter" },
      { status: 400 }
    );
  }

  const trimmed = q.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ suggestions: [] });
  }
  if (trimmed.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: "Query too long" },
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
    const results = await suggestAddress(trimmed, token, 5);
    return NextResponse.json({
      suggestions: results.map((r) => ({ place_name: r.place_name })),
    });
  } catch (e) {
    console.error("Suggest error:", e);
    return NextResponse.json(
      { error: "Suggestion failed" },
      { status: 502 }
    );
  }
}
