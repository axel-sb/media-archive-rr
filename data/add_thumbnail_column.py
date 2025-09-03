#!/usr/bin/env python3
"""Add thumbnail_path column to photos table"""

import sqlite3
import os

DB_PATH = "data/photos.db"

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if thumbnail_path column already exists
    cursor.execute("PRAGMA table_info(photos)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'thumbnail_path' not in columns:
        print("Adding thumbnail_path column to photos table...")
        cursor.execute("ALTER TABLE photos ADD COLUMN thumbnail_path TEXT")
        conn.commit()
        print("✅ Column added successfully")
    else:
        print("thumbnail_path column already exists")
    
    conn.close()

if __name__ == "__main__":
    main()