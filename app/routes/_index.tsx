import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import { MetaFunction } from '@remix-run/node'
import { useLoaderData, useNavigation } from '@remix-run/react'
import homepageStyles from 'app/routes/css/index.css?url'
import path from 'node:path'
import { useCallback, useState } from 'react'
import { PrismaClient } from '../../prisma/generated'

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
	/*    //__ MARK:Loader
	 */
}
/* export const loader = async ({ request }: LoaderFunctionArgs) => {

    const url = new URL(request.url)
    const query = url.searchParams.get('search') ?? ''
    const data = await getImagesbyKeyword(query)
    return { data }
} */

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const photos = await prisma.photos.findMany()
	console.log('🟡 photos', photos)
	const relPath = photos.map((item) => {
		if (!item.path) return null
		return path.relative('/Volumes/Samsung/Pictures', item.path)
	})

	return { photos, relPath }
}

export default function Index() {
	const { photos: photos, relPath } = useLoaderData<typeof loader>()

	const navigation = useNavigation()
	const [show, setShow] = useState(false)
	const handleToggle = useCallback(() => setShow((show: any) => !show), [])

	return (
		<>
			<div className="mx-auto mb-2 max-w-4xl rounded-lg bg-gray-900 p-6 pt-10 shadow-md sm:p-14">
				<form className="max-w-sm">
					/*{' '}
					<div className="flex flex-wrap">
						<h1 className="w-full text-4xl sm:max-w-[clamp(200px,60%,500px)]">
							<img
								src="bilderbuch.svg"
								alt='The homepage title is "Bilderbuch"'
							/>
						</h1>

						<label
							htmlFor="mediaType"
							className="collapse mt-6 mb-1 block w-32 text-sm font-medium text-gray-400 hover:visible"
						>
							Media Type
						</label>
						<select
							id="mediaType"
							className="mt-2 w-full appearance-none rounded-md border border-gray-500 bg-gray-700 px-4 pt-2 pb-1 text-[#9ca3af] focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="">All</option>
							<option value="image">Images</option>
							<option value="video">Videos</option>
						</select>
					</div>{' '}
					*/
					<div>
						<label
							htmlFor="keyword"
							className="mb-1 block text-sm font-medium text-gray-700"
						>
							Keyword Search
						</label>
						<input
							type="text"
							id="keyword"
							name="search"
							className="mt-2 w-full appearance-none rounded-md border border-gray-500 bg-gray-700 px-4 pt-2 pb-1 text-[#9ca3af] focus:border-blue-500 focus:ring-blue-500"
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
								className="mt-2 w-full appearance-none rounded-md border border-gray-500 bg-gray-700 px-4 pt-2 pb-1 text-[#9ca3af] focus:border-blue-500 focus:ring-blue-500"
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
								className="mt-2 w-full appearance-none rounded-md border border-gray-500 bg-gray-700 px-4 pt-2 pb-1 text-[#9ca3af] focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
					</div>
					<div className="my-6 flex justify-end">
						<button
							type="submit"
							className="mt-2 appearance-none rounded-md border border-gray-500 bg-gray-700 px-6 pt-2 pb-1 font-medium text-[#9ca3af] hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						>
							Search
						</button>
					</div>
				</form>
			</div>
			<div className="rounded-lg bg-gray-900 p-6 shadow-md">
				<h2 className="mb-6 text-2xl font-bold text-gray-400">Recent</h2>

				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
					{/* This will be populated with actual data */}
					{photos?.map((photo, index) => (
						<div
							key={photo.uuid}
							className="relative grid aspect-square place-content-center place-items-center overflow-hidden rounded-xl bg-gray-800 transition-opacity hover:opacity-80"
						>
							<div className="flex h-full w-full items-center justify-center text-gray-400">
								<img src="`${photo.path}`" className="max-w-[135%]" />
								<img src={`images/${relPath[0]}`} className="max-w-[135%]" />
							</div>
							<p className="absolute top-4 left-2 hidden max-w-[calc(100%-1rem)] rounded-sm p-2 text-[20px] break-words whitespace-normal text-[#222] hover:block">
								{photo.title}
							</p>
						</div>
					))}
				</div>

				<div className="mt-6 text-center">
					<a
						href="/gallery"
						className="inline-block rounded-md bg-gray-200 px-6 py-2 font-medium text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
					>
						View All Media
					</a>
				</div>
			</div>
		</>
	)
}
