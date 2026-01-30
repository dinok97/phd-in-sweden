# PhD in Sweden Website

Quick start

1. Copy your Google Sheets link or ID into `.env.local` as `SHEET_LINK`.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

Files of interest

- `get-data.js` — existing data fetcher (re-used by API routes)
- `pages/api/vacancies.js` — returns vacancy list with filtering & pagination
- `pages/api/universities.js` — returns university list
- `pages/index.js` — home/listing UI
- `pages/listing/[id].js` — listing detail page

Notes

This is a starting point. You should provide the `SHEET_LINK` env var (Google Sheet must be published or public). See `.env.example`.
