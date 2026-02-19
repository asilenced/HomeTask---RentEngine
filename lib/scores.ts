import type { Amenity } from "@/types";
import type { UrbanSuburbanLabel } from "@/types";
import {
  WALKING_SCORE_MAX_COUNT,
  DRIVING_SCORE_MAX_COUNT,
  URBAN_WALKING_THRESHOLD,
  SUBURBAN_WALKING_THRESHOLD,
} from "./constants";

/**
 * Walking Score (0–100): based on count of amenities within walking radius.
 * Simple heuristic: min(100, (count / maxCount) * 100).
 */
export function walkingScore(amenityCount: number): number {
  if (amenityCount <= 0) return 0;
  const raw = (amenityCount / WALKING_SCORE_MAX_COUNT) * 100;
  return Math.round(Math.min(100, raw));
}

/**
 * Driving Score (0–100): based on count of amenities within driving radius.
 * Same formula with a higher cap.
 */
export function drivingScore(amenityCount: number): number {
  if (amenityCount <= 0) return 0;
  const raw = (amenityCount / DRIVING_SCORE_MAX_COUNT) * 100;
  return Math.round(Math.min(100, raw));
}

/**
 * Urban/Suburban Index: single label from density heuristics.
 * - urban: many amenities in walking range (high density)
 * - suburban: moderate walking amenities
 * - rural: few amenities in both ranges
 */
export function urbanSuburbanIndex(
  walkingCount: number,
  drivingCount: number
): UrbanSuburbanLabel {
  if (walkingCount >= URBAN_WALKING_THRESHOLD) return "urban";
  if (walkingCount >= SUBURBAN_WALKING_THRESHOLD) return "suburban";
  return "rural";
}

/**
 * Compute all scores from walking and driving amenity lists.
 */
export function computeScores(
  walkingAmenities: Amenity[],
  drivingAmenities: Amenity[]
): {
  walkingScore: number;
  drivingScore: number;
  urbanSuburbanIndex: UrbanSuburbanLabel;
} {
  const walkingCount = walkingAmenities.length;
  const drivingCount = drivingAmenities.length;
  return {
    walkingScore: walkingScore(walkingCount),
    drivingScore: drivingScore(drivingCount),
    urbanSuburbanIndex: urbanSuburbanIndex(walkingCount, drivingCount),
  };
}
