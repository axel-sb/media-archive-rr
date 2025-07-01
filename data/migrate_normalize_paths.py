import sqlite3

# Path to your database
DB_PATH = "data/photos.db"

# Prefixes
SOURCE_PREFIX = "/Volumes/Samsung/Pictures/Photos Library.photoslibrary/"
WEB_PREFIX = "images/Photos Library.photoslibrary/"

def normalize_path(p):
    if p and p.startswith(SOURCE_PREFIX):
        return p.replace(SOURCE_PREFIX, WEB_PREFIX)
    return p

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Select all rows
    cursor.execute("SELECT uuid, path, path_edited FROM photos")
    rows = cursor.fetchall()

    updated = 0
    for uuid, path, path_edited in rows:
        new_path = normalize_path(path)
        new_path_edited = normalize_path(path_edited)
        if new_path != path or new_path_edited != path_edited:
            cursor.execute(
                "UPDATE photos SET path = ?, path_edited = ? WHERE uuid = ?",
                (new_path, new_path_edited, uuid)
            )
            updated += 1

    conn.commit()
    conn.close()
    print(f"Updated {updated} rows in 'photos' table.")

if __name__ == "__main__":
    main()