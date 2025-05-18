#!/usr/bin/env python3
"""
Import descriptions from CSV file into Photos database.
"""

import csv
import os
import sqlite3
import sys
from pathlib import Path

def main():
    # Get the path to the descriptions CSV file
    script_dir = Path(__file__).parent
    descriptions_csv = script_dir / "descriptions.csv"

    # Get the path to the Photos database
    photos_db = script_dir / "photos.db"

    if not descriptions_csv.exists():
        print(f"Error: Descriptions CSV file not found at {descriptions_csv}")
        sys.exit(1)

    if not photos_db.exists():
        print(f"Error: Photos database not found at {photos_db}")
        sys.exit(1)

    print(f"Importing descriptions from {descriptions_csv} to {photos_db}")

    # Read the descriptions from the CSV file
    descriptions = {}
    with open(descriptions_csv, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        next(reader)  # Skip header row
        for row in reader:
            if len(row) < 2:
                continue

            original_filename = row[0]
            description = row[1].strip()

            # Skip empty descriptions
            if not description:
                continue

            # Get just the filename without the path
            filename = os.path.basename(original_filename)

            # Store the description
            descriptions[filename] = description

    print(f"Read {len(descriptions)} descriptions from CSV file")

    # Connect to the Photos database
    conn = sqlite3.connect(photos_db)
    cursor = conn.cursor()

    # Check if the description column exists in the photos table
    cursor.execute("PRAGMA table_info(photos)")
    columns = cursor.fetchall()
    description_column_exists = any(column[1] == "description" for column in columns)

    if not description_column_exists:
        print("Adding description column to photos table")
        cursor.execute("ALTER TABLE photos ADD COLUMN description TEXT")

    # Update the descriptions in the database
    updated_count = 0
    for filename, description in descriptions.items():
        # Try to find the photo by original_filename
        cursor.execute("SELECT uuid FROM photos WHERE original_filename LIKE ?", (f"%{filename}%",))
        result = cursor.fetchone()

        if result:
            uuid = result[0]
            cursor.execute("UPDATE photos SET description = ? WHERE uuid = ?", (description, uuid))
            updated_count += 1

    print(f"Updated {updated_count} photos with descriptions")

    # Commit the changes and close the connection
    conn.commit()
    conn.close()

    print("Done!")

if __name__ == "__main__":
    main()
