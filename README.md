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

## Overall Process Summary:

1.  **Database Setup**: Python script extracts Apple Photos metadata, normalizes paths to point to symlinked directory
2.  **Component Request**: `OptimizedImage` converts database path to API route with optimization params
3.  **Route Handler**: `/api/images/*` receives request, validates path, checks if file exists
4.  **Format Detection**: Check file extension to determine if HEIC conversion needed
5.  **Conversion**: If HEIC, convert to JPEG with optional resizing using Sharp
6.  **Caching**: Store converted result in memory cache to avoid re-processing
7.  **Response**: Return image buffer with proper HTTP headers for browser caching
8.  **Display**: Browser receives optimized image and displays it

The beauty of this system is that HEIC files are transparently converted to JPEG, so your web app works seamlessly with Apple's newer image format while maintaining broad browser compatibility!