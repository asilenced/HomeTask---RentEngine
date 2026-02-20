"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addToSearchHistory } from "@/lib/history";
import { SearchIcon } from "./Icons";
import LoadingSpinner from "./LoadingSpinner";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface Suggestion {
  place_name: string;
}

export default function AddressSearch() {
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/geocode/suggest?q=${encodeURIComponent(query)}`);
      const data = (await res.json()) as { suggestions?: Suggestion[] };
      setSuggestions(data.suggestions ?? []);
      setHighlightedIndex(0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = address.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(trimmed);
      setIsDropdownOpen(true);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [address, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    setIsDropdownOpen(false);
    setSuggestions([]);
    addToSearchHistory(trimmed);
    router.push(`/insights?address=${encodeURIComponent(trimmed)}`);
  }

  function selectSuggestion(placeName: string) {
    setAddress(placeName);
    setSuggestions([]);
    setIsDropdownOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isDropdownOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIndex].place_name);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setSuggestions([]);
    }
  }

  const showDropdown = isDropdownOpen && suggestions.length > 0 && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="address-input" className="sr-only">
        Street address
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div ref={containerRef} className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" aria-hidden>
            <SearchIcon className="w-5 h-5" />
          </span>
          <input
            id="address-input"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
            placeholder="e.g. 123 Main St, New York"
            className={`w-full pl-10 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm ${isLoadingSuggestions ? "pr-20" : "pr-4"}`}
            maxLength={500}
            disabled={isSubmitting}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="address-suggestions"
            aria-activedescendant={showDropdown && highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
          />
          {isLoadingSuggestions && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-500 dark:text-gray-400" aria-hidden>
              <LoadingSpinner size="sm" />
              <span className="text-xs">Loading</span>
            </span>
          )}
          {showDropdown && (
            <ul
              id="address-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1 z-20 max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.place_name}-${i}`}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={i === highlightedIndex}
                  className={`cursor-pointer px-4 py-3 text-sm truncate ${
                    i === highlightedIndex
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(s.place_name);
                  }}
                >
                  {s.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          disabled={!address.trim() || isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium shadow-sm hover:shadow transition-colors disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="border-t-white" />
              <span>Loading</span>
            </>
          ) : (
            <>
              <SearchIcon className="w-5 h-5" aria-hidden />
              Get insights
            </>
          )}
        </button>
      </div>
    </form>
  );
}
