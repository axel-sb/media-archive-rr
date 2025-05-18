import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useNavigation,
} from "@remix-run/react";
import { ReactNode } from "react";


import { LinksFunction } from "@remix-run/node";
import "./tailwind.css";

export const links: LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:BLED,SCAN,XELA,YELA@0..100,-53..100,-100..100,-100..100&family=Workbench:BLED,SCAN@0..100,-53..100&display=swap",
    },
];

export function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className="min-h-screen bg-[url(images/header.jpeg)] bg-[600px_auto] bg-repeat backdrop-filter backdrop-blur-[8px] backdrop-brightness-[0.5] backdrop-contrast-[0.5] text-[#e3e3e3]">
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
const navigation = useNavigation()
    return (
        <div className="flex flex-col min-h-screen">
            {/*   //__ MARK:Header
              */}
            <header className="h-24 bg-neutral-900 bg-[url(images/header.jpeg)] bg-[600px_auto] bg-repeat-x text-4xl bg-blend-hard-light py-4 font-bold" style={{ boxShadow: '0 0 .5rem #000b, 0 0 1rem #0006, 0 0 1.5rem #0004', }}>

                <div className="flex w-full max-w-4xl h-full px-4 mx-auto justify-between items-center">

                    <h2 className="home w-18 h-14 pl-3 pr-1 inline-flex justify-center items-center rounded-full" style={{ backgroundImage: 'radial-gradient(ellipse farthest-side at center, hsla(0, 0%, 0%, 0.62) 50%, hsla(0, 0%, 0%, 0) 100%)',}}>
                        <a href="/" className="hover:underline">
                            <img className="w-10 h-10 sm:w-14 sm:h-12  p-0" src="cameraS.svg" style={{
                                filter: 'drop-shadow(1px 1px 1px #fff) drop-shadow(-1px -1px 1px #fff) drop-shadow(0 0 5px #1a1918bb)  drop-shadow(0 0 10px #1a1918)  drop-shadow(0 0 20px #1a1918)',
                            }} />
                        </a>
                    </h2>

                    <nav className="inline-flex items-baseline justify-around">

                        <ul className="flex gap-x-10 sm:gap-x-15 backdrop-blur-[1px] rounded-md px-3 py-2">
                            <li>
                                <a href="/gallery" className="hover:underline px-2">
                                    <img className="w-10 h-10 sm:w-12 sm:h-12 p-0" src="gallery.svg" style={{
                                        filter: 'drop-shadow(1px 1px 1px #fff) drop-shadow(-1px -1px 1px #fff)',
                                    }} />
                                </a>
                            </li>
                            <li>
                                <a href="/gallery" className="hover:underline px-2">
                                    <img className="w-10 h-10 sm:w-12 sm:h-12  p-0 pt-1 pb-0.5" src="map.svg" style={{
                                        filter: 'drop-shadow(1px 1px 1px #fff) drop-shadow(-1px -1px 1px #fff)',
                                    }} />
                                </a>
                            </li>
                        </ul>
                    </nav>

                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto px-2 mt-6 md:mt-8x">
                {navigation.state === "loading" ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <Outlet />
                )}
            </main>

            <footer className="text-2xl mt-4 py-2">
                <div className="w-full mx-auto  px-4 text-center">
                    <p>k62</p>
                </div>
            </footer>
        </div>
    );
}
