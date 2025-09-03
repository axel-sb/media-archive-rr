#!/usr/bin/env python3
"""Generate thumbnails for all HEIC images in the database"""

import sqlite3
import os
import sys
from pathlib import Path
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Add the app utils to path so we can use the conversion functions
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'app', 'utils'))

DB_PATH = "data/photos.db"
THUMBNAIL_DIR = "public/thumbnails"
THUMBNAIL_WIDTH = 300
MAX_WORKERS = 4  # Adjust based on your CPU cores

def ensure_thumbnail_dir():
    """Create thumbnail directory if it doesn't exist"""
    Path(THUMBNAIL_DIR).mkdir(parents=True, exist_ok=True)

def generate_thumbnail_with_sharp(input_path, output_path, width=300):
    """Generate thumbnail using Node.js Sharp via subprocess"""
    script = f"""
    const sharp = require('sharp');
    const fs = require('fs');
    const convert = require('heic-convert');
    
    async function generateThumbnail() {{
        try {{
            let buffer;
            
            // Check if input is HEIC
            if ('{input_path}'.toLowerCase().endsWith('.heic') || '{input_path}'.toLowerCase().endsWith('.heif')) {{
                // Convert HEIC to JPEG first
                const inputBuffer = fs.readFileSync('{input_path}');
                const jpegBuffer = await convert({{
                    buffer: inputBuffer,
                    format: 'JPEG',
                    quality: 0.8
                }});
                buffer = Buffer.from(jpegBuffer);
            }} else {{
                // Read regular image file
                buffer = fs.readFileSync('{input_path}');
            }}
            
            // Generate thumbnail
            await sharp(buffer)
                .resize({width}, null, {{
                    fit: 'inside',
                    withoutEnlargement: true
                }})
                .jpeg({{ quality: 85 }})
                .toFile('{output_path}');
                
            console.log('SUCCESS');
        }} catch (error) {{
            console.error('ERROR:', error.message);
            process.exit(1);
        }}
    }}
    
    generateThumbnail();
    """
    
    try:
        result = subprocess.run(
            ['node', '-e', script],
            capture_output=True,
            text=True,
            timeout=30  # 30 second timeout per image
        )
        
        if result.returncode == 0 and 'SUCCESS' in result.stdout:
            return True
        else:
            print(f"❌ Sharp conversion failed for {input_path}: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"⏰ Timeout generating thumbnail for {input_path}")
        return False
    except Exception as e:
        print(f"❌ Error generating thumbnail for {input_path}: {e}")
        return False

def process_photo(photo_data):
    """Process a single photo to generate thumbnail"""
    uuid, path, original_filename = photo_data
    
    if not path:
        return uuid, None, "No path"
    
    # Build full source path
    full_source_path = os.path.join("public", path)
    
    if not os.path.exists(full_source_path):
        return uuid, None, f"Source file not found: {full_source_path}"
    
    # Generate thumbnail filename
    file_ext = Path(path).suffix.lower()
    if file_ext in ['.heic', '.heif']:
        thumbnail_filename = f"{uuid}.jpg"  # Always JPEG for thumbnails
    else:
        thumbnail_filename = f"{uuid}.jpg"  # Standardize on JPEG
    
    thumbnail_path = os.path.join(THUMBNAIL_DIR, thumbnail_filename)
    
    # Skip if thumbnail already exists
    if os.path.exists(thumbnail_path):
        # Return relative path for database
        relative_thumbnail_path = f"thumbnails/{thumbnail_filename}"
        return uuid, relative_thumbnail_path, "Already exists"
    
    # Generate thumbnail
    success = generate_thumbnail_with_sharp(full_source_path, thumbnail_path, THUMBNAIL_WIDTH)
    
    if success:
        relative_thumbnail_path = f"thumbnails/{thumbnail_filename}"
        return uuid, relative_thumbnail_path, "Generated"
    else:
        return uuid, None, "Generation failed"

def main():
    ensure_thumbnail_dir()
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all photos that need thumbnails
    cursor.execute("""
        SELECT uuid, path, original_filename 
        FROM photos 
        WHERE path IS NOT NULL 
        AND (thumbnail_path IS NULL OR thumbnail_path = '')
        ORDER BY date DESC
    """)
    
    photos = cursor.fetchall()
    total_photos = len(photos)
    
    print(f"🖼️  Found {total_photos} photos needing thumbnails")
    print(f"🔧 Using {MAX_WORKERS} worker threads")
    print(f"📁 Thumbnails will be saved to: {THUMBNAIL_DIR}")
    
    if total_photos == 0:
        print("✅ All photos already have thumbnails!")
        return
    
    # Process photos in parallel
    generated_count = 0
    skipped_count = 0
    failed_count = 0
    
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all jobs
        future_to_photo = {executor.submit(process_photo, photo): photo for photo in photos}
        
        # Process completed jobs
        for i, future in enumerate(as_completed(future_to_photo), 1):
            uuid, thumbnail_path, status = future.result()
            
            # Update database if thumbnail was generated
            if thumbnail_path:
                cursor.execute(
                    "UPDATE photos SET thumbnail_path = ? WHERE uuid = ?",
                    (thumbnail_path, uuid)
                )
                
                if status == "Generated":
                    generated_count += 1
                else:  # "Already exists"
                    skipped_count += 1
            else:
                failed_count += 1
            
            # Progress update
            if i % 10 == 0 or i == total_photos:
                elapsed = time.time() - start_time
                rate = i / elapsed if elapsed > 0 else 0
                eta = (total_photos - i) / rate if rate > 0 else 0
                
                print(f"📊 Progress: {i}/{total_photos} ({i/total_photos*100:.1f}%) "
                      f"| Generated: {generated_count} | Skipped: {skipped_count} | Failed: {failed_count} "
                      f"| Rate: {rate:.1f}/s | ETA: {eta:.0f}s")
    
    # Commit all database updates
    conn.commit()
    conn.close()
    
    total_time = time.time() - start_time
    print(f"\n✅ Thumbnail generation complete!")
    print(f"📊 Generated: {generated_count} | Skipped: {skipped_count} | Failed: {failed_count}")
    print(f"⏱️  Total time: {total_time:.1f}s")

if __name__ == "__main__":
    main()