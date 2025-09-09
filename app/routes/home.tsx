/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react'
import {
	Form,
	type LoaderFunctionArgs,
	NavLink,
	useNavigate,
	useNavigation,
} from 'react-router'
import { OptimizedImage } from '../components/OptimizedImage'
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

/* type RootContextType = {
	showSearch: boolean
	handleToggleSearch: () => void
} */

{
	/*// MARK:Loader  🟡
	 */
}
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const q = url.searchParams.get('q') ?? ''
	const qStartDate = url.searchParams.get('qStartDate') ?? ''
	const qEndDate = url.searchParams.get('qEndDate') ?? ''
	const qFavoriteStr = url.searchParams.get('qFavorite') ?? ''
	const qFavorite = qFavoriteStr === '1' ? 1 : 0

	const data = await getByMultipleDetails({
		q,
		qStartDate,
		qEndDate,
		qFavorite,
	})

	console.dir(data, { depth: 5, colors: true })

	return { data, q, qStartDate, qEndDate, qFavorite }
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { data, q, qStartDate, qEndDate } = loaderData
	const navigation = useNavigation()
	// const { showSearch } = useOutletContext<RootContextType>()
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [qFavorite, setFavorite] = useState(0)
	const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

	// Check if we're in a loading state (for form submissions)
	const isSearching = false // We'll implement this properly later
	// const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

	const navigate = useNavigate()

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

	useEffect(() => {
		const searchField = document.getElementById('search')
		if (searchField instanceof HTMLInputElement) {
			searchField.value = q || ''
		}
	}, [q])

	return (
		<>
			<div className="flex flex-col mb-28 items-center justify-center-safe static rounded-lg bg-linear-to-br from-[#2A323620] to-[#1B242920]">
				{/**
       /* MARK:Form  ______________________________________________________
      */}

				<div className="glass relative mx-auto p-1 w-fit rounded-lg inset-shadow-md">
					<Form
						className="max-w-2xl mx-auto pt-12 px-6 pb-9 border-linear-reverse rounded-lg transition-all duration-300 ease-in-out hover:border-[#f9f9f8]"
						viewTransition
						action="/gallery"
						onSubmit={() => {
							navigate('/gallery')
						}}
					>
						{/*****************************************************************************
						 *  MARK:SEARCH FORM
						 *****************************************************************************/}

						<div className="grid grid-cols-1 gap-x-4 md:grid-cols-[minmax(0px,1.35fr)_minmax(0px,1.35fr)_minmax(0px,1fr)_minmax(0px,0.5fr)_] rounded-lg">
							<div className="relative md:col-span-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="absolute top-4 left-3 size-5 text-neutral-400"
								>
									<circle cx="11" cy="11" r="8"></circle>
									<path d="m21 21-4.35-4.35"></path>
								</svg>
								<input
									id="search"
									name="q"
									type="search"
									defaultValue={q || ''}
									placeholder=""
									size={40}
									className="flex peer placeholder-transparent w-full rounded-md mb-2 py-3 pr-3 pl-10 bg-black/10 border-[0.5px] tracking-wide border-neutral-100/50 text-neutral-300  focus:border-neutral-200/85 focus:outline-none focus:bg-black/35 shadow-neutral-950/50 inset-shadow-xs inset-shadow-black/80 transition-all"
								/>

								<label
									htmlFor="search"
									className="absolute left-10 -top-6 text-neutral-400 text-sm font-compact-rounded transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:top-3.5 peer-active:text-sm peer-focus:-top-6 peer-focus:left-2    peer-focus:text-neutral-400 peer-focus:font-medium peer-focus:text-sm duration-200"
								>
									Search for anything...
								</label>
							</div>
							{/* Advanced Filters Grid */}

							{/* Date Range _____________*/}

							<div>
								<label
									htmlFor="startDate"
									className="block text-sm font-medium  text-neutral-400 font-compact-rounded mt-3 mb-1 pl-2"
								>
									From Date
								</label>
								<input
									type="date"
									id="startDate"
									name="qStartDate"
									defaultValue="1970-01-01"
									className="w-full rounded-md py-3 px-3 tracking-wide  bg-black/10 border-[0.5px] border-neutral-100/50 text-neutral-300 focus:border-neutral-200/85 focus:outline-none focus:bg-black/35 shadow-xs shadow-neutral-950/50 inset-shadow-md inset-shadow-black/80"
								/>
							</div>
							<div>
								<label
									htmlFor="endDate"
									className="block text-sm font-medium  text-neutral-400 font-compact-rounded mt-3 mb-1 pl-2"
								>
									To Date
								</label>
								<input
									type="date"
									id="endDate"
									name="qEndDate"
									defaultValue={todayFormatted}
									className="w-full rounded-md py-3 px-3 bg-black/10 border-[0.5px] tracking-wide border-neutral-100/50 text-neutral-300 focus:border-neutral-200/85 focus:outline-none focus:bg-black/35 shadow-xs shadow-neutral-950/50 inset-shadow-xs inset-shadow-black/80"
								/>
							</div>

							{/* MARK: mobile
							 */}
							{/*****************************************************************************
               *  MARK: mobile
               *****************************************************************************/}

							<div className="md:hidden flex justify-between mb-6">
								<div className="flex flex-col w-2/3">
									<label
										htmlFor="mediaType"
										className="block w-full h-5 mt-3 mb-1 pl-2 text-sm font-medium  text-neutral-400"
									>
										Media Type
									</label>
									<select
										id="mediaType"
										name="qMediaType"
										className="w-full h-12 rounded-md py-3 p-3  bg-black/10 border-[0.5px] tracking-wide border-neutral-100/50 text-neutral-300  focus:border-neutral-200/85 focus:outline-none focus:bg-black/35 shadow-xs shadow-neutral-950/50 inset-shadow-xs inset-shadow-black/80"
									>
										<option value="">All Media</option>
										<option value="image">Photos Only</option>
										<option value="video">Videos Only</option>
									</select>
								</div>

								<div className="flex flex-col">
									<div className="h-5 mt-3 mb-1 pl-2 text-sm font-medium  text-neutral-400 ">
										<span>Liked</span>
									</div>
									<label className="block w-full h-12 items-center cursor-pointer">
										<input
											type="checkbox"
											name="qFavorite"
											value="1"
											onChange={(e) => setFavorite(e.target.checked ? 1 : 0)}
											className="sr-only peer"
										/>
										<div className="flex items-center justify-center h-12 max-h-12 py-0 px-4 rounded-md border-[0.5px] border-neutral-400/35 text-2xl peer-checked:grayscale-0 grayscale-100">
											♥️
										</div>
									</label>
								</div>
							</div>

							{/* Search Button mobile phone small ________ */}

							<div className="md:hidden flex justify-center">
								<button
									type="submit"
									className="rounded-md w-1/3 h-12 my-3 px-5 bg-black/10 border-[0.5px] tracking-wide border-neutral-100/50 text-neutral-300  focus:border-neutral-200/85 focus:outline-none focus:bg-black/35 shadow-xs shadow-neutral-950/50 inset-shadow-xs inset-shadow-black/80"
								>
									Search
								</button>
							</div>

							{/* MARK: medium
							 */}

							<div className="hidden md:block">
								<label
									htmlFor="mediaType"
									className="block w-full h-5 mt-3 mb-1 pl-2 text-sm font-medium  text-neutral-400"
								>
									Media Type
								</label>
								<select
									id="mediaType"
									name="qMediaType"
									className="w-full h-12 rounded-md py-3 p-3  bg-black/10 border-[0.5px] tracking-wide border-neutral-100/50 text-neutral-300  focus:border-neutral-200/85 focus:outline-none focus:bg-black/35 shadow-xs shadow-neutral-950/50 inset-shadow-xs inset-shadow-black/80"
								>
									<option value="">All Media</option>
									<option value="image">Photos Only</option>
									<option value="video">Videos Only</option>
								</select>
							</div>
							<div className=" hidden md:flex flex-col">
								<div className="h-5 mt-3 mb-1 pl-1 text-sm font-medium  text-neutral-400 ">
									<span>Liked</span>
								</div>
								<label className="block w-full h-12 items-center cursor-pointer">
									<input
										type="checkbox"
										name="qFavorite"
										value="1"
										onChange={(e) => setFavorite(e.target.checked ? 1 : 0)}
										className="sr-only peer"
									/>
									<div
										className="flex items-center justify-center h-12 max-h-12 py-0 px-4 rounded-md  bg-black/10 border-[0.5px] tracking-wide border-neutral-100/50  focus:border-neutral-200/85 focus:outline-none focus:bg-black/35 shadow-xs shadow-neutral-950/50 inset-shadow-xs inset-shadow-black/80 text-2xl peer-checked:grayscale-0 focus: grayscale-100"
										aria-label="Toggle Favorite"
									>
										♥️
									</div>
								</label>
							</div>

							{/* Search Button medium and above ________ */}

							<div className="hidden md:flex justify-center md:col-span-4">
								<button
									type="submit"
									className="rounded-md h-12 mt-12 px-7 bg-black/10 border-[0.5px] tracking-wide border-neutral-100/50 text-neutral-300  focus:border-neutral-200/85 focus:outline-none focus:bg-black/35 shadow-xs shadow-neutral-950/50 inset-shadow-xs inset-shadow-black/80"
								>
									Search
								</button>
							</div>
						</div>
					</Form>
				</div>

				<div className="mx-auto max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
					{/* //// MARK:IMGs _________________________________________ 🎞️
					 */}

					{isSearching ? (
						// Loading skeleton for search results
						<div className="grid w- mx-auto justify-center-safe grid-cols-6 gap-1 text-base sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-18">
							{Array.from({ length: 20 }).map((_, index) => (
								<div key={index} className="aspect-square">
									<div className="w-full h-full animate-pulse bg-neutral-300 dark:bg-neutral-700 rounded-md" />
								</div>
							))}
						</div>
					) : (
						<div className="grid w-full mx-auto justify-center-safe grid-cols-6 gap-1 text-base sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-18">
							{data?.map((photo) => (
								<NavLink
									to={`/${photo.uuid}?${new URLSearchParams({
										from: 'home',
										...(q && { q }),
										...(qStartDate && { qStartDate }),
										...(qEndDate && { qEndDate }),
										...(qFavorite && { qFavorite: qFavorite.toString() }),
									})}`}
									className="block w-full h-full"
									onClick={(e) => handlePhotoClick(photo.uuid, e)}
									aria-label={`View ${photo.title || photo.description || 'media item'}`}
								>
									<div className="grid aspect-square place-content-center place-items-center rounded-xs transition-opacity hover:opacity-80">
										{photo?.path && (
											<OptimizedImage
												src={photo.path}
												thumbnailSrc={photo.thumbnail_path || undefined}
												alt={photo.title || photo.description || 'Media item'}
												className="w-full h-full object-cover"
												width={300}
												quality={75}
												isVideo={
													photo.path?.toLowerCase().match(/\.(mov|mp4|m4v)$/i)
														? true
														: false
												}
											/>
										)}

										<p className="absolute top-4 left-2 hidden max-w-[calc(100%-1rem)] rounded-sm p-2 text-[20px] break-words whitespace-normal text-[#222] hover:block">
											{photo.title}
										</p>
									</div>
								</NavLink>
							))}
						</div>
					)}

					{/* Error state */}
					{!isSearching && data && data.length === 0 && q && (
						<div className="text-center -translate-y-42">
							<div className="text-neutral-400 mb-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-16 w-16 mx-auto"
									fill="currentColor"
									viewBox="0 0 24 24"
									stroke="#ff0"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1"
										d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									></path>
								</svg>
							</div>
							<p className="text-lg text-neutral-600">No results found</p>
							<p className="text-sm  text-neutral-400 max-w-md mx-auto mt-2">
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
												<OptimizedImage
													src={photo.path}
													alt={photo.title || photo.description || 'Media item'}
													className="max-w-full max-h-[80vh] object-contain"
													width={300}
													quality={75}
												/>
											)}
											{(photo.title || photo.description) && (
												<div className="p-4 bg-neutral-50">
													{photo.title && (
														<h3 className="text-lg font-semibold text-neutral-900 mb-2">
															{photo.title}
														</h3>
													)}
													{photo.description && (
														<p className="text-neutral-700 text-sm">
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
			<div className="md:hidden buzzard w-full h-20 mx-auto bg-[url(buzzard.png)] bg-center bg-contain bg-no-repeat" />
		</>
	)
}
