import path from 'node:path'
import { useCallback, useState } from 'react'
import type { LinksFunction, LoaderFunctionArgs } from 'react-router'
import { Form, MetaFunction, useLoaderData, useNavigation } from 'react-router'
import { PrismaClient } from '../../prisma/generated'
import homepageStyles from './css/index.css?url'
import { getImagesbyKeyword } from './resources/prisma-queries.server'

export const meta: MetaFunction = () => {
	return [
		{ title: '* Personal Media Archive' },
		{
			name: 'description',
			content: 'Search and browse your personal media collection',
		},
	]
}

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: homepageStyles },
]

const prisma = new PrismaClient()

{
	/*//// MARK:Loader  🟡
	 */
}
/* export const loader = async ({ request }: LoaderFunctionArgs) => {

    const url = new URL(request.url)
    const query = url.searchParams.get('search') ?? ''
    const data = await getImagesbyKeyword(query)
    return { data }
} */

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const photos = await prisma.photos.findMany({
        where: { path: { not: null }, }, skip: 0, take: 50 })

	const relPath = photos.map((photo) => {
		if (!photo.path) return null
		return path.relative('/Volumes/Samsung/Pictures', photo.path)
	})

const url = new URL(request.url)
const query = url.searchParams.get('q') ?? ''
const data = await getImagesbyKeyword('q')

	console.log('🟡 relPath: ', relPath)



	return { data, photos, relPath }
}

export default function Home() {
	const { photos: photos, relPath } = useLoaderData<typeof loader>()

	const navigation = useNavigation()
	const [show, setShow] = useState(false)
	const handleToggle = useCallback(() => setShow((show: any) => !show), [])

	return (
		<>
			<div
				className="size-full mx-auto p-6 pt-0 sm:p-14 max-w-4xl rounded-lg shadow-md"
				/* style={{
					backgroundColor: 'rgba(255, 0, 255, 0.5)',
					maskImage: 'url(images/leaves.avif)',
					maskSize: 'cover',
					maskRepeat: 'no-repeat',
					maskPosition: 'center center',
				}} */
			>
				<Form className="max-w-sm mx-auto">
					<div className="flex flex-wrap">
						<label
							htmlFor="mediaType"
							className="collapse mt-6 mb-1 block w-32 text-sm font-medium text-gray-400 hover:visible"
						>
							Media Type
						</label>
						<select
							id="mediaType"
							className="mt-2 w-full appearance-none rounded-md border border-gray-500  px-4 pt-2 pb-1 text-[#9ca3af] focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="">All</option>
							<option value="image">Images</option>
							<option value="video">Videos</option>
						</select>
					</div>
					<div>
						<label
							htmlFor="keyword"
							className="mb-1 block text-sm font-medium text-gray-700"
						>
							Keyword-Description-Label Search
						</label>
						<input
							type="text"
							id="keyword"
							name="q"
							className="mt-2 w-full appearance-none rounded-md border border-gray-500  px-4 pt-2 pb-1 text-[#9ca3af] focus:border-blue-500 focus:ring-blue-500"
							placeholder="Search descriptions, locations, etc."
						/>
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
								className="mt-2 w-full appearance-none rounded-md border border-gray-500 px-4 pt-2 pb-1 text-[#9ca3af] focus:border-blue-500 focus:ring-blue-500"
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
								className="mt-2 w-full appearance-none rounded-md border border-gray-500  px-4 pt-2 pb-1 text-[#9ca3af] focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
					</div>
					<div className="my-6 flex justify-end">
						<button
							type="submit"
							className="mt-2 appearance-none rounded-md border border-gray-500  px-6 pt-2 pb-1 font-medium text-[#9ca3af] hover: focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						>
							Search
						</button>
					</div>
				</Form>

				<img
					src="images/Buzzard-looking-at-you-too.jpeg"
					className="max-w-sm mx-auto"
				/>
			</div>
			<div className="">
				<h2 className="ml-4 mb-6 text-2xl font-bold text-gray-500">Recent</h2>

				{/* MARK:IMAGES 🎞️
				 */}
				<div className="relative grid w-full grid-cols-6 gap-1 text-base sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-18">
					{photos?.map((photo, index) => (
						<div
							key={photo.uuid}
							className="relative grid aspect-square place-content-center place-items-center overflow-hidden rounded-xs  transition-opacity hover:opacity-80"
						>
							{relPath[index] && (
								<img
									src={`images/${relPath[index]}`}
									className="h-full w-full max-h-none  max-w-none object-cover"
								/>
							)}
							<p className="absolute top-4 left-2 hidden max-w-[calc(100%-1rem)] rounded-sm p-2 text-[20px] break-words whitespace-normal text-[#222] hover:block">
								{photo.title}
							</p>
						</div>
					))}
				</div>

				<div className="mt-6 text-center">
					<a
						href="/gallery"
						className="inline-block rounded-md my-4 px-6 py-2 font-medium text-gray-400 hover: focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none "
					>
						More
					</a>
				</div>
			</div>
		</>
	)
}
