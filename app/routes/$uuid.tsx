// collapse
import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router'
// import type { Route } from '~/.react-router/types/app/routes/+types/$uuid.ts'
import { getPhoto } from './resources/prisma-queries.server.tsx'

export async function loader({ params }: LoaderFunctionArgs) {
	invariantResponse(params.uuid, 'Missing photo uuid')
	const photo = await getPhoto({ uuid: params.uuid })
	console.log('params', params)
	if (!photo) {
		throw new Response(
			"'getPhoto(uuid)': This Photo (uuid) was not found on the Server",
			{
				status: 404,
			},
		)
	}
	return { photo }
}

export default function PhotoId() {
	const { photo } = useLoaderData<typeof loader>()
	// for back-button
	const navigate = useNavigate()
	{
		/* const libraryPath = photo?.path_edited ?? photo?.path
	console.log('🟡 libraryPath', libraryPath) */
	}
	return (
		<>
			<img src={`${photo.path}`} alt="" className="max-w-full h-auto max-h-full object-contain" />
			<button
				className="btn-back relative col-[1_/_2] inline-flex h-10 w-10 flex-[2_1_auto] cursor-pointer justify-center justify-self-center rounded-full p-0"
				onClick={() => {
					navigate(-1)
				}}
			></button>
		</>
	)
}
