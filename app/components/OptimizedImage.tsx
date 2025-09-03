import { useState } from 'react'

export interface OptimizedImageProps {
	src: string
	editedSrc?: string | null // Add edited source prop
	thumbnailSrc?: string | null
	alt: string
	className?: string
	width?: number
	height?: number
	quality?: number
	useFullSize?: boolean
	isVideo?: boolean
}

/**
 * OptimizedImage Component
 *
 * This component handles the client-side part of image optimization:
 * 1. Converts database paths to API routes
 * 2. Adds optimization parameters (width, quality)
 * 3. Handles loading states and errors
 * 4. Provides fallback UI for broken images
 *
 * Flow:
 * Database path → API route → Image server → HEIC conversion (if needed) → Display
 */
export function OptimizedImage({
	src,
	editedSrc,
	thumbnailSrc,
	alt,
	className,
	width,
	height,
	quality = 85,
	useFullSize = false,
	isVideo = false,
}: OptimizedImageProps) {
	const [imageError, setImageError] = useState(false)

	// Use edited version if available, otherwise fall back to original
	const sourcePath = editedSrc || src
	const isVideoFile =
		isVideo || sourcePath.toLowerCase().match(/\.(mov|mp4|m4v)$/i)

	if (imageError && thumbnailSrc) {
		return (
			<img
				src={`/api/images/${thumbnailSrc}`}
				alt={alt}
				className={className}
				onError={() => setImageError(false)}
			/>
		)
	}

	if (isVideoFile) {
		return (
			<video
				src={`/api/images/${sourcePath}`}
				className={className}
				controls
				preload="metadata"
				onError={() => setImageError(true)}
			>
				Your browser does not support the video tag.
			</video>
		)
	}

	// Build query parameters for image optimization
	const params = new URLSearchParams()
	if (width && !useFullSize) params.set('width', width.toString())
	if (quality !== 85) params.set('quality', quality.toString())

	const imageUrl = `/api/images/${sourcePath}${params.toString() ? `?${params}` : ''}`

	return (
		<img
			src={imageUrl}
			alt={alt}
			className={className}
			onError={() => setImageError(true)}
		/>
	)
}
