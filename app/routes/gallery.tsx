import { type MetaFunction, NavLink, useLoaderData } from 'react-router'
import { PrismaClient } from '../../prisma/generated'
// import './css/gallery.css'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Gallery | Personal Media Archive' },
		{ name: 'description', content: 'Browse your personal media collection' },
	]
}

const prisma = new PrismaClient()

{
	/*// $ MARK:Loader */
}

export const loader = async () => {
	const photos = await prisma.photos.findMany({ skip: 0, take: 50 })

	return { photos }
}

export default function Gallery() {
	const { photos: photos } = useLoaderData<typeof loader>()

	return (
		<div className="mx-auto max-w-7xl">
			<div className="rounded-xs py-6 shadow-md ">
				<div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
					<h2 className="text-2xl font-bold text-gray-300">Media Gallery</h2>

					<div className="flex gap-2">
						<select className="rounded-md border border-gray-700 px-3 py-2 focus:border-gray-500 focus:ring-gray-500">
							<option>Sort by Date (Newest)</option>
							<option>Sort by Date (Oldest)</option>
							<option>Sort by Name (A-Z)</option>
							<option>Sort by Name (Z-A)</option>
						</select>

						<button className="rounded-md bg-gray-600 px-3 py-2 font-medium text-yellow-100"></button>
					</div>
				</div>

				<div className="grid w-full grid-cols-6 gap-2 text-base sm:grid-cols-9 md:grid-cols-12 md:gap-2 lg:grid-cols-12 lg:gap-2">
					{photos.map((photo, index) => (
						<div key={photo.uuid} className="group relative">
							<NavLink
								className={({ isActive, isPending }) =>
									isActive ? 'active' : isPending ? 'pending' : '' + 'w-full'
								}
								to={`../${photo.uuid}`}
								viewTransition
							>
								<div className="aspect-square overflow-hidden rounded-md bg-gray-200 transition-opacity hover:opacity-80">
									<div className="flex h-full w-full items-center justify-center text-gray-400">
										{photo.path && photo.path[index] && (
											// eslint-disable-next-line jsx-a11y/alt-text
											<img
												src={photo.path}
												className="w-full h-full object-cover"
											/>
										)}
									</div>
								</div>
								<div className="t-2 absolute z-10 hidden w-[clamp(350px,80vw,30rem)] -translate-y-full rounded-md bg-gray-900 p-2 pt-0 text-balance text-gray-500/80 group-hover:block">
									<p className="w-[clamp(100%,40vw,30rem)] text-sm font-medium text-gray-400">
										{photo.description || ''}
									</p>
								</div>
								<div className="bg-opacity-0 group-hover:bg-opacity-20  flex h-full w-full items-start justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100">
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
							</NavLink>
						</div>
					))}
				</div>

				<div className="mt-8 flex justify-center">
					<nav className="flex items-center gap-1">
						<button className="rounded-md border border-gray-700 px-3 py-1 hover:bg-gray-100">
							&laquo; Prev
						</button>
						<button className="rounded-md border border-gray-600 bg-gray-600 px-3 py-1 text-white">
							1
						</button>
						<button className="rounded-md border border-gray-700 px-3 py-1 hover:bg-gray-100">
							2
						</button>
						<button className="rounded-md border border-gray-700 px-3 py-1 hover:bg-gray-100">
							3
						</button>
						<span className="px-2">...</span>
						<button className="rounded-md border border-gray-700 px-3 py-1 hover:bg-gray-100">
							10
						</button>
						<button className="rounded-md border border-gray-700 px-3 py-1 hover:bg-gray-100">
							Next &raquo;
						</button>
					</nav>
				</div>
			</div>
		</div>
	)
}
