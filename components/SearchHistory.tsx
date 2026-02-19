"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSearchHistory } from "@/lib/history";

export default function SearchHistory() {
  const [history, setHistory] = useState<{ address: string; timestamp: number }[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="w-full max-w-xl mx-auto mt-10">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Recent searches
      </h2>
      <ul className="space-y-2">
        {history.map((entry) => (
          <li key={`${entry.address}-${entry.timestamp}`}>
            <Link
              href={`/insights?address=${encodeURIComponent(entry.address)}`}
              className="block px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors truncate"
            >
              {entry.address}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
