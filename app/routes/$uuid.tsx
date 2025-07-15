// collapse
import { invariantResponse } from '@epic-web/invariant'
import {
    type LoaderFunctionArgs,
    useLoaderData, useNavigate,
} from 'react-router'
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
			<figure className="max-w-full max-h-[calc(100vh-12rem)]">
				<img
					src={`${photo.path}`}
					alt=""
					className="object-contain object-center m-auto max-h-[calc(100vh-12rem)] max-w-full"
				/>
				<figcaption>
					<button
						className="btn-back relative inline-flex h-full max-h-24 w-screen pt-12 pr-[calc(100vw-3.25rem)] md:pr-[calc(100vw-4.25rem)] pl-4 md:pl-8 mr-auto cursor-pointer justify-center justify-self-start items-end rounded-full"
						onClick={() => {
							navigate(-1)
						}}
					>
						<svg viewBox="0 0 70.4297 56.748">
							<g>
								<rect height="56.748" opacity="0" width="70.4297" x="0" y="0" />
								<path
									d="M0 28.3594C0 29.1504 0.322266 29.8828 0.966797 30.4688L26.3086 55.8398C26.9531 56.4258 27.5977 56.7188 28.3594 56.7188C29.9707 56.7188 31.1719 55.5469 31.1719 53.9648C31.1719 53.2031 30.9082 52.4414 30.4102 51.9141L20.127 41.543L6.44531 28.916L5.77148 30.5566L17.3145 31.2012L67.3828 31.2012C69.0234 31.2012 70.1953 30 70.1953 28.3594C70.1953 26.6895 69.0234 25.5176 67.3828 25.5176L17.3145 25.5176L5.77148 26.1328L6.44531 27.8027L20.127 15.1758L30.4102 4.77539C30.9082 4.24805 31.1719 3.51562 31.1719 2.75391C31.1719 1.17188 29.9707 0 28.3594 0C27.5977 0 26.8945 0.263672 26.1328 1.02539L0.966797 26.2207C0.322266 26.8359 0 27.5684 0 28.3594Z"
									fill="white"
									fillOpacity="0.85"
								/>
							</g>
						</svg>
					</button>
				</figcaption>
			</figure>
		</>
	)
}
