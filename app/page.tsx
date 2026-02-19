import Link from "next/link";
import Header from "@/components/Header";
import AddressSearch from "@/components/AddressSearch";
import SearchHistory from "@/components/SearchHistory";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Get insights for any address
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-base sm:text-lg">
            See walking score, driving score, and area type, plus a map of nearby amenities.
          </p>
          <div className="card p-6 sm:p-8 mb-10">
            <AddressSearch />
          </div>
          <SearchHistory />
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          Address Insights
        </Link>
        {" · "}
        Data from OpenStreetMap & Mapbox
      </footer>
    </div>
  );
}
