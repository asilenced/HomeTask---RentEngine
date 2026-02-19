"use client";

import { useEffect } from "react";
import MapView from "./MapView";
import { addToSearchHistory } from "@/lib/history";
import type { GeocodeResult } from "@/types";
import type { Amenity } from "@/types";
import type { UrbanSuburbanLabel } from "@/types";
import Header from "./Header";
import {
  MapPinIcon,
  PersonWalkingIcon,
  CarIcon,
  BuildingsIcon,
  HomeIcon,
  TreeIcon,
  MapIcon,
  WarningIcon,
  PlaceIcon,
} from "./Icons";

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

const areaTypeIcons: Record<UrbanSuburbanLabel, React.ComponentType<{ className?: string }>> = {
  urban: BuildingsIcon,
  suburban: HomeIcon,
  rural: TreeIcon,
};

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
    urban: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    suburban: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    rural: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  };

  const AreaIcon = areaTypeIcons[urbanSuburbanIndex];

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBack />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        {amenitiesError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
            <WarningIcon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
            <span>
              {amenitiesError} Scores and map show no nearby amenities. Try again later.
            </span>
          </div>
        )}

        <div className="mb-8 flex items-start gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden>
            <MapPinIcon className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
              {geocode.displayName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {geocode.lat.toFixed(5)}, {geocode.lon.toFixed(5)}
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" aria-hidden>
                <PersonWalkingIcon className="w-5 h-5" />
              </span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Walking Score
              </p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
              {walkingScore}
              <span className="text-lg font-normal text-gray-500 ml-0.5">/100</span>
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {walkingAmenities.length} amenities within 500 m
            </p>
          </div>
          <div className="card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400" aria-hidden>
                <CarIcon className="w-5 h-5" />
              </span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Driving Score
              </p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
              {drivingScore}
              <span className="text-lg font-normal text-gray-500 ml-0.5">/100</span>
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {drivingAmenities.length} amenities within 5 km
            </p>
          </div>
          <div className="card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" aria-hidden>
                <AreaIcon className="w-5 h-5" />
              </span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Area Type
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 mt-2 w-fit px-3 py-1.5 rounded-full text-sm font-medium capitalize ${labelClass[urbanSuburbanIndex]}`}
            >
              <AreaIcon className="w-4 h-4" aria-hidden />
              {urbanSuburbanIndex}
            </span>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
            <MapIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden />
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
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
            <PlaceIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden />
            Nearby amenities (within 500 m)
          </h2>
          {walkingAmenities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4">No amenities found in this area.</p>
          ) : (
            <ul className="card divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
              {walkingAmenities.slice(0, 20).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0" aria-hidden>
                    <PlaceIcon className="w-4 h-4" />
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white truncate flex-1 min-w-0">
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Showing 20 of {walkingAmenities.length} amenities.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
