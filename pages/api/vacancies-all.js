import { getVacancyData } from '../../get-data.js';
import { formatDeadline } from '../helper/date-helper.js';

export default async function handler(req, res){
  try{
    const rows = await getVacancyData();
    const normalized = rows.map((r, idx) => ({
      id: idx + 1,
      vacancy: r['Vacancy'] || r['Subject'] || null,
      institution: r['Institution'] || null,
      subject: r['Subject'] || null,
      deadline: formatDeadline(r['Deadline']) || null,
      link: r['Link'] || null,
      raw: r
    }));
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json({ items: normalized });
  }catch(err){
    console.error(err);
    res.status(500).json({error: String(err)});
  }
}
