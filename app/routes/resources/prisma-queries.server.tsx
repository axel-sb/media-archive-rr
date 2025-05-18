import { PrismaClient } from "../../../prisma/generated"
import { photos } from 'prisma/generated'

const prisma = new PrismaClient()

export function getImagesbyKeyword(q: string) {
	return prisma.photos.findMany({
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
		where: {
			OR: [
				{ description: { contains: q } },
				{ keywords: { some: { keyword: { contains: q } } } },
				{ labels: { some: { label: { contains: q } } } },
			],
		},
		orderBy: { date: 'desc' },
		skip: 0,
		take: 2,
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
