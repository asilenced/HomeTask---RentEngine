import AddressSearch from "@/components/AddressSearch";
import SearchHistory from "@/components/SearchHistory";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24">
      <div className="z-10 max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Address Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Enter an address to get insights about walkability, driveability, and more.
        </p>
        <AddressSearch />
        <SearchHistory />
      </div>
    </main>
  );
}
