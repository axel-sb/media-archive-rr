// collapse
import { useCallback, useState } from 'react'
import {
	Links,
	type LinksFunction,
	Meta,
	NavLink,
	Outlet,
	Scripts,
	ScrollRestoration,
	useNavigate,
	useNavigation,
} from 'react-router'

import ToggleButton from './components/toggleButton.tsx'

import './app.css'
export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:BLED,SCAN,XELA,YELA@0..100,-53..100,-100..100,-100..100&display=swap&text=k62',
	},
]

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" data-theme="dark" className="h-screen">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta title="* Bilderbuch" />
				<Meta />
				<Links />
			</head>
			<body className="group grid w-full min-h-full grid-cols-1 grid-rows-[minmax(0px,80px)_1fr)] [grid-template-areas:'header'_'main'] bg-[url(kleedient-amadine.jpg)] bg-fixed bg-center bg-cover md:bg-size-[100%_125%]">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	const navigation = useNavigation()
	const [showSearch, setShowSearch] = useState(true)
	const handleToggleSearch = useCallback(() => setShowSearch((s) => !s), [])
	const navigate = useNavigate()

	return (
		<>
			{/* <div className="absolute inset-0 h-full min-h-full bg-[url(kleedient-amadine.jpg)] bg-fixed bg-center bg-cover md:bg-size-[100%_100%] grow xl:bg-cover bg-blend-multiply"></div> */}

			{/*****************************************************************************
			 *  MARK:HEADER
			 *****************************************************************************/}
			<header
				className="peer fixed top-0 grid [grid-area:header] h-20 w-full px-4 sm:px-6 md:px-8 grid-cols-[1fr_1fr] items-center justify-between z-80 opacity-0 hover:opacity-100 hover:backdrop-blur-xs hover:backdrop-brightness-90 transition-all duration-300 ease-out after:absolute after:inset-y-full after:h-0.20 after:w-full after:bg-linear-to-r after:from-blue-50/25 after:via-blue-50/50 after:to-blue-400/25 after:z-100  group-has-[glass]:opacity-100"
				style={{
					boxShadow: 'inset 0 0 1px #1e3047, 0 0 1px #647387, 0 0 1.5px #fff8',
				}}
			>
				<NavLink
					className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' w-32 z-10 inline-grid [grid-template-columns:1fr] [grid-template-rows:1fr] items-center self-start justify-start mr-auto cursor-pointer`}
					to={`/`}
				>
					<img
						src="k62-3a.png"
						className="relative inline-block opacity-100 hover:opacity-0 w-[128px] h-[39px] [grid-row:1_/_2] transition-opacity duration-400 ease-out object-cover"
						alt="k62"
					/>
					<img
						src="k62-3c.png"
						className="relative inline-block opacity-0 hover:opacity-100 w-[128px] h-[39px] [grid-row:1_/_2] transition-opacity duration-400 ease-out object-cover"
						alt="k62"
					/>
				</NavLink>
				{/*****************************************************************************
          MARK:BTN-BACK
        *****************************************************************************/}
				<div className="btn-back fixed inset-0 grid-area:header inline-grid place-items-center size-20 text-neutral-300/85 rounded-full hover:text-yellow-400 z-10">
					<button
						onClick={() => navigate(-1)}
						className="size-full text-3xl leading-0 items-center"
					>
						􀰎
					</button>
				</div>

				<div className="inline-grid grid-cols-[1fr_1.25fr_1fr] max-w-48 p-0.5 justify-self-end gap-8 sm:gap-12 lg-gap-14 items-center self-center justify-between w-full">
					<div className="inline-grid place-items-center size-full cursor-pointer">
						<NavLink
							to={`/`}
							className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' z-100`}
						>
							<img
								src="magnifier2.svg"
								alt="Magnifier Icon"
								className="flex-grow w-full will-change-auto object-contain translate-y-0.5 hover:scale-125 opacity-50 hover:opacity-100 transition-transform duration-300 ease-out drop-shadow-[-14px_4px_4px_rgba(0,0,0,0.5)] z-100"
							/>
						</NavLink>
					</div>

					<div className="inline-grid place-items-center size-full cursor-pointer">
						<NavLink
							className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' z-10`}
							to={`gallery`}
						>
							<img
								src="gallery-gradient.svg"
								alt="Gallery Icon"
								className="w-full will-change-auto object-contain hover:scale-120 opacity-50 hover:opacity-100 transition-transform duration-300 ease-out drop-shadow-[-14px_4px_4px_rgba(0,0,0,0.5)]"
							/>
						</NavLink>
					</div>

					<div className="inline-grid place-items-center size-full cursor-pointer">
						<NavLink
							className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' z-10`}
							to={`geomap`}
						>
							<img
								src="map3.svg"
								alt="Map Icon"
								className="w-full will-change-auto object-contain hover:scale-120 opacity-50 hover:opacity-100 transition-all duration-300 ease-out drop-shadow-[-14px_4px_4px_rgba(0,0,0,0.5)]"
							/>
						</NavLink>
					</div>
				</div>
			</header>
			{/*****************************************************************************
			 *   MARK:MAIN
			 *****************************************************************************/}

			<main className="flex [grid-area:main] flex-col grow w-full mx-auto min-h-full p-0 justify-center items-center">
				{navigation.state === 'loading' ? (
					<div className="flex flex-col h-64 items-center justify-center gap-4">
						<div
							className="h-8 md:h-11 lg:h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"
							role="status"
							aria-label="Loading"
						></div>
						<div className="text-gray-400 text-sm font-medium">
							Loading your media...
						</div>
					</div>
				) : (
					<Outlet />
					/* ( <Outlet context={{ showSearch, handleToggleSearch }} /> ) */
				)}
			</main>
		</>
	)
}
