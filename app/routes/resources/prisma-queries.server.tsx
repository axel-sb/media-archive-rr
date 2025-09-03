import NodeCache from 'node-cache'
import { PrismaClient, type photos } from '../../../prisma/generated/client'

// Singleton pattern for database connection
let prisma: PrismaClient

declare global {
	var __prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient({
		log: ['error'],
	})
} else {
	// In development, reuse connection across hot reloads
	if (!global.__prisma) {
		global.__prisma = new PrismaClient({
			log: ['query', 'error'],
		})
	}
	prisma = global.__prisma
}

// Query result cache
const queryCache = new NodeCache({
	stdTTL: 300, // 5 minutes
	maxKeys: 100,
})

export function getByMultipleDetails({
	q,
	qStartDate,
	qEndDate,
	qFavorite,
	skip,
	take,
	orderBy,
}: {
	q: string
	qStartDate: string
	qEndDate: string
	qFavorite: number
	skip?: number
	take?: number
	orderBy?: unknown
}) {
	// Check cache first
	const cacheKey = JSON.stringify({
		q,
		qStartDate,
		qEndDate,
		qFavorite,
		skip,
		take,
		orderBy,
	})
	const cached = queryCache.get<any>(cacheKey)
	if (cached) {
		console.log('🚀 Query cache hit')
		return cached
	}

	// Build the where clause dynamically
	const whereConditions: Record<string, unknown>[] = [
		{
			date: {
				lte: qEndDate,
				gte: qStartDate,
			},
		},
		{ path: { not: null } },
	]

	// Add favorite filter only if specifically requested (qFavorite = 1)
	if (qFavorite === 1) {
		whereConditions.push({ favorite: { equals: 1 } })
	}

	// Add comprehensive search filter if query provided (keeping all your original search fields!)
	if (q) {
		whereConditions.push({
			OR: [
				// `mode: 'insensitive'` does not exist for SQLite databases
				{ title: { contains: q } },
				{ description: { contains: q } },
				{ original_filename: { contains: q } },
				{
					keywords: { some: { keyword: { contains: q } } },
				},
				{ labels: { some: { label: { contains: q } } } },
				{ place_addresses: { street: { contains: q } } },
				{ place_addresses: { city: { contains: q } } },
				{ place_addresses: { country: { contains: q } } },
				{
					photo_persons: {
						some: { persons: { name: { contains: q } } },
					},
				},
			],
		})
	}

	const result = prisma.photos.findMany({
		select: {
			uuid: true,
			original_filename: true,
			title: true,
			path: true,
			path_edited: true,
			description: true,
			date: true,
			favorite: true,
			thumbnail_path: true,
			latitude: true,
			longitude: true,
			// Include search-relevant data
			keywords: {
				select: {
					keyword: true,
				},
			},
			labels: {
				select: {
					label: true,
				},
			},
			place_addresses: {
				select: {
					street: true,
					city: true,
					country: true,
				},
			},
			photo_persons: {
				select: {
					persons: {
						select: {
							name: true,
							display_name: true,
						},
					},
				},
			},
		},
		where: {
			AND: whereConditions,
		},
		orderBy: orderBy || { date: 'desc' },
		skip: skip || 0,
		take: take || 50,
	})

	// Cache the result
	queryCache.set(cacheKey, result)

	return result
}

export function getQueryCacheStats() {
	return {
		size: queryCache.keys().length,
		hits: queryCache.getStats().hits,
		misses: queryCache.getStats().misses,
	}
}

export function getPhoto({ uuid }: Pick<photos, 'uuid'>) {
	return prisma.photos.findFirst({
		select: {
			uuid: true,
			original_filename: true,
			title: true,
			path: true,
			path_edited: true,
			has_raw: true,
			description: true,
			height: true,
			width: true,
			date: true,
			favorite: true,
			latitude: true,
			longitude: true,
			portrait: true,
			hdr: true,
			panorama: true,
			faces: true,
			keywords: true,
			labels: true,
			photo_albums: true,
			photo_persons: true,
			place_addresses: true,
			place_names: true,
			places: true,
		},
		where: { uuid },
	})
}

export { prisma }
