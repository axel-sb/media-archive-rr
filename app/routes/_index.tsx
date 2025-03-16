import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Personal Media Archive" },
    { name: "description", content: "Search and browse your personal media collection" },
  ];
};

export default function Index() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Search Your Media</h2>

        <form className="space-y-4">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
              Keyword Search
            </label>
            <input
              type="text"
              id="keyword"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search descriptions, locations, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 mb-1">
              Media Type
            </label>
            <select
              id="mediaType"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Media Types</option>
              <option value="image">Images Only</option>
              <option value="video">Videos Only</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Media</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* This will be populated with actual data */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 transition-opacity">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Media {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/gallery"
            className="inline-block px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            View All Media
          </a>
        </div>
      </div>
    </div>
  );
}
