const STORAGE_KEY = "address-insights-history";
const MAX_ENTRIES = 10;

export interface HistoryEntry {
  address: string;
  timestamp: number;
}

export function getSearchHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(address: string): void {
  if (typeof window === "undefined") return;
  const trimmed = address.trim();
  if (!trimmed) return;
  const entries = getSearchHistory();
  const normalized = trimmed.toLowerCase();
  const filtered = entries.filter(
    (e) => e.address.trim().toLowerCase() !== normalized
  );
  const updated: HistoryEntry[] = [
    { address: trimmed, timestamp: Date.now() },
    ...filtered,
  ].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore quota or other errors
  }
}
