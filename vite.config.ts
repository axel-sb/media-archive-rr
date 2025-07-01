import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { reactRouterDevTools } from 'react-router-devtools'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
// import { denyImports, envOnlyMacros } from 'vite-env-only'
import tsconfigPaths from 'vite-tsconfig-paths'

declare module 'react-router' {
	interface Future {
		v3_singleFetch: true
	}
}

export default defineConfig({
	plugins: [
		reactRouterDevTools(),
		reactRouter(),
		tailwindcss(),
		devtoolsJson(),
		// envOnlyMacros(),
		tsconfigPaths(),

		// denyImports({
		//	client: {
		//		specifiers: ['fs-extra', '@prisma/*'],
		//		files: ['**/.server/*', '**/*.server.*'],
		//	},
		//	server: {
		//		specifiers: ['jquery'],
		//	},
		// }),
	],
	server: {
		open: 'http://localhost:5173/',
		host: true, // local network
	},
})
