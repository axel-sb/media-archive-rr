// collapse
import { useCallback, useState } from "react";
import {
    Link,
    Links,
    type LinksFunction,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
    useNavigation,
} from 'react-router';


import ToggleButton from './components/toggleButton.tsx';

import './app.css';
export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:BLED,SCAN,XELA,YELA@0..100,-53..100,-100..100,-100..100&family=Workbench:BLED,SCAN@0..100,-53..100&display=swap',
	},
]

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta title='* Bilderbuch' />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	const navigation = useNavigation()
	const [showSearch, setShowSearch] = useState(true);
	const handleToggleSearch = useCallback(() => setShowSearch(s => !s), []);

	return (
		<>
			<div
				className="flex flex-col justify-center bg-transparent text-yellow-100"
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
			></div>
			{/*//// MARK:HEADER 🟡
			 */}
			<header
				className="grid h-16 w-full px-4 sm:px-6 md:px-8 grid-cols-[1fr_4rem_4rem_4rem] gap-4 md:gap-8 place-items-center bg-gray-700 z-10"
				style={{
					boxShadow: '0 0 .5rem #000b, 0 0 1rem #0006, 0 0 1.5rem #0004',
				}}
			>
				<div className="navlink-home inline-flex h-9 w-auto cursor-pointer items-center justify-self-start rounded-md">
					<NavLink
						className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' z-10 inline-flex h-9 w-auto`}
						to={`/`}
					>
						<img
							src="bilderbuch.svg"
							alt='The homepage title is "Bilderbuch"'
							className="justify-self-start object-contain"
						/>
					</NavLink>
				</div>

				<div className="toggle-button-wrapper inline-flex h-10 w-10 cursor-pointer justify-center self-center justify-self-end rounded-md">
					<ToggleButton
						className="toggle-button inline-flex h-10 w-10 rounded-full justify-center items-end"
						onToggle={handleToggleSearch}
						isActive={showSearch}
					>
						<img
							src="magnifier.svg"
							alt=""
							className={`w-10 h-10 pt-1.5 object-contain ${showSearch ? 'hidden' : 'block'}`}
						/>
						<img
							src="x.svg"
							alt=""
							className={`w-8 h-8 p-1 object-contain ${showSearch ? 'block' : 'hidden'}`}
						/>
					</ToggleButton>
				</div>
				<div className="navlink-gallery inline-flex h-9 w-14 cursor-pointer justify-end self-center justify-self-end rounded-md">
					<NavLink
						className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' z-10 inline-flex h-9 w-9 justify-center text-foreground`}
						to={`gallery`}
					>
						<img
							src="gallery.svg"
							alt='The homepage title is "Bilderbuch"'
							className="flex-grow max-h-full md:max-h-14 will-change-auto object-contain"
						/>
					</NavLink>
				</div>

				<div className="navlink-map inline-flex h-9 w-14 cursor-pointer justify-center self-center justify-self-center rounded-md">
					<NavLink
						className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' z-10 inline-flex h-9 w-9 justify-center text-foreground`}
						to={`map`}
					>
						<img
							src="map.svg"
							alt='The homepage title is "Bilderbuch"'
							className="flex-grow sm:max-h-9 md:max-h-14 will-change-auto object-contain"
						/>
					</NavLink>
				</div>
			</header>

			<main className="flex flex-col flex-grow w-screen min-h-dvh p-4 md:p-8 justify-center items-center bg-gradient-to-b from-gray-700  via-gray-950 via-30% to-gray-950">
				{navigation.state === 'loading' ? (
					<div className="flex flex-col h-64 items-center justify-center gap-4">
						<div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" role="status" aria-label="Loading"></div>
						<div className="text-gray-400 text-sm font-medium">Loading your media...</div>
					</div>
				) : (
					<Outlet context={{ showSearch, handleToggleSearch }} />
				)}
			</main>

			{/*//// MARK:FOOTER 🟡
			 */}

			<footer className="flex items-center justify-between w-full h-18 px-4 bg-gray-900 border-transparent border-t-gray-500/25 border text-gray-600">
				<Link
					to="https://rhettbull.github.io/osxphotos/index.html"
					viewTransition
				>
					osxphotos docs
				</Link>
				<NavLink
					to={'/'}
					className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' z-10 inline-flex h-10 w-auto justify-center items-center`}
					viewTransition
				>
					<p className="text-3xl text-shadow-lg/50">k62</p>
				</NavLink>
			</footer>
		</>
	)
}
