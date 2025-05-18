// Import script for media archive data
import { PrismaClient }  from "./generated"
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import process from 'process';

// Initialize Prisma client
const prisma = new PrismaClient();

// Path to the source database and JSON files (using absolute paths since we moved the app)
const SOURCE_DB_PATH = '/Users/a/Library/Application Support/io.datasette.llm/logs.db';
const JSON_FILES_PATH = '/Users/a/Library/Application Support/io.datasette.llm/takeout-media-data';

// Connect to the source database
let sourceDb;
try {
  sourceDb = new Database(SOURCE_DB_PATH, { readonly: true });
  console.log('Connected to source database');
} catch (err) {
  console.error('Error opening source database:', err.message);
  process.exit(1);
}

// Main import function
async function importData() {
  try {
    console.log('Starting data import...');

    // Get all media files from the attachments table using a prepared statement
    const getMediaFiles = sourceDb.prepare(`
      SELECT a.id, a.type, a.path, r.response
      FROM attachments a
      LEFT JOIN prompt_attachments pa ON a.id = pa.attachment_id
      LEFT JOIN responses r ON pa.response_id = r.id
      WHERE a.type LIKE 'image/%' OR a.type LIKE 'video/%'
    `);

    const mediaFiles = getMediaFiles.all();
    console.log(`Found ${mediaFiles.length} media files in source database`);

    let processedCount = 0;
    let metadataFoundCount = 0;
    let metadataMissingCount = 0;

    // Process each media file
    for (const file of mediaFiles) {
      const filename = path.basename(file.path);
      const jsonFilePath = path.join(JSON_FILES_PATH, `${filename}.supplemental-metadata.json`);

      // Check if we have metadata for this file
      let metadata = {};
      if (fs.existsSync(jsonFilePath)) {
        try {
          const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
          metadata = JSON.parse(jsonData);
          metadataFoundCount++;
          console.log(`Found metadata for ${filename}`);
        } catch (err) {
          console.warn(`Error reading metadata for ${filename}:`, err.message);
          metadataMissingCount++;
        }
      } else {
        console.log(`No metadata file found for ${filename}`);
        metadataMissingCount++;
      }

      try {
        // Create the media file record
        await prisma.mediaFile.create({
          data: {
            sourceId: file.id,
            filename: filename,
            filePath: file.path,
            fileType: file.type,
            description: file.response ? extractDescription(file.response) : null,
            createdAt: metadata.creationTime ? new Date(parseInt(metadata.creationTime.timestamp) * 1000) : new Date(),
            takenAt: metadata.photoTakenTime ? new Date(parseInt(metadata.photoTakenTime.timestamp) * 1000) : null,
            latitude: metadata.geoData?.latitude || null,
            longitude: metadata.geoData?.longitude || null,
            altitude: metadata.geoData?.altitude || null,
            views: metadata.imageViews ? parseInt(metadata.imageViews) : 0,
            googleUrl: metadata.url || null,
            deviceType: metadata.googlePhotosOrigin?.mobileUpload?.deviceType || null,
          }
        });

        processedCount++;
        console.log(`Imported ${filename} (${processedCount}/${mediaFiles.length})`);
      } catch (error) {
        console.error(`Error importing ${filename}:`, error.message);
      }
    }

    console.log('\nImport Summary:');
    console.log(`Total files processed: ${processedCount}`);
    console.log(`Files with metadata: ${metadataFoundCount}`);
    console.log(`Files without metadata: ${metadataMissingCount}`);
    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await prisma.$disconnect();
    sourceDb.close();
  }
}

// Helper function to extract description from response text
function extractDescription(response) {
  // Simple extraction - can be improved based on actual response format
  if (!response) return null;

  // If response contains "The image shows" or similar phrases, extract that part
  const descriptionMatch = response.match(/The image shows[^.]+\./i);
  if (descriptionMatch) {
    return descriptionMatch[0].trim();
  }

  // Otherwise return a portion of the response
  return response.substring(0, 500).trim();
}

// Run the import
importData().catch(console.error);

/**
 *  * *****************************
  *  * *****************************
  *  */
 */