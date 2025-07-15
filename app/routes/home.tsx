import { useEffect, useState } from 'react'
import {
    Form,
    type LoaderFunctionArgs,
    useOutletContext
} from 'react-router'
import type { Route } from './+types/home'
import './css/home.css'
import { getByMultipleDetails } from './resources/prisma-queries.server'

export function meta() {
	return [
		{ title: '* Personal Media Archive' },
		{
			name: 'description',
			content: 'Search and browse your personal media collection',
		},
	]
}

type RootContextType = {
	showSearch: boolean
	handleToggleSearch: () => void
}

{
	/*/// MARK:Loader  🟡
	 */
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const q = url.searchParams.get('q') ?? ''
	const qStartDate = url.searchParams.get('qStartDate') ?? ''
	const qEndDate = url.searchParams.get('qEndDate') ?? ''
	const qFavoriteStr = url.searchParams.get('favorite')
	const qFavorite = qFavoriteStr === '1' ? 1 : 0

	const data = await getByMultipleDetails(q, qStartDate, qEndDate, qFavorite)

	console.dir(data, { depth: 5, colors: true })

	return { data, q, qStartDate, qEndDate, qFavorite }
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { data, q } = loaderData
	const { showSearch } = useOutletContext<RootContextType>()
	const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

	// Check if we're in a loading state (for form submissions)
	const isSearching = false // We'll implement this properly later
	// const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

	const today = new Date()
	const todayFormatted = today.toISOString().slice(0, 10) // "2025-06-26"

	// const navigation = useNavigation()
	// console.log(" navigation.state, navigation.formData", navigation.state, navigation.formData)
	// const [show, setShow] = useState(false)
	// const handleToggle = useCallback(() => setShow((show: unknown) => !show), [])

	const handlePhotoClick = (photoUuid: string, event: React.MouseEvent) => {
		event.preventDefault()
		setSelectedPhoto(photoUuid)
	}

	const handleCloseModal = () => {
		setSelectedPhoto(null)
	}

	const handleModalBackdropClick = (event: React.MouseEvent) => {
		if (event.target === event.currentTarget) {
			handleCloseModal()
		}
	}

	// Handle Escape key to close modal
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && selectedPhoto) {
				handleCloseModal()
			}
		}

		if (selectedPhoto) {
			document.addEventListener('keydown', handleKeyDown)
			return () => document.removeEventListener('keydown', handleKeyDown)
		}
	}, [selectedPhoto])

	return (
		<div className="relative">
			<div className="size-full mx-auto pt-0 sm:p-14 max-w-4xl rounded-lg shadow-md">
				<Form
					className={`max-w-sm mx-auto ${showSearch ? 'opacity-100 block' : 'opacity-0 hidden'}`}
				>
					<div className="hidden justify-end">
						<div className="hidden">
							<label
								htmlFor="mediaType"
								className="collapse mt-6 mb-1 block w-32 text-sm font-medium text-gray-400 hover:visible"
							>
								Media Type
							</label>
							<select
								id="mediaType"
								className="mt-2 w-20 appearance-none rounded-md my-2 px-4 font-medium border-1 border-gray-700 bg-gray-800 text-gray-400 hover:focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none focus:border-blue-500"
							>
								<option value="">All</option>
								<option value="image">Images</option>
								<option value="video">Videos</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="favorite"
								className="mt-2 mb-4 w-14 h-10 appearance-none rounded-sm  my-4 px-4 py-2 font-medium border-1 border-gray-700 bg-gray-800 text-gray-400 hover:focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none focus:border-[#a1a1a1]  checked:border-gray-950 checked:border-2 checked:opacity-100"
							>
								♥️
							</label>
							<input
								type="checkbox"
								name="favorite"
								id="favorite"
								value="1"
								defaultChecked={false}
								className="invisible mt-4 mb-6"
							/>
						</div>
					</div>

					<div className="space-y-2 relative">
						<label
							htmlFor="searchParams"
							className="mb-1 block text-sm font-medium text-gray-500"
						>
							Search Term
						</label>
						<input
							type="text"
							id="searchParams"
							name="q"
							className="w-full mt-2 mb-4 pl-8 py-2 font-medium rounded-md bg-transparent appearance-none border-1 border-gray-700 text-gray-400 hover:focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:outline-none focus:border-[#a1a1a1]  transition-colors duration-300"
							placeholder="Search image descriptions, locations, etc."
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#99a1af"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="absolute left-2.5 top-11.5 h-4 w-4 text-muted-foreground text-muted-foreground"
						>
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<div>
							<label
								htmlFor="startDate"
								className="mb-1 block text-sm font-medium text-gray-400"
							>
								Start Date
							</label>
							<input
								type="date"
								id="startDate"
								name="qStartDate"
								defaultValue="1970-01-01"
								className="mt-2 w-full appearance-none rounded-md my-4 px-4 py-2 font-medium border-1 border-gray-700 bg-transparent text-gray-400 hover:focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none focus:border-[#a1a1a1]"
							/>
						</div>

						<div>
							<label
								htmlFor="endDate"
								className="mb-1 block text-sm font-medium text-gray-600"
							>
								End Date
							</label>
							<input
								type="date"
								id="endDate"
								name="qEndDate"
								defaultValue={todayFormatted}
								className="mt-2 w-full appearance-none rounded-md my-4 px-4 py-2 font-medium border-1 border-gray-700 bg-transparent text-gray-400 hover:focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none focus:border-[#a1a1a1]"
							/>
						</div>
					</div>
					<div className="w-full my-6 flex justify-end">
						<button
							type="submit"
							className="mt-2 w-24 appearance-none rounded-md my-4 px-4 py-2 font-medium border-1 border-gray-700 bg-transparent text-gray-400 hover:focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
						>
							Search
						</button>
					</div>
				</Form>

				{/* <img
					src="images/Buzzard-looking-at-you-too.jpeg"
					className="w-full mx-auto"
				/> */}
			</div>
			<div className="mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-full  bg-black">
				<div className="flex w-full h-12 mb-4 bg-black justify-between self-baseline border border-gray-950 rounded-md">
					<p className="inline-flex w-full justify-center items-center font-medium text-base text-gray-600">
						search term:{' '}
						<span className="inline-block h-3 mx-3 grow border border-transparent border-b-gray-700 border-b-2 border-dashed">
							{' '}
						</span>{' '}
						<span className="absolute bottom-0 translate-y-24 inline-block shrink pr-2 text-gray-500 pl-1">
							{q}
						</span>
					</p>
				</div>

				{/* //// MARK:IMGs _________________________________________🎞️
				 */}
				{isSearching ? (
					// Loading skeleton for search results
					<div className="grid w-full pb-7 mx-auto justify-center-safe grid-cols-6 gap-1 text-base sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-18">
						{Array.from({ length: 20 }).map((_, index) => (
							<div key={index} className="aspect-square">
								<div className="w-full h-full animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md" />
							</div>
						))}
					</div>
				) : (
					<div className="grid w-full pb-7 mx-auto justify-center-safe grid-cols-6 gap-1 text-base sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-18">
						{data?.map((photo) => (
							<button
								key={photo.uuid}
								className="relative cursor-pointer w-full h-full bg-transparent border-none p-0"
								onClick={(e) => handlePhotoClick(photo.uuid, e)}
								aria-label={`View ${photo.title || photo.description || 'media item'}`}
							>
								<div className="grid aspect-square place-content-center place-items-center rounded-xs transition-opacity hover:opacity-80">
									{photo?.path && (
										<img
											src={`${photo.path}`}
											alt={photo.title || photo.description || 'Media item'}
											className="h-full w-full object-contain"
										/>
									)}

									<p className="absolute top-4 left-2 hidden max-w-[calc(100%-1rem)] rounded-sm p-2 text-[20px] break-words whitespace-normal text-[#222] hover:block">
										{photo.title}
									</p>
								</div>
							</button>
						))}
					</div>
				)}

				{/* Error state */}
				{!isSearching && data && data.length === 0 && q && (
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
									d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<p className="text-lg text-gray-600">No results found</p>
						<p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
							Try adjusting your search terms or date range.
						</p>
					</div>
				)}

				{/* Click Modal */}
				{selectedPhoto && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center p-4"
						role="dialog"
						aria-modal="true"
					>
						{/* Backdrop */}
						<button
							className="absolute inset-0 bg-black bg-opacity-75 border-none cursor-default"
							onClick={handleModalBackdropClick}
							aria-label="Close modal"
						/>

						{/* Modal content */}
						<div className="relative max-w-4xl max-h-full bg-white rounded-lg shadow-2xl overflow-hidden z-10">
							{/* Close button */}
							<button
								onClick={handleCloseModal}
								className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-colors"
								aria-label="Close modal"
							>
								×
							</button>

							{(() => {
								const photo = data?.find(
									(photo) => photo.uuid === selectedPhoto,
								)
								return photo ? (
									<div className="flex flex-col">
										{photo.path && (
											<img
												src={photo.path}
												alt={photo.title || photo.description || 'Media item'}
												className="max-w-full max-h-[80vh] object-contain"
											/>
										)}
										{(photo.title || photo.description) && (
											<div className="p-4 bg-gray-50">
												{photo.title && (
													<h3 className="text-lg font-semibold text-gray-900 mb-2">
														{photo.title}
													</h3>
												)}
												{photo.description && (
													<p className="text-gray-700 text-sm">
														{photo.description}
													</p>
												)}
											</div>
										)}
									</div>
								) : null
							})()}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
