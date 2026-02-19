"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSearchHistory } from "@/lib/history";
import { ClockIcon, ExternalLinkIcon } from "./Icons";

export default function SearchHistory() {
  const [history, setHistory] = useState<{ address: string; timestamp: number }[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="w-full max-w-xl mx-auto text-left">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        <ClockIcon className="w-4 h-4" aria-hidden />
        Recent searches
      </h2>
      <ul className="space-y-2">
        {history.map((entry) => (
          <li key={`${entry.address}-${entry.timestamp}`}>
            <Link
              href={`/insights?address=${encodeURIComponent(entry.address)}`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors truncate group"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" aria-hidden>
                <ExternalLinkIcon className="w-4 h-4" />
              </span>
              <span className="truncate flex-1">{entry.address}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
