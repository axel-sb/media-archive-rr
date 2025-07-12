import { useState } from 'react'
import {
    Form,
    Link,
    type LoaderFunctionArgs,
    useOutletContext,
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
	const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null)
	// const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

	const today = new Date()
	const todayFormatted = today.toISOString().slice(0, 10) // "2025-06-26"

	// const navigation = useNavigation()
	// console.log(" navigation.state, navigation.formData", navigation.state, navigation.formData)
	// const [show, setShow] = useState(false)
	// const handleToggle = useCallback(() => setShow((show: unknown) => !show), [])

	const handleMouseEnter = (
		photoUuid: string /* event: React.MouseEvent */,
	) => {
		setHoveredPhoto(photoUuid)
		/*setMousePosition({ x: event.clientX, y: event.clientY })*/
	}

	const handleMouseLeave = () => {
		setHoveredPhoto(null)
	}
	/*const handleMouseMove = (event: React.MouseEvent) => {
		 setMousePosition({ x: event.clientX, y: event.clientY })
	}*/

	return (
		<div className="relative">
			{/*{' '}
			<div
				style={{
					backgroundColor: 'rgba(255, 255, 255, 0.05)',
					maskImage: 'url(images/leaves.avif)',
					maskSize: 'cover',
					maskRepeat: 'no-repeat',
					maskPosition: 'center center',
					position: 'absolute',
					width: '100vw',
					height: '110vh',
					inset: '0',
				}}
			></div>{' '}
			*/}
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
							className="mb-1 block text-sm font-medium text-gray-700"
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
								className="mb-1 block text-sm font-medium text-gray-700"
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
								className="mb-1 block text-sm font-medium text-gray-700"
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
					<p className="inline-flex w-full justify-between items-center font-medium text-base text-gray-600">
						search term:{' '}
						<span className="inline-block h-3 mx-3 grow border border-transparent border-b-gray-700 border-b-2 border-dashed">
							{' '}
						</span>{' '}
						<span className="inline-block shrink pr-2 text-gray-500 pl-1">
							{q}
						</span>
					</p>
				</div>

				<h2 className="flex justify-between mb-6 text-xl font-bold text-gray-600">
					<p>Search Result Preview</p>
					<Link
						to={'./gallery'}
						className="inline-flex justify-end-safe self-end rounded-md px-4 py-1 font-normal border-1 border-gray-700 bg-gray-800 text-gray-400 hover:focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
					>
						More
					</Link>
				</h2>

				{/* //// MARK:IMGs _________________________________________🎞️
				 */}
				<div className="grid w-full pb-7 mx-auto justify-center-safe grid-cols-6 gap-1 text-base sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-18">
					{data?.map((photo) => (
						<div
							key={photo.uuid}
							className="relative"
							onMouseEnter={(/* e */) => handleMouseEnter(photo.uuid /* e */)}
							onMouseLeave={handleMouseLeave}
							/* onMouseMove={handleMouseMove} */
						>
							<Link
								to={`${photo.uuid}`}
								className="grid aspect-square place-content-center place-items-center rounded-xs transition-opacity hover:opacity-80"
							>
								{photo?.path && (
									<img
										src={`${photo.path}`}
										alt=""
										className="h-full w-full object-contain"
									/>
								)}

								<p className="absolute top-4 left-2 hidden max-w-[calc(100%-1rem)] rounded-sm p-2 text-[20px] break-words whitespace-normal text-[#222] hover:block">
									{photo.title}
								</p>
							</Link>
						</div>
					))}
				</div>

				{/* Hover Modal */}
				{hoveredPhoto && (
					<div
						className="absolute top z-50 w-full max-w-70 mx-auto place-items-center-safe dark:shadow h-auto darker-dropdown-background sm:rounded-lg transform transition-transform ease-in-out opacity-100 scale-100 pointer-events-none"
						/* style={{
							left: mousePosition.x + 10,
							top: mousePosition.y + 10,
						}} */
					>
						<div className="inset-0 w-full h-full bg-black bg-opacity-90 rounded-lg p-2 shadow-2xl border border-gray-600">
							{(() => {
								const photo = data?.find((photo) => photo.uuid === hoveredPhoto)
								return (
									photo?.path && (
										<img
											src={photo.path}
											alt=""
											className="w-1/2 h-64 object-cover rounded"
										/>
									)
								)
							})()}
							{(() => {
								const photo = data?.find((photo) => photo.uuid === hoveredPhoto)
								return (
									photo?.title && (
										<p className="text-white text-sm mt-2 max-w-64 break-words">
											{photo.title}
										</p>
									)
								)
							})()}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
