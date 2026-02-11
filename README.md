# PhD in Sweden Website

Quick start

1. Copy your Google Sheets link or ID into `.env.local` as `SHEET_LINK`.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

Files of interest

- `pages/api/get-data.js` — existing data fetcher (re-used by API routes)
- `pages/api/vacancies-all.js` — returns all vacancy list
- `pages/api/universities.js` — returns all university list
- `pages/index.js` — home/listing UI

Notes

This is a starting point. You should provide the `SHEET_LINK` env var (Google Sheet must be published or public). See `.env.example`.
