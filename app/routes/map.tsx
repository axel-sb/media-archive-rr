import { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Map View | Personal Media Archive" },
    { name: "description", content: "View your personal media collection on a map" },
  ];
};

export default function Map() {
  // This is a placeholder for actual map implementation
  // We would need to add a mapping library like Leaflet or Google Maps

  useEffect(() => {
    // Placeholder for map initialization
    const initMap = () => {
      console.log("Map would be initialized here with actual data");
    };

    initMap();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Media Map</h2>

          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option>All Media Types</option>
              <option>Images Only</option>
              <option>Videos Only</option>
            </select>

            <button className="px-3 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Filter
            </button>
          </div>
        </div>

        {/* Placeholder for the actual map */}
        <div className="h-[600px] bg-gray-100 rounded-md flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-lg text-gray-600">Map View</p>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
              This would display a map with markers for all geotagged media in your collection.
              You could click on markers to view the media.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          <div className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
            <div className="aspect-square bg-gray-200 rounded-md overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Media 1
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1 truncate">Düsseldorf, Germany</p>
          </div>
          <div className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
            <div className="aspect-square bg-gray-200 rounded-md overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Media 2
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1 truncate">Berlin, Germany</p>
          </div>
          <div className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
            <div className="aspect-square bg-gray-200 rounded-md overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Media 3
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1 truncate">Munich, Germany</p>
          </div>
          <div className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
            <div className="aspect-square bg-gray-200 rounded-md overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Media 4
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1 truncate">Hamburg, Germany</p>
          </div>
        </div>
      </div>
    </div>
  );
}