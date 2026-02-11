import { getUniversityData } from './get-data.js';

export default async function handler(req, res){
  try{
    const rows = await getUniversityData();
    // produce a small list of { name, location, link }
    const list = rows.map((r, idx) => ({
      id: idx + 1,
      name: r['Institution'] || null,
      location: r['Location'] || null,
      link: r['Link'] || null,
      raw: r
    }));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ items: list });
  }catch(err){
    console.error(err);
    res.status(500).json({error: String(err)});
  }
}
