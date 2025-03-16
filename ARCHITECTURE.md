# Application Architecture

## Overview

This personal media archive application is designed as a full-stack web application using React, Remix, and SQLite with Prisma ORM. It provides a user-friendly interface for browsing, searching, and viewing personal media collections with their associated metadata.

## System Components

### 1. Data Layer

#### Database
- **Technology**: SQLite with Prisma ORM
- **Database File**: `media_archive.db`
- **Models**:
  - `MediaFile`: Stores information about each media file including file paths, metadata, and descriptions
  - `Tag`: Represents categories or labels that can be assigned to media files
  - `TagsOnMediaFiles`: Junction table for the many-to-many relationship between media files and tags

#### Data Import
- **Script**: `scripts/import-data.js`
- **Source Data**:
  - Original SQLite database (`logs.db`) containing file paths and descriptions
  - Google Takeout JSON files with metadata (dates, locations, etc.)
- **Process**:
  1. Reads media files from the source database
  2. Finds corresponding metadata from JSON files
  3. Consolidates the data
  4. Stores it in the Prisma-managed database

### 2. Backend Layer

#### API Routes
- **Technology**: Remix loaders and actions
- **Key Functions**:
  - Fetch media files with filtering options
  - Retrieve individual media details
  - Handle search queries
  - Manage tags and categories

### 3. Frontend Layer

#### UI Components
- **Technology**: React with TailwindCSS
- **Key Components**:
  - `Layout`: Main application layout with header, footer, and navigation
  - `SearchForm`: Form for filtering media by various criteria
  - `MediaGrid`: Grid display of media items
  - `MediaDetail`: Detailed view of a single media item
  - `MapView`: Geographic visualization of media (to be implemented)

#### Routes
- `/`: Home page with search interface and recent media
- `/gallery`: Grid display of all media with sorting and filtering
- `/map`: Map view for geotagged media
- `/media/:id`: Detailed view of individual media files

## Data Flow

1. **Data Import**:
   ```
   Source Data (logs.db, JSON files) → import-data.js → media_archive.db
   ```

2. **Data Retrieval**:
   ```
   User Request → Route → Loader → Prisma Query → Database → Response → UI Rendering
   ```

3. **Search Flow**:
   ```
   User Input → Search Form → Form Submission → Loader with Filters → Prisma Query with Filters → Filtered Results → UI Update
   ```

## Folder Structure

```
/media-archive/
├── app/                # Application source code
│   ├── routes/         # Application routes
│   │   ├── _index.tsx  # Home page
│   │   ├── gallery.tsx # Gallery view
│   │   ├── map.tsx     # Map view
│   │   └── media.$id.tsx # Media detail view
│   ├── components/     # Reusable UI components (to be implemented)
│   └── tailwind.css    # Tailwind styles
├── prisma/             # Prisma ORM configuration
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── scripts/            # Utility scripts
│   └── import-data.js  # Data import script
└── public/             # Static assets
```

## Technology Stack

- **Frontend**: React, Remix, TailwindCSS
- **Backend**: Node.js, Remix
- **Database**: SQLite
- **ORM**: Prisma
- **Build Tools**: Vite
- **Other Libraries**:
  - sqlite3 (for data import)
  - To be added: Mapping library (Leaflet or Google Maps)
  - To be added: Media player/viewer components

## Future Enhancements

- Authentication system for multi-user support
- Tagging and categorization system
- Advanced search capabilities
- Image processing (thumbnails, previews)
- Analytics and usage tracking