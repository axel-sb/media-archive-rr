# Personal Media Archive

A web application for searching and displaying personal media data stored in a SQLite database with metadata from Google Takeout.

## Project Structure

- **App Location**: `/Users/a/_current/media-archive`
- **Data Sources**:
  - Original SQLite database: `/Users/a/Library/Application Support/io.datasette.llm/logs.db`
  - Google Takeout metadata: `/Users/a/Library/Application Support/io.datasette.llm/takeout-media-data`

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Run database migrations:
   ```
   npx prisma migrate dev
   ```

3. Import data from source database and JSON files:
   ```
   node scripts/import-data.js
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Technology Stack

- **Frontend**: React, Remix
- **Database**: SQLite with Prisma ORM
- **Styling**: TailwindCSS

## Features

- Search media by date, location, and description keywords
- View media in a gallery format
- Display detailed metadata for each media item
- Map view for geotagged media

## Data Import Process

The application imports data from:
1. The original `logs.db` SQLite database (for file paths and descriptions)
2. Google Takeout JSON files (for metadata like dates, locations, etc.)

This data is consolidated into a single SQLite database using Prisma ORM.

# Welcome to Remix!

- 📖 [Remix docs](https://remix.run/docs)

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
