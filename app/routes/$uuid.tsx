import { invariantResponse } from '@epic-web/invariant'
import { useCallback, useEffect, useState } from 'react'
import {
	type LoaderFunctionArgs,
	useLoaderData,
	useNavigate,
} from 'react-router'
import { OptimizedImage } from '../components/OptimizedImage'
import './css/uuid.css'
import {
	getByMultipleDetails,
	getPhoto,
} from './resources/prisma-queries.server.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	invariantResponse(params.uuid, 'Missing photo uuid')

	const url = new URL(request.url)
	const from = url.searchParams.get('from')
	console.log('🔍 Detail loader - from:', from)
	console.log(
		'🔍 Detail loader - search params:',
		Object.fromEntries(url.searchParams.entries()),
	)

	const currentPhoto = await getPhoto({ uuid: params.uuid })

	if (!currentPhoto) {
		throw new Response(
			"'getPhoto(uuid)': This Photo (uuid) was not found on the Server",
			{ status: 404 },
		)
	}

	let adjacentPhotos = null

	// If coming from gallery, get the same search results for navigation
	if (from === 'gallery' || from === 'home') {
		const q = url.searchParams.get('q') ?? ''
		const qStartDate = url.searchParams.get('qStartDate') ?? ''
		const qEndDate = url.searchParams.get('qEndDate') ?? ''
		const qFavoriteStr =
			url.searchParams.get('qFavorite') || url.searchParams.get('favorite')
		const qFavorite = qFavoriteStr === '1' ? 1 : 0
		const page = parseInt(url.searchParams.get('page') || '1', 10)

		console.log('🔍 Getting navigation photos with:', {
			q,
			qStartDate,
			qEndDate,
			qFavorite,
		})

		// Get the full result set to enable navigation
		const allPhotos = await getByMultipleDetails({
			q,
			qStartDate,
			qEndDate,
			qFavorite,
		})

		console.log('🔍 Found photos for navigation:', allPhotos.length)

		const currentIndex = allPhotos.findIndex((p) => p.uuid === params.uuid)
		console.log('🔍 Current photo index:', currentIndex)

		adjacentPhotos = {
			all: allPhotos,
			currentIndex,
			previous: currentIndex > 0 ? allPhotos[currentIndex - 1] : null,
			next:
				currentIndex < allPhotos.length - 1
					? allPhotos[currentIndex + 1]
					: null,
			searchParams: { q, qStartDate, qEndDate, qFavorite, page },
		}
	}

	console.log('🔍 Navigation object:', adjacentPhotos ? 'exists' : 'null')
	return { photo: currentPhoto, navigation: adjacentPhotos }
}

