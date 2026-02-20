"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import InsightsContent from "./InsightsContent";
import { getCachedInsights, setCachedInsights, type CachedInsights } from "@/lib/insightsCache";
import Header from "./Header";
import LoadingSpinner from "./LoadingSpinner";

function InsightsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("address");
  const address = typeof raw === "string" ? raw.trim() : "";

  const [data, setData] = useState<CachedInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      router.replace("/");
      return;
    }

    const cached = getCachedInsights(address);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setError(null);
    fetch(`/api/insights?address=${encodeURIComponent(address)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Address not found");
          throw new Error(res.status === 500 ? "Server error" : "Failed to load insights");
        }
        return res.json();
      })
      .then((json: CachedInsights) => {
        setData(json);
        setCachedInsights(address, json);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load insights");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address, router]);

  if (!address) {
    return null;
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBack />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading insights</p>
        </main>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBack />
        <main className="flex-1 p-8 max-w-4xl mx-auto">
          <p className="text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to search
          </Link>
        </main>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <InsightsContent
      address={data.address}
      geocode={data.geocode}
      walkingScore={data.walkingScore}
      drivingScore={data.drivingScore}
      urbanSuburbanIndex={data.urbanSuburbanIndex}
      walkingAmenities={data.walkingAmenities}
      drivingAmenities={data.drivingAmenities}
      amenitiesError={data.amenitiesError}
    />
  );
}

export default function InsightsPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Header showBack />
          <main className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading</p>
          </main>
        </div>
      }
    >
      <InsightsPageInner />
    </Suspense>
  );
}
