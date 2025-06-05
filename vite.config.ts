import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { reactRouterDevTools } from 'react-router-devtools'
import devtoolsJson from 'vite-plugin-devtools-json'
import { defineConfig } from 'vite'
import { denyImports } from 'vite-env-only'
import { envOnlyMacros } from 'vite-env-only'


declare module 'react-router' {
	interface Future {
		v3_singleFetch: true
	}
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		reactRouter(),
		reactRouterDevTools(),
		devtoolsJson(),
		envOnlyMacros(),
		denyImports({
			client: {
				specifiers: ['fs-extra', /^node:/, '@prisma/*'],
				files: ['**/.server/*', '**/*.server.*'],
			},
			server: {
				specifiers: ['jquery'],
			},
		}),
	],
})
