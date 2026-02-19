"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToSearchHistory } from "@/lib/history";
import { SearchIcon } from "./Icons";

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
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="address-input" className="sr-only">
        Street address
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" aria-hidden>
            <SearchIcon className="w-5 h-5" />
          </span>
          <input
            id="address-input"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123 Main St, New York"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm"
            maxLength={500}
            disabled={isSubmitting}
            autoComplete="street-address"
          />
        </div>
        <button
          type="submit"
          disabled={!address.trim() || isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium shadow-sm hover:shadow transition-colors disabled:opacity-60"
        >
          <SearchIcon className="w-5 h-5" aria-hidden />
          {isSubmitting ? "Loading…" : "Get insights"}
        </button>
      </div>
    </form>
  );
}
