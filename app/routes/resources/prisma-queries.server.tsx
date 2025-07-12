import { PrismaClient, type photos } from '../../../prisma/generated'

const prisma = new PrismaClient()
export function getByMultipleDetails(
	q: string,
	qStartDate: string,
	qEndDate: string,
    qFavorite: number
) {
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

	// Build the final where clause
	const whereClause = q && q.trim() !== ''
		? {
			AND: whereConditions,
			OR: [
				{ description: { contains: q } },
				{ keywords: { some: { keyword: { contains: q } } } },
				{ labels: { some: { label: { contains: q } } } },
			]
		}
		: { AND: whereConditions }

	return prisma.photos.findMany({
		include: {
			labels: true,
			keywords: true,
		},
		where: whereClause,
		orderBy: { date: 'desc' },
		skip: 0,
		take: 90,
	})
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
