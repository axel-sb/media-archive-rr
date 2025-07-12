import { type MetaFunction } from 'react-router'
import type { Route } from './+types/favorites'
import { getByMultipleDetails } from './resources/prisma-queries.server'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Favorites | Personal Media Archive' },
		{ name: 'description', content: 'Browse your favorite media items' },
	]
}

export const loader = async () => {
	// Get only favorite photos (favorite = 1)
	const data = await getByMultipleDetails('', '1970-01-01', new Date().toISOString().slice(0, 10), 1)
	return { data }
}

export default function Favorites({ loaderData }: Route.ComponentProps) {
	const { data } = loaderData

	return (
		<div className="mx-auto max-w-7xl">
			<div className="rounded-xs py-6 shadow-md">
				<div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
					<h2 className="text-2xl font-bold text-gray-300">Favorite Media</h2>
					<p className="text-gray-500">{data?.length || 0} items</p>
				</div>

				{data && data.length > 0 ? (
					<div className="grid w-full grid-cols-6 gap-2 text-base sm:grid-cols-9 md:grid-cols-12 md:gap-2 lg:grid-cols-12 lg:gap-2">
						{data.map((photo) => (
							<div key={photo.uuid} className="group relative">
								<a
									href={`/${photo.uuid}`}
									className="block w-full"
								>
									<div className="aspect-square overflow-hidden rounded-md bg-gray-200 transition-opacity hover:opacity-80">
										<div className="flex h-full w-full items-center justify-center text-gray-400">
											{photo.path && (
												<img
													src={photo.path}
													alt={photo.title || 'Favorite media item'}
													className="w-full h-full object-cover"
												/>
											)}
										</div>
									</div>
									<div className="absolute z-10 hidden w-[clamp(350px,80vw,30rem)] -translate-y-full rounded-md bg-gray-900 p-2 pt-0 text-balance text-gray-500/80 group-hover:block">
										<p className="w-[clamp(100%,40vw,30rem)] text-sm font-medium text-gray-400">
											{photo.description || photo.title || 'No description'}
										</p>
									</div>
								</a>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<div className="text-gray-400 mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-16 w-16 mx-auto"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
						</div>
						<p className="text-lg text-gray-600">No favorites yet</p>
						<p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
							Mark photos as favorites to see them here.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
