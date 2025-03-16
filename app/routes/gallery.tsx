import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Gallery | Personal Media Archive" },
    { name: "description", content: "Browse your personal media collection" },
  ];
};

export default function Gallery() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Media Gallery</h2>

          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option>Sort by Date (Newest)</option>
              <option>Sort by Date (Oldest)</option>
              <option>Sort by Name (A-Z)</option>
              <option>Sort by Name (Z-A)</option>
            </select>

            <button className="px-3 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* This will be populated with actual data */}
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className="group relative">
              <div className="aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 transition-opacity">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Media {index + 1}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-800 truncate">Image_{index + 1}.jpg</p>
                <p className="text-xs text-gray-500">Jan {index + 1}, 2024</p>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-1">
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
              &laquo; Prev
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded-md">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">3</button>
            <span className="px-2">...</span>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">10</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
              Next &raquo;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}