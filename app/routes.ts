// collapse
//	route('some/path', './some/file.tsx'),
	// pattern ^           ^ module file


import {
	type RouteConfig,
	route,
	index,
} from '@react-router/dev/routes'

export default [
	index('./routes/home.tsx'),
	route('gallery', './routes/gallery.tsx'),
	route(':uuid', './routes/$uuid.tsx'),
	route('favorites', './routes/favorites.tsx'),
] satisfies RouteConfig
