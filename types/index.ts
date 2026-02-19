export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  address?: string;
}

export interface Amenity {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  distance: number; // meters
}

export interface AmenitiesResponse {
  amenities: Amenity[];
  radius: number; // meters
}

export type UrbanSuburbanLabel = "urban" | "suburban" | "rural";

export interface ScoreResult {
  walkingScore: number;
  drivingScore: number;
  urbanSuburbanIndex: UrbanSuburbanLabel;
}
