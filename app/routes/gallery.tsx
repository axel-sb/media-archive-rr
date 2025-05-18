import {
    LinksFunction,
    LoaderFunctionArgs,
    MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import galleryStyles from 'app/routes/css/gallery.css?url'
import { PrismaClient } from "../../prisma/generated"

export const meta: MetaFunction = () => {
	return [
		{ title: 'Gallery | Personal Media Archive' },
		{ name: 'description', content: 'Browse your personal media collection' },
	]
}

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: galleryStyles },
]

const prisma = new PrismaClient()

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const photos = await prisma.photos.findMany({
		select: {
			uuid: true,
			original_filename: true,
			title: true,
			path: true,
			path_edited: true,
			has_raw: true,
			description: true,
			height: true,
			width: true,
			date: true,
			favorite: true,
			latitude: true,
			longitude: true,
			portrait: true,
			hdr: true,
			panorama: true,
			faces: true,
			keywords: true,
			labels: true,
			photo_albums: true,
			photo_persons: true,
			place_addresses: true,
			place_names: true,
			places: true,
		},
		skip: 3,
		take: 25,
	})

	// console.log("🟢 mediaFiles: ", mediaFiles)
	console.log('🟣 photos[0]: ', photos[0])
	return { photos }
}

export default function Gallery() {
	const { photos } = useLoaderData<typeof loader>()
	/* {
        photos.map(file => (
            <li key={file.uuid}>{file.original_filename}</li>
        )
        )
    } */
	return (
		<div
			className="mx-auto max-w-7xl min-w-fit bg-gray-900"
			style={{
				backgroundImage:
					'linear-gradient(45deg, #0005,#0004,#0009, #0006), linear-gradient(105deg, #0005,#0004,#0006, #0008)',
			}}
		>
			<div className="mb-6 rounded-lg bg-[#a6a195bb] p-6 shadow-md backdrop-blur-md backdrop-brightness-[0.25] backdrop-sepia">
				<div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
					<h2 className="text-2xl font-bold text-gray-300">Media Gallery</h2>

					<div className="flex gap-2">
						<select className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500">
							<option>Sort by Date (Newest)</option>
							<option>Sort by Date (Oldest)</option>
							<option>Sort by Name (A-Z)</option>
							<option>Sort by Name (Z-A)</option>
						</select>

						<button className="rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
							Filter
						</button>
					</div>
				</div>

				<div className="grid w-full grid-cols-2 gap-4 text-base sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 lg:gap-8">
					{photos.map((photo) => (
						<div key={photo.uuid} className="group relative">
							<div className="aspect-square overflow-hidden rounded-md bg-gray-200 transition-opacity hover:opacity-80">
								<div className="flex h-full w-full items-center justify-center text-gray-400">
									<img
										className="max-w-[134%] object-cover"
										src={photo.path || ''}
										alt={photo.title || 'Photo'}
									/>
								</div>
							</div>
							<div className="t-2 absolute z-10 hidden w-[clamp(100%,40vw,30rem)] -translate-y-full rounded-md bg-gray-900 p-2 pt-0 text-balance text-gray-500/80 group-hover:block">
								<p className="w-[clamp(100%,40vw,30rem)] text-sm font-medium text-gray-400">
									{photo.description || ''}
								</p>
							</div>
							<div className="bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 flex h-full w-full items-start justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100">
								<button className="relative top-24 rounded-full bg-white p-2 shadow-md hover:bg-gray-100">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-gray-700"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								</button>
							</div>
						</div>
					))}
				</div>

				<div className="mt-8 flex justify-center">
					<nav className="flex items-center gap-1">
						<button className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100">
							&laquo; Prev
						</button>
						<button className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1 text-white">
							1
						</button>
						<button className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100">
							2
						</button>
						<button className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100">
							3
						</button>
						<span className="px-2">...</span>
						<button className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100">
							10
						</button>
						<button className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100">
							Next &raquo;
						</button>
					</nav>
				</div>
			</div>
		</div>
	)
}
