/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	type LoaderFunctionArgs,
	type MetaFunction,
	NavLink,
	useLoaderData,
	useNavigate,
	useNavigation,
} from 'react-router'
import { PrismaClient } from '../../prisma/generated'
import { OptimizedImage } from '../components/OptimizedImage'
import { GallerySkeleton } from '../components/SkeletonLoader'
import { getByMultipleDetails } from './resources/prisma-queries.server'

import './css/gallery.css'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Gallery | Personal Media Archive' },
		{ name: 'description', content: 'Browse your personal media collection' },
	]
}

type RootContextType = {
	showSearch: boolean
	handleToggleSearch: () => void
}

const prisma = new PrismaClient()
const ITEMS_PER_PAGE = 5 // previusly reduced from 50 for better performance

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const q = url.searchParams.get('q') ?? ''
	const qStartDate = url.searchParams.get('qStartDate') ?? ''
	const qEndDate = url.searchParams.get('qEndDate') ?? ''
	const qFavoriteStr = url.searchParams.get('favorite')
	const qFavorite = qFavoriteStr === '1' ? 1 : 0

	const page = parseInt(url.searchParams.get('page') || '1', 10)
	const skip = (page - 1) * ITEMS_PER_PAGE

	const totalCount = await prisma.photos.count()
	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

	const photos = await getByMultipleDetails({
		q,
		qStartDate,
		qEndDate,
		qFavorite,
		skip,
		take: ITEMS_PER_PAGE,
		orderBy: { date: 'desc' },
	})

	// console.dir(photos, { depth: 1, colors: true })
	console.log('photos: ', photos.length, photos[0])
	console.log('q: ', q)

	return {
		photos,
		pagination: {
			currentPage: page,
			totalPages,
			totalItems: totalCount,
		},
		searchParams: {
			q,
			qStartDate,
			qEndDate,
			qFavorite: qFavoriteStr || '',
		},
	}
}

