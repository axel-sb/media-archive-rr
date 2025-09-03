#!/usr/bin/env python3
"""Remove database entries for files that no longer exist in the Photos Library"""

import sqlite3
import os
from pathlib import Path

DB_PATH = "data/photos.db"
PHOTOS_LIBRARY_ROOT = "/Volumes/Samsung/Pictures/Photos Library.photoslibrary"

def check_file_exists(db_path):
    """Check if the actual file exists in the Photos Library"""
    if not db_path:
        return False
    
    # Convert database path to actual file path
    # Database: "images/Photos Library.photoslibrary/originals/0/file.heic"
    # Actual: "/Volumes/Samsung/Pictures/Photos Library.photoslibrary/originals/0/file.heic"
    if db_path.startswith("images/Photos Library.photoslibrary/"):
        actual_path = db_path.replace("images/Photos Library.photoslibrary/", 
                                    f"{PHOTOS_LIBRARY_ROOT}/")
        return os.path.exists(actual_path)
    
    return False

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all photos with their paths
    cursor.execute("SELECT uuid, path, original_filename FROM photos")
    photos = cursor.fetchall()
    
    missing_files = []
    total_checked = 0
    
    print(f"🔍 Checking {len(photos)} photos for missing files...")
    
    for uuid, path, filename in photos:
        total_checked += 1
        
        if not check_file_exists(path):
            missing_files.append((uuid, path, filename))
            
        if total_checked % 100 == 0:
            print(f"📊 Checked {total_checked}/{len(photos)} files...")
    
    print(f"\n❌ Found {len(missing_files)} missing files")
    
    if missing_files:
        print("\nMissing files:")
        for uuid, path, filename in missing_files[:10]:  # Show first 10
            print(f"  - {filename} ({uuid})")
        
        if len(missing_files) > 10:
            print(f"  ... and {len(missing_files) - 10} more")
        
        confirm = input(f"\n⚠️  Delete {len(missing_files)} missing entries from database? (y/N): ")
        
        if confirm.lower() == 'y':
            # Delete from all related tables to maintain referential integrity
            for uuid, _, _ in missing_files:
                cursor.execute("DELETE FROM keywords WHERE photo_uuid = ?", (uuid,))
                cursor.execute("DELETE FROM photo_albums WHERE photo_uuid = ?", (uuid,))
                cursor.execute("DELETE FROM photo_persons WHERE photo_uuid = ?", (uuid,))
                cursor.execute("DELETE FROM faces WHERE photo_uuid = ?", (uuid,))
                cursor.execute("DELETE FROM labels WHERE photo_uuid = ?", (uuid,))
                cursor.execute("DELETE FROM places WHERE photo_uuid = ?", (uuid,))
                cursor.execute("DELETE FROM place_names WHERE photo_uuid = ?", (uuid,))
                cursor.execute("DELETE FROM place_addresses WHERE photo_uuid = ?", (uuid,))
                cursor.execute("DELETE FROM photos WHERE uuid = ?", (uuid,))
            
            conn.commit()
            print(f"✅ Deleted {len(missing_files)} missing entries and all related data")
        else:
            print("❌ Cleanup cancelled")
    else:
        print("✅ No missing files found!")
    
    conn.close()

if __name__ == "__main__":
    main()