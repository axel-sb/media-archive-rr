import fs from 'fs/promises'
import path from 'path'
import { type LoaderFunctionArgs } from 'react-router'
import {
    convertHeifToJpeg,
    fileExists,
    isHeifFile,
} from '../utils/image-converter.server'

/**
 * Dynamic image serving route: /api/images/*
 *
 * This route handles all image requests and provides:
 * 1. HEIC → JPEG conversion for Apple's newer image format
 * 2. Security checks to prevent directory traversal attacks
 * 3. Proper HTTP headers for browser caching
 * 4. Support for query parameters (width, quality)
 *
 * URL Examples:
 * /api/images/Photos Library.photoslibrary/originals/0/file.heic
 * /api/images/Photos Library.photoslibrary/originals/0/file.heic?width=300&quality=75
 */
export async function loader({ params }: LoaderFunctionArgs) {
	// Extract the image path from the URL (everything after /api/images/)
	const imagePath = params['*']

	console.log('🖼️ Image route called with:', imagePath)

	if (!imagePath) {
		throw new Response('Image path required', { status: 400 })
	}

	// Decode URL encoding (spaces become %20, etc.)
	const decodedPath = decodeURIComponent(imagePath)
	console.log('🔍 Decoded path:', decodedPath)

	// Security: Prevent directory traversal attacks
	// Block attempts to access files outside the images directory
	if (decodedPath.includes('..') || decodedPath.includes('~')) {
		console.log('❌ Security check failed for:', decodedPath)
		throw new Response('Invalid path', { status: 400 })
	}

	// Build full file system path
	// Database stores: "images/Photos Library.photoslibrary/originals/0/file.heic"
	// We need: "/project/public/images/Photos Library.photoslibrary/originals/0/file.heic"
	const fullPath = path.join(process.cwd(), 'public', decodedPath)
	console.log('📍 Full resolved path:', fullPath)

	try {
		// Verify the file actually exists before trying to process it
		console.log('📁 Checking if file exists at:', fullPath)
		if (!(await fileExists(fullPath))) {
			console.log('❌ File not found at:', fullPath)
			throw new Response('Image not found', { status: 404 })
		}

		console.log('✅ File exists, processing...')

		let imageBuffer: Buffer
		let contentType: string

		// Check if this is a video file that should be served directly
		const isVideoFile = fullPath.toLowerCase().match(/\.(mov|mp4|m4v)$/i)

		if (isVideoFile) {
			console.log('🎥 Serving video file directly:', path.basename(fullPath))
			// For video files, serve directly without conversion
			imageBuffer = await fs.readFile(fullPath)

			// Set appropriate content type based on extension
			const ext = path.extname(fullPath).toLowerCase()
			contentType = ext === '.mov' ? 'video/quicktime' :
						ext === '.mp4' ? 'video/mp4' :
						'video/mp4' // default fallback
		} else if (isHeifFile(fullPath)) {
			console.log('🔄 Converting HEIF file:', path.basename(fullPath))

			// Parse query parameters for image optimization
			// URL: /api/images/file.heic?width=300&quality=75
			const url = new URL(`http://localhost/api/images/${imagePath}`)
			const width = url.searchParams.get('width')
				? parseInt(url.searchParams.get('width')!)
				: undefined
			const quality = url.searchParams.get('quality')
				? parseInt(url.searchParams.get('quality')!)
				: 85

			// Convert HEIC → JPEG with optional resizing
			imageBuffer = await convertHeifToJpeg(fullPath, { width, quality })
			contentType = 'image/jpeg' // Always JPEG after conversion
			console.log('✅ HEIF conversion complete')
		} else {
			console.log('📷 Serving image directly:', path.basename(fullPath))
			// For non-HEIC files (JPEG, PNG, etc.), serve directly
			imageBuffer = await fs.readFile(fullPath)

			// Determine content type based on file extension
			const ext = path.extname(fullPath).toLowerCase()
			switch (ext) {
				case '.jpg':
				case '.jpeg':
					contentType = 'image/jpeg'
					break
				case '.png':
					contentType = 'image/png'
					break
				case '.gif':
					contentType = 'image/gif'
					break
				case '.webp':
					contentType = 'image/webp'
					break
				case '.tiff':
					contentType = 'image/tiff'
					break
				case '.dng':
					contentType = 'image/x-adobe-dng'
					break
				default:
					contentType = 'application/octet-stream'
			}
		}

		console.log('🎉 Serving image, size:', imageBuffer.length, 'bytes')

		// Return image with proper HTTP headers
		return new Response(new Uint8Array(imageBuffer), {
			headers: {
				'Content-Type': contentType,
				// Cache for 1 year (images rarely change)
				'Cache-Control': 'public, max-age=31536000',
				'Content-Length': imageBuffer.length.toString(),
			},
		})
	} catch (error) {
		console.error('💥 Error serving image:', error)
		throw new Response('Internal server error', { status: 500 })
	}
}