export default function Gallery() {
	const { photos, pagination, searchParams } = useLoaderData<typeof loader>()
	const navigation = useNavigation()
	const navigate = useNavigate()

	const isLoading = navigation.state === 'loading'
	const currentPage = pagination.currentPage

	// Generate page numbers to display
	const pageNumbers: any[] = []
	const maxPageButtons = 5
	const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
	const endPage = Math.min(
		pagination.totalPages,
		startPage + maxPageButtons - 1,
	)

	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > pagination.totalPages) return

		// Preserve all current search parameters
		const url = new URL(window.location.href)
		url.searchParams.set('page', newPage.toString())

		navigate(`${url.pathname}${url.search}`)
	}

	return (
		<div className="flex justify-center items-center mx-auto max-w-full border-0 !box-shadow-none">
			<div className="flex flex-col justify-between items-center rounded-xs py-6 shadow-md">
				<div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
					<h2 className="hidden text-2xl font-bold text-gray-300">
						Media Gallery
					</h2>

					{!isLoading && (
						<div className="inline-block">
							<p className="text-sm text-gray-400">
								Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
								{Math.min(currentPage * ITEMS_PER_PAGE, pagination.totalItems)}{' '}
								of{' '}
							</p>
							<p className="text-sm text-gray-400">
								{pagination.totalItems} total items
							</p>
						</div>
					)}
				</div>

				{isLoading ? (
					<GallerySkeleton count={1} />
				) : (
					/* MARK:photo grid
					 */
					<div className="grid w-full justify-center items-center max-h-[calc(100vh-8.5rem)] overflow-auto p-4 sm:p-8 gap-2 md:gap-3 lg:gap-4 [grid-template-columns:repeat(auto-fit,minmax(120px,300px))] md:[grid-template-columns:repeat(auto-fit,minmax(240px,300px))] lg:[grid-template-columns:repeat(auto-fit,300px)] text-base">
						{photos.map((photo) => (
							<div key={photo.uuid} className="group relative">
								<NavLink
									className={({ isActive, isPending }) =>
										isActive ? 'active' : isPending ? 'pending' : '' + ' w-full'
									}
									to={`../${photo.uuid}?${new URLSearchParams({
										from: 'gallery',
										page: pagination.currentPage.toString(),
										...(searchParams.q && { q: searchParams.q }),
										...(searchParams.qStartDate && {
											qStartDate: searchParams.qStartDate,
										}),
										...(searchParams.qEndDate && {
											qEndDate: searchParams.qEndDate,
										}),
										...(searchParams.qFavorite && {
											qFavorite: searchParams.qFavorite,
										}),
									})}`}
									viewTransition
									onClick={() => {
										console.log('🔗 Gallery NavLink clicked with params:', {
											from: 'gallery',
											page: pagination.currentPage.toString(),
											q: searchParams.q,
											qStartDate: searchParams.qStartDate,
											qEndDate: searchParams.qEndDate,
											qFavorite: searchParams.qFavorite,
										})
									}}
								>
									<div className="aspect-square overflow-hidden rounded-md md:rounded-lg bg-linear-65 from-gray-500 via-50% via-gray-950 to-gray-500 transition-opacity hover:opacity-80">
										{photo.path ? (
											<OptimizedImage
												src={photo.path!}
												editedSrc={photo.path_edited}
												thumbnailSrc={photo.thumbnail_path}
												alt={photo.title || photo.original_filename || 'Photo'}
												className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-101"
												width={300}
												quality={75}
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-gray-400">
												No image
											</div>
										)}
									</div>
								</NavLink>
							</div>
						))}
					</div>
				)}

				{!isLoading && pagination.totalPages > 1 && (
					<div className="mt-8 flex justify-center">
						<nav
							className="flex w-fit p-4 sm:p-8 items-center justify-between gap-1 flex-wrap"
							aria-label="Pagination"
						>
							<button
								className="hidden sm:block rounded-md border border-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								aria-label="Previous page"
							>
								&laquo; Prev
							</button>

							{startPage > 1 && (
								<>
									<button
										className="rounded-md border border-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-700"
										onClick={() => handlePageChange(1)}
									>
										1
									</button>
									{startPage > 2 && (
										<span className="px-2 text-gray-500">...</span>
									)}
								</>
							)}

							{pageNumbers.map((page) => (
								<button
									key={page}
									className={`rounded-md border px-3 py-1 ${
										page === currentPage
											? 'border-gray-600 bg-gray-600 text-white'
											: 'border-gray-700 text-gray-300 hover:bg-gray-700'
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
										<span className="px-2 text-gray-500">...</span>
									)}
									<button
										className="rounded-md border border-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-700"
										onClick={() => handlePageChange(pagination.totalPages)}
									>
										{pagination.totalPages}
									</button>
								</>
							)}

							<button
								className="hidden sm:block rounded-md border border-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === pagination.totalPages}
								aria-label="Next page"
							>
								Next &raquo;
							</button>
							{/* Moved to bottom for mobile */}
							<div className="w-screen flex justify-between mt-9">
								<button
									className="sm:hidden rounded-md border border-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
									aria-label="Previous page"
								>
									&laquo; Prev
								</button>
								<button
									className="sm:hidden rounded-md border border-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === pagination.totalPages}
									aria-label="Next page"
								>
									Next &raquo;
								</button>
							</div>
						</nav>
					</div>
				)}
			</div>
			{/* // MARK: SearchTerm 🛶🫆👷🏻🌫️
			 */}
			<div className="fixed bottom-0 flex max-w-96 h-12 sm:w-full px-2 bg-gray-800  justify-center items-center rounded-lg z-50">
				<p className="inline-flex justify-start sm:justify-center items-center bg-blue-400 font-medium text-sm sm:text-base border border-gray-400 rounded">
					<span className="px-2 sm:px-3 bg-blue-850 rounded-l">
						search term:{' '}
					</span>
					<span className="inline-block flex-1 h-full mr-auto px-2 sm:px-3 bg-gray-400 text-gray-900 rounded-r">
						{searchParams.q || ''}
					</span>
				</p>
			</div>
		</div>
	)
}
