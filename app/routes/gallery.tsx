import { type LoaderFunctionArgs, type MetaFunction, NavLink, useLoaderData, useNavigate, useNavigation, } from 'react-router'
import { PrismaClient } from '../../prisma/generated'
import { GallerySkeleton } from '../components/SkeletonLoader'
// import './css/gallery.css'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Gallery | Personal Media Archive' },
		{ name: 'description', content: 'Browse your personal media collection' },
	]
}

const prisma = new PrismaClient()
const ITEMS_PER_PAGE = 30

export const loader = async ({ request }: LoaderFunctionArgs ) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get('page') || '1', 10)
	const skip = (page - 1) * ITEMS_PER_PAGE

	// Get total count for pagination
	const totalCount = await prisma.photos.count()
	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

	const photos = await prisma.photos.findMany({
		skip,
		take: ITEMS_PER_PAGE,
		orderBy: { date: 'desc' },
	})

	return {
		photos,
		pagination: {
			currentPage: page,
			totalPages,
			totalItems: totalCount,
		},
	}
}

export default function Gallery() {
	const { photos, pagination } = useLoaderData<typeof loader>()
	const navigation = useNavigation()
	const navigate = useNavigate()

	const isLoading = navigation.state === 'loading'
	const currentPage = pagination.currentPage

	// Generate page numbers to display
	const pageNumbers = []
	const maxPageButtons = 5
	const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
	const endPage = Math.min(pagination.totalPages, startPage + maxPageButtons - 1)

	for (let i = startPage; i <= endPage; i++) {
		pageNumbers.push(i)
	}
	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > pagination.totalPages) return
		navigate(`?page=${newPage}`)
	}

	return (
		<div className="mx-auto grow">
			<div className="rounded-xs py-6 shadow-md ">
				<div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
					{!isLoading && (
						<p className="text-sm text-gray-400">
							Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
							{Math.min(currentPage * ITEMS_PER_PAGE, pagination.totalItems)} of{' '}
							{pagination.totalItems} items
						</p>
					)}
				</div>

				{isLoading ? (
					<GallerySkeleton count={30} />
				) : (
					<div className="grid w-full grid-cols-5 gap-1 text-base lg:gap-2">
						{photos.map((photo) => (
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
											{photo.path && (
												<img
													src={photo.path}
													alt={photo.title || photo.description || 'Media item'}
													className="w-full h-full object-cover"
												/>
											)}
											{photo.title && (
												<p className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-white text-sm truncate">
													{photo.title}
												</p>
											)}
										</div>
									</div>
								</NavLink>
							</div>
						))}
					</div>
				)}

				{!isLoading && pagination.totalPages > 1 && (
					<div className="mt-8 flex justify-center">
						<nav className="flex items-center gap-1" aria-label="Pagination">
							<button
								className="rounded-md border border-gray-700 px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white/50"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								aria-label="Previous page"
							>
								&laquo; Prev
							</button>

							{startPage > 1 && (
								<>
									<button
										className="rounded-md border border-gray-700 px-3 py-1 hover:bg-gray-100"
										onClick={() => handlePageChange(1)}
									>
										1
									</button>
									{startPage > 2 && <span className="px-2">...</span>}
								</>
							)}

							{pageNumbers.map((page) => (
								<button
									key={page}
									className={`rounded-md border px-3 py-1 ${
										page === currentPage
											? 'border-gray-600 bg-gray-600 text-white'
											: 'border-gray-700 hover:bg-gray-100  text-white/50'
									}`}
									onClick={() => handlePageChange(page)}
									aria-current={page === currentPage ? 'page' : undefined}
								>
									{page}
								</button>
							))}

							{endPage < pagination.totalPages && (
								<>
									{endPage < pagination.totalPages - 1 && (
										<span className="px-2">...</span>
									)}
									<button
										className="rounded-md border border-gray-700 px-3 py-1 hover:bg-gray-100  text-white/50"
										onClick={() => handlePageChange(pagination.totalPages)}
									>
										{pagination.totalPages}
									</button>
								</>
							)}

							<button
								className="rounded-md border border-gray-700 px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed  text-white/50"
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === pagination.totalPages}
							>
								Next &raquo;
							</button>
						</nav>
					</div>
				)}
			</div>
		</div>
	)
}
