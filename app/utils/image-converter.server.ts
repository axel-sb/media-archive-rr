import fs from 'fs/promises'
import path from 'path'
import convert from 'heic-convert'
import sharp from 'sharp'
import NodeCache from 'node-cache'

// Cache converted images for 1 hour (3600 seconds)
// This prevents re-converting the same HEIC file repeatedly
// Cache key includes file path + conversion options for uniqueness
const imageCache = new NodeCache({ stdTTL: 3600 })

export interface ConversionOptions {
  quality?: number  // JPEG quality 1-100 (default 85)
  width?: number    // Target width in pixels (maintains aspect ratio)
  height?: number   // Target height in pixels (maintains aspect ratio)
}

/**
 * Converts HEIC/HEIF files to JPEG format with optional resizing
 *
 * Process:
 * 1. Check cache first (avoids expensive re-conversion)
 * 2. Read HEIC file from disk
 * 3. Convert HEIC → JPEG using heic-convert library
 * 4. Optionally resize using Sharp library
 * 5. Cache result for future requests
 * 6. Return JPEG buffer
 */
export async function convertHeifToJpeg(
  filePath: string,
  options: ConversionOptions = {}
): Promise<Buffer> {
  const { quality = 85, width, height } = options

  // Create unique cache key based on file path and all conversion options
  // This ensures different sizes/qualities of same image are cached separately
  const cacheKey = `${filePath}-${quality}-${width || 'auto'}-${height || 'auto'}`

  // Check if we've already converted this exact combination
  const cached = imageCache.get<Buffer>(cacheKey)
  if (cached) {
    console.log(`Cache hit for: ${path.basename(filePath)}`)
    return cached
  }

  console.log(`Converting HEIF: ${path.basename(filePath)}`)

  try {
    // Step 1: Read the original HEIC file from disk into memory
    const inputBuffer = await fs.readFile(filePath)

    // Step 2: Convert HEIC format to JPEG format
    // heic-convert expects quality as 0-1 range, we use 1-100 range
    const jpegBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: quality / 100 // Convert 85 → 0.85
    })

    // Convert ArrayBuffer to Node.js Buffer for further processing
    let processedBuffer = Buffer.from(jpegBuffer)

    // Step 3: Optional resizing using Sharp (high-quality image processing)
    if (width || height) {
      processedBuffer = await sharp(processedBuffer)
        .resize(width, height, {
          fit: 'inside',           // Maintain aspect ratio, fit within bounds
          withoutEnlargement: true // Don't make small images larger
        })
        .jpeg({ quality })         // Re-encode as JPEG with specified quality
        .toBuffer()
    }

    // Step 4: Cache the final result for future requests
    imageCache.set(cacheKey, processedBuffer)
    console.log(`Cached converted image: ${path.basename(filePath)}`)

    return processedBuffer
  } catch (error) {
    console.error('HEIF conversion failed:', error)
    throw new Error(`Failed to convert HEIF image: ${filePath}`)
  }
}

/**
 * Check if a file is a HEIC/HEIF format based on file extension
 * Apple's newer image format used by iPhones since iOS 11
 */
export function isHeifFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase()
  return ['.heic', '.heif'].includes(ext)
}

/**
 * Check if a file exists on disk without throwing an error
 * Used to verify image files exist before trying to serve them
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