export default function PhotoDetail() {
	const { photo, navigation } = useLoaderData<typeof loader>()
	const navigate = useNavigate()
	const [isFullscreen, setIsFullscreen] = useState(false)
	const photoDate = photo.date
		? new Date(photo.date).toLocaleDateString('de-DE').slice(0, 10)
		: new Date(0)

	const handleImageClick = () => {
		setIsFullscreen(!isFullscreen)
	}

	const handleNavigation = useCallback(
		(direction: 'prev' | 'next') => {
			if (!navigation) return

			const targetPhoto =
				direction === 'prev' ? navigation.previous : navigation.next
			if (!targetPhoto) return

			const searchParams = new URLSearchParams({
				from: 'gallery',
				...(navigation.searchParams.q && { q: navigation.searchParams.q }),
				...(navigation.searchParams.qStartDate && {
					qStartDate: navigation.searchParams.qStartDate,
				}),
				...(navigation.searchParams.qEndDate && {
					qEndDate: navigation.searchParams.qEndDate,
				}),
				...(navigation.searchParams.qFavorite && {
					qFavorite: navigation.searchParams.qFavorite.toString(),
				}),
			})

			navigate(`../${targetPhoto.uuid}?${searchParams}`, { replace: true })
		},
		[navigation, navigate],
	)

	// MARK: Keyboard navigation
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') handleNavigation('prev')
			if (e.key === 'ArrowRight') handleNavigation('next')
			if (e.key === 'Escape') setIsFullscreen(false)
		}

		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [handleNavigation])

	return (
		<>
			{isFullscreen && (
				<button
					onClick={() => setIsFullscreen(false)}
					className="absolute grid place-items-center backdrop-blur-xs top-4 right-4 z-20 w-10 h-10 rounded-full hover:bg-opacity-90 text-xl text-white/85"
				>
					􀀳
				</button>
			)}

			{/* Back button (only when not in fullscreen) */}
			{!isFullscreen && (
				<div className="btn-back fixed inset-0 grid-area:header inline-grid place-items-center size-20 text-neutral-300/85 rounded-full hover:text-yellow-400 z-10">
					<button
						onClick={() => navigate(-1)}
						className="size-full text-3xl leading-0 items-center"
					>
						􀰎
					</button>
				</div>
			)}
			{/*  MARK: FIGURE */}
			<figure
				className={`${isFullscreen ? 'w-screen h-screen flex flex-col items-center justify-start' : 'group flex flex-col items-center justify-start min-w-80 max-w-9/12 max-h-9/12 mx-auto rounded-2xl has-[details]:p-4'}`}
			>
				{photo.path ? (
					<>
						<div
							onClick={handleImageClick}
							className="relative grid place-items-center w-screen h-screen cursor-pointer"
						>
							{/* Navigation Controls - show in both normal and fullscreen */}
							{navigation && (
								<div
									className={`absolute flex items-center justify-between w-screen h-screen z-20  text-neutral-300  ${
										isFullscreen ? 'text-neutral-300' : ''
									}`}
								>
									<button
										onClick={() => handleNavigation('prev')}
										disabled={!navigation.previous}
										className="previous ml-2 px-2 h-24 rounded-md opacity-50 disabled:opacity-50 text-xl hover:text-4xl hover:bg-neutral-800/50 hover:backdrop-blur-sm hover:opacity-100 transition-opacity"
									>
										􀯶
									</button>

									<button
										onClick={() => handleNavigation('next')}
										disabled={!navigation.next}
										className="next ml-2 px-2 h-24 rounded-md opacity-50 disabled:opacity-50 text-xl hover:text-4xl hover:bg-neutral-800/50 hover:backdrop-blur-sm hover:opacity-100 transition-opacity"
									>
										􀯻
									</button>
								</div>
							)}
						</div>
						<OptimizedImage
							src={photo.path!}
							editedSrc={photo.path_edited}
							thumbnailSrc={photo.thumbnail_path}
							alt={photo.title || photo.original_filename || 'Photo'}
							className={` ${
								isFullscreen
									? 'fixed inset-0 object-contain cursor-pointer'
									: 'fixed inset-y-0 inset-x-auto object-contain group-has-[figcaption>details]:w-[80vw] group-has-[figcaption>details]:h-[80vh] '
							}`}
							useFullSize={true}
							onClick={handleImageClick}
						/>
					</>
				) : (
					<div className="flex h-96 w-full min-w-xl items-center justify-center bg-neutral-200 rounded-lg">
						<span className="text-neutral-500">No media available</span>
					</div>
				)}

				{/* Metadata (hidden in fullscreen) */}

				{/*  MARK: FIGCAP.
				 ------------------------------------------------------------------ */}
				{!isFullscreen && (
					<figcaption className="fixed bottom-0 has-[details[open]]:top-4 has-[details[open]]:backdrop-blur-3xl has-[details[open]]:overflow-y-auto w-full my-12 mx-auto p-0 py-3 rounded-2-xl font-compact-text z-[101]">
						{/*  MARK: DETAILS
						 */}
						<details className="w-full max-w-lg mx-auto">
							<summary className="relative z-20 w-fit ml-[50%] mb-3 cursor-pointer text-neutral-300 marker:text-neutral-300 -translate-x-1/2 ">
								<div className="translate-x-4 -translate-y-6.5 font-compact-text pl-2 md:pl-4 text-neutral-400">
									{/* MARK: COUNTER
									 */}
									<div className="-mt-[2lh] mb-[1lh] text-neutral-400 opacity-50 hover:opacity-100 transition-opacity">
										{navigation.currentIndex + 1} / {navigation.all.length}
									</div>
									<h1 className="text-xl font-bold text-neutral-400 font-rounded">
										{photo.title || `${photoDate}`}
									</h1>
									<div>
										<p className="">{photo.original_filename}</p>

										{photo.description && (
											<p className="">{photo.description}</p>
										)}
									</div>
								</div>
							</summary>
							<div className="table-wrapper w-full px-2 md:px-4 rounded-md">
								{/*  MARK: TABLE */}
								<table className="table-fixed w-full text-neutral-300 text-sm">
									<tbody>
										<tr>
											<td className="w-30 md:w-48 pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												uuid:
											</td>
											<td className="hyphens-auto">{photo.uuid}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												orig. filename:
											</td>
											<td className="align-text-top">
												{photo.original_filename}
											</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												title:
											</td>
											<td className="align-text-top">{photo.title}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												path:
											</td>
											<td className="align-text-top">{photo.path}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												path_edited:
											</td>
											<td className="align-text-top">{photo.path_edited}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												has_raw:
											</td>
											<td className="align-text-top">{photo.has_raw}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												description:
											</td>
											<td className="align-text-top">{photo.description}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												height:
											</td>
											<td className="align-text-top">{photo.height}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												width:
											</td>
											<td className="align-text-top">{photo.width}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												date:
											</td>
											<td className="align-text-top">{photo.date}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												favorite:
											</td>
											<td className="align-text-top">{photo.favorite}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												latitude:
											</td>
											<td className="align-text-top">{photo.latitude}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												longitude:
											</td>
											<td className="align-text-top">{photo.longitude}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												portrait:
											</td>
											<td className="align-text-top">{photo.portrait}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												hdr:
											</td>
											<td className="align-text-top">{photo.hdr}</td>
										</tr>
										<tr>
											<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
												panorama:
											</td>
											<td className="align-text-top">{photo.panorama}</td>
										</tr>

										{photo.place_names.map((placeName, index) => (
											<tr key={`${placeName.photo_uuid}_${index}`}>
												<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
													{placeName.name_type.replace('_', ' ')}
												</td>
												<td className="align-text-top">{placeName.name}</td>
											</tr>
										))}

										{photo.labels.map((label, index) => (
											<tr key={`${label.label}_${index}`}>
												<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
													label
												</td>
												<td>{label.label}</td>
											</tr>
										))}

										{photo.keywords.map((keyword, index) => (
											<tr key={`${keyword.keyword}_${index}`}>
												<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
													keyword
												</td>
												<td>{keyword.keyword}</td>
											</tr>
										))}

										{photo.photo_persons.map((person, index) => (
											<tr key={`${person.person_uuid}_${index}`}>
												<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
													person_uuid
												</td>
												<td>{person.person_uuid}</td>
											</tr>
										))}

										{photo.photo_albums.map((album, index) => (
											<tr key={`${album.album_uuid}_${index}`}>
												<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
													album_uuid
												</td>
												<td>{album.album_uuid}</td>
											</tr>
										))}

										{photo.place_addresses && (
											<>
												<tr>
													<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
														street:
													</td>
													<td className="rounded-r-sm">
														{photo.place_addresses.street}
													</td>
												</tr>
												<tr>
													<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
														city:
													</td>
													<td className="rounded-r-sm">
														{photo.place_addresses.city}
													</td>
												</tr>
												<tr>
													<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
														state_province:
													</td>
													<td className="rounded-r-sm">
														{photo.place_addresses.state_province}
													</td>
												</tr>
												<tr>
													<td className="pr-2 md:pr-4 align-text-top overflow-x-hidden rounded-l-sm text-right">
														postal_code:
													</td>
													<td className="rounded-r-sm">
														{photo.place_addresses.postal_code}
													</td>
												</tr>
												<tr>
													<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
														country:
													</td>
													<td className="rounded-r-sm">
														{photo.place_addresses.country}
													</td>
												</tr>
												<tr>
													<td className="pr-2 md:pr-4 align-text-top overflow-x-clip rounded-l-sm text-right">
														iso_country_code:
													</td>
													<td className="rounded-r-sm">
														{photo.place_addresses.iso_country_code}
													</td>
												</tr>
											</>
										)}
									</tbody>
								</table>
							</div>
						</details>
					</figcaption>
				)}
			</figure>
		</>
	)
}
