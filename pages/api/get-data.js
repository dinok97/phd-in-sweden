/*
Simple Node.js script to fetch data from a publicly-accessible Google Sheet.

Notes:
- This uses the public `gviz` JSON endpoint (no API key required) and works for sheets shared publicly or "Published to the web".
- Requires Node 18+ (global fetch). If using older Node, install `node-fetch` and uncomment the fallback below.
*/

// If your Node.js doesn't have global `fetch`, uncomment this line after installing node-fetch:
// const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

// Read spreadsheet ID and sheet name from environment variables if provided,
// otherwise fall back to positional command-line arguments for compatibility.
const sheetLink = process.env.SHEET_LINK || process.env.SPREADSHEET_LINK || process.argv[2];
const vacancySheetName = process.env.VACANCY_SHEET_NAME || process.argv[3];
const universitySheetName = process.env.UNIVERSITY_SHEET_NAME || process.argv[4];

if (!sheetLink) {
  console.error('Usage: set environment variable SHEET_LINK (and optionally SHEET_NAME) or pass them as arguments:');
  console.error('  SHEET_LINK=1Bxi... SHEET_NAME="Sheet1" node get-data.js');
  console.error('  or: node get-data.js <SPREADSHEET_LINK_or_URL> [SHEET_NAME]');
  process.exit(1);
}

function extractId(input) {
  // Accept either raw ID or full URL
  const idMatch = input.match(/[-\w]{44,}/) || input.match(/spreadsheets\/d\/([-\w]+)/);
  if (idMatch) return idMatch[0];
  // fallback: if it looks like an ID (short), return as-is
  return input;
}

async function fetchGviz(spreadsheetId, sheet) {
  const base = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
  const url = sheet ? `${base}&sheet=${encodeURIComponent(sheet)}` : base;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  // Response looks like: google.visualization.Query.setResponse({...});
  const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
  if (!m) throw new Error('Unexpected GViz response format');
  const obj = JSON.parse(m[1]);
  return obj.table;
}

function tableToObjects(table) {
  const cols = (table.cols || []).map(c => c.label || c.id || '');
  const rows = (table.rows || []).map(r => {
    const obj = {};
    for (let i = 0; i < cols.length; i++) {
      const cell = r.c && r.c[i];
      obj[cols[i] || `col${i}`] = cell ? (cell.v !== undefined ? cell.v : null) : null;
    }
    return obj;
  });
  return rows;
}

function reformatVacancyList(rows) {
    // Adjust vacancy list structure due to merged cells in the original sheet
    const adjustedRows = rows.map(row => {
        const obj = {};
        for (let i=0; i < Object.keys(row).length; i++) {
            if (i == 0) continue;
            else if (i == 1) obj['Vacancy'] = row[Object.keys(row)[i]];
            else if (i == 2) obj['Institution'] = row[Object.keys(row)[i]];
            else if (i == 3) obj['Subject'] = row[Object.keys(row)[i]];
            else if (i == 4) obj['Deadline'] = row[Object.keys(row)[i]];
            else if (i == 5) obj['Link'] = row[Object.keys(row)[i]];
        }
        return obj;
    });
    return adjustedRows;
}

function reformatUniversityList(rows) {
    // Adjust university list structure due to merged cells in the original sheet
    const adjustedRows = rows.map(row => {
        const obj = {};
        for (let i=0; i < Object.keys(row).length; i++) {
            if (i == 0) continue;
            else if (i == 1) continue;
            else if (i == 2) obj['Location'] = row[Object.keys(row)[i]];
            else if (i == 3) obj['Institution'] = row[Object.keys(row)[i]];
            else if (i == 4) obj['Link'] = row[Object.keys(row)[i]];
        }
        return obj;
    });
    return adjustedRows;
}

export async function getVacancyData(){
  const id = extractId(sheetLink);
  const table = await fetchGviz(id, vacancySheetName);
  const rows = tableToObjects(table);
  return reformatVacancyList(rows).slice(2, ); // skip first two rows
}

export async function getUniversityData(){
  const id = extractId(sheetLink);
  const table = await fetchGviz(id, universitySheetName);
  const rows = tableToObjects(table);
  return reformatUniversityList(rows).slice(1, ); // skip first row
}
