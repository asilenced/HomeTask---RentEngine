"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToSearchHistory } from "@/lib/history";

export default function AddressSearch() {
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    addToSearchHistory(trimmed);
    router.push(`/insights?address=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter a street address..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          maxLength={500}
          disabled={isSubmitting}
          aria-label="Street address"
        />
        <button
          type="submit"
          disabled={!address.trim() || isSubmitting}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Loading…" : "Get insights"}
        </button>
      </div>
    </form>
  );
}
