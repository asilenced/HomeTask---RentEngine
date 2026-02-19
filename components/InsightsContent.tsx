"use client";

import { useEffect } from "react";
import Link from "next/link";
import MapView from "./MapView";
import { addToSearchHistory } from "@/lib/history";
import type { GeocodeResult } from "@/types";
import type { Amenity } from "@/types";
import type { UrbanSuburbanLabel } from "@/types";

interface InsightsContentProps {
  address: string;
  geocode: GeocodeResult;
  walkingScore: number;
  drivingScore: number;
  urbanSuburbanIndex: UrbanSuburbanLabel;
  walkingAmenities: Amenity[];
  drivingAmenities: Amenity[];
  amenitiesError?: string | null;
}

export default function InsightsContent({
  address,
  geocode,
  walkingScore,
  drivingScore,
  urbanSuburbanIndex,
  walkingAmenities,
  drivingAmenities,
  amenitiesError,
}: InsightsContentProps) {
  useEffect(() => {
    addToSearchHistory(address);
  }, [address]);

  const labelClass: Record<UrbanSuburbanLabel, string> = {
    urban: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    suburban: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    rural: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-block text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        ← Back to search
      </Link>

      {amenitiesError && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          {amenitiesError} Scores and map show no nearby amenities. Try again later.
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {geocode.displayName}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
        Coordinates: {geocode.lat.toFixed(5)}, {geocode.lon.toFixed(5)}
      </p>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Walking Score
          </h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {walkingScore}
            <span className="text-lg font-normal text-gray-500">/100</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {walkingAmenities.length} amenities within 500 m
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Driving Score
          </h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {drivingScore}
            <span className="text-lg font-normal text-gray-500">/100</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {drivingAmenities.length} amenities within 5 km
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Area Type
          </h2>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium capitalize ${labelClass[urbanSuburbanIndex]}`}
          >
            {urbanSuburbanIndex}
          </span>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Map & nearby amenities
        </h2>
        <MapView
          lat={geocode.lat}
          lon={geocode.lon}
          amenities={walkingAmenities}
          addressLabel={geocode.displayName}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Nearby amenities (within 500 m)
        </h2>
        {walkingAmenities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No amenities found in this area.</p>
        ) : (
          <ul className="space-y-2">
            {walkingAmenities.slice(0, 20).map((a) => (
              <li
                key={a.id}
                className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
              >
                <span className="font-medium text-gray-900 dark:text-white truncate pr-2">
                  {a.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
                  {a.type} · {a.distance} m
                </span>
              </li>
            ))}
          </ul>
        )}
        {walkingAmenities.length > 20 && (
          <p className="text-sm text-gray-500 mt-2">
            Showing 20 of {walkingAmenities.length} amenities.
          </p>
        )}
      </section>
    </main>
  );
}
