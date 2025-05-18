import { faces, keywords, labels, photo_albums, photo_persons, place_addresses, place_names, places } from "@prisma/client";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPhoto } from './resources/prisma-queries.server.tsx';

export const meta: MetaFunction = () => {
  return [
    { title: "Media Detail | Personal Media Archive" },
    { name: "description", content: "View details of a media item from your collection" },
  ];
};

type PhotoDetailData = {
  uuid: String;
  original_filename: String;
  date: String;
  title: String;
  path: String;
  path_edited: String;
  has_raw: Boolean;
  height: Boolean;
  width: Number;
  favorite: Boolean;
  hidden: Boolean;
  latitude: Number;
  longitude: Number;
  portrait: Boolean;
  hdr: Boolean;
  panorama: Boolean;
  description: String;
  faces: faces[];
  keywords: keywords[];
  labels: labels[];
  photo_albums: photo_albums[];
  photo_persons: photo_persons[];
  place_addresses: place_addresses;
  place_names: place_names[];
  places: places;
};

// This would be replaced with actual data loading from Prisma
export const loader = async ({ params }: LoaderFunctionArgs) => {
  // Placeholder data - in a real app, this would fetch from the database
  const photo = await getPhoto(photos.uuid)
  if (!photo) {
		throw new Response(
			"'getPhoto(uuid)': This Artwork (ID) was not found on the Server",
			{
				status: 404,
			},
		)
	};
};

export default function MediaDetail() {
  const photos = useLoaderData<typeof loader>();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* Media display */}
          <div className="md:w-2/3 bg-black flex items-center justify-center">
            <div className="aspect-video w-full h-full bg-gray-900 flex items-center justify-center text-gray-400">
              {/* This would be replaced with the actual image or video */}
              <div className="text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4">Media {photos.uuid}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="md:w-1/3 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">{photos.filename}</h2>
              <div className="text-sm text-gray-500">ID: {photos.uuid}</div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">{photos.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="text-gray-800">{new Date(photos.date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Taken</h3>
                <p className="text-gray-800">{new Date(photos.takenAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">File Type</h3>
                <p className="text-gray-800">{photos.fileType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Device</h3>
                <p className="text-gray-800">{photos.deviceType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Views</h3>
                <p className="text-gray-800">{photos.views}</p>
              </div>
            </div>

            {/* Map preview if coordinates exist */}
            {photos.latitude && photos.longitude && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                  {/* Would be replaced with an actual map */}
                  <div className="text-center">
                    <p>{photos.latitude.toFixed(4)}, {photos.longitude.toFixed(4)}</p>
                    <p className="text-xs">Altitude: {photos.altitude}m</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {photos.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>

        <div className="flex gap-2">
          <a
            href={photos.googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Original
          </a>
          <button
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}