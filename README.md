# Personal Media Archive

A web application for searching and displaying personal media data stored in a SQLite database with metadata from the Apple Photos.app database @'/Volumes/Samsung/Pictures/Photos Library.photoslibrary/database'.

## Technology Stack

- **Data Sourcing** Python v3.13 with 'osxphotos' library-
- **Database**: SQLite with Prisma ORM
- **Frontend**: React Router v7
- **Styling**: TailwindCSS

## Data Import

- Ensure SQLite file is not locked by other processes
- Confirm sufficient disk space for database operation
- If Apple Photos permission popup appears, approve access

- Navigate to working directory:
  ```bash
  cd /Users/a/_current/media-archive
  ```
- Run command from terminal
  ```bash
  python3 data/get_all_data.py --exclude-unknown-persons --sqlite data/photos.db
  ```
- Verify database updates:
  ```bash
  sqlite3 data/photos.db "SELECT COUNT(*) FROM photos;"
  ```
- Check schema compliance:
  ```bash
  sqlite3 data/photos.db ".schema"
  ```

## Features

- Search media by date, location, Apple machine-learning generated lables etc.
- View media in a gallery format
- Display detailed metadata for each media item
- Map view for geotagged media
