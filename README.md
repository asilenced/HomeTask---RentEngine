# Address Insights

Enter a street address and get walking score, driving score, area type (urban/suburban/rural), and a map of nearby amenities.

**Live app (Vercel):** https://home-task-rent-engine.vercel.app/

---

## What I Built vs What AI Generated

**I implemented:**

- **Calculation logic:** Walking and driving scores (count-based formulas), urban/suburban/rural index, and all thresholds (radii, score caps, area-type boundaries).
- **API integration:** Mapbox Geocoding (address to coordinates) and Overpass/OpenStreetMap (nearby amenities in two radii). Server-side calls with retries and a fallback Overpass endpoint on 504/503.
- **Architecture and configuration:** App structure, routing (home and insights via query param), API routes, and page setup.
- **Constants and heuristics:** Final choice and review of 500 m / 5 km radii, score caps (40 for walking, 150 for driving), and urban (≥15), suburban (≥5), rural thresholds. AI proposed initial values; I reviewed and updated them.
- **UI/UX design:** Layout, component structure, search flow, insights layout (scores, map, amenity list), and search history.
- **Error handling and security:** Graceful fallback when amenities fail; custom map attribution so the Mapbox token is not exposed in the "Improve this map" link.
- **Testing:** I reviewed and refined the unit tests (boundaries, edge cases) and added, edited, or removed cases as needed.

**I received AI assistance with:** Initial project setup (Next.js, TypeScript, Tailwind), code comments, UI polish (icons, background, spacing), drafting the unit tests for the score functions, proposing constant values (I reviewed and updated them), and refining this README for clarity and tone.

---

## Approach

1. **Input:** User enters an address on the home page. Recent searches (from `localStorage`) are shown and can be clicked.
2. **Geocoding:** Mapbox Geocoding API returns coordinates and a display name. Invalid or missing address shows a clear error and a link back to search.
3. **Amenities:** Overpass API returns OSM nodes (amenity and shop) within 500 m (walking) and 5 km (driving). On 504/503, the server retries and can use a second Overpass endpoint. If amenities still fail, the insights page renders with zero scores and a notice.
4. **Scores:** Walking score = min(100, round((count/40)×100)). Driving score = min(100, round((count/150)×100)). Area type: urban if walking count ≥ 15, suburban if ≥ 5, else rural.
5. **Shareable URL:** The insights view is keyed by `?address=...`. Sharing that URL shows the same results. No server-side session.
6. **History:** The last 10 addresses are stored in `localStorage` and listed on the home page. Opening a shared link adds that address to local history.

---

## Assumptions and Design Decisions

- **Heuristic scores:** Scores are not calibrated to external walkability data. The goal is a simple, explainable method: count in radius, linear scale, cap at 100.
- **Overpass for amenities:** Free and no API key. Mapbox is used only for geocoding and the map. Overpass can be slow or return 504; retries and a second endpoint improve reliability.
- **Server-side geocode and Overpass:** Both run from the Next.js insights page (server component). The Mapbox token is not needed in the client for the initial data fetch. Overpass is server-side to avoid CORS and to centralize retry/fallback logic.
- **Shareable URL = query param only:** No backend session. The address in the URL is the single source of truth for the insights view.
- **No env files in repo:** `.env.local` and env examples are gitignored. Setup is documented here instead.
