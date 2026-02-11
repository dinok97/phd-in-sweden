import { getVacancyData } from './get-data.js';
import { formatDeadline } from '../../helpers/date-helper.js';

export default async function handler(req, res){
  try{
    const { q, field, university, page = '1', pageSize = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.max(1, Math.min(200, parseInt(pageSize, 10) || 20));

    const rows = await getVacancyData();
    // Normalize rows to a predictable shape (updated to new sheet columns)
    const normalized = rows.map((r, idx) => ({
      id: idx + 1,
      vacancy: r['Vacancy'] || r['Subject'] || null,
      institution: r['Institution'] || null,
      subject: r['Subject'] || null,
      deadline: formatDeadline(r['Deadline']) || null,
      link: r['Link'] || null,
      raw: r
    }));

    let filtered = normalized;
    if(q){
      const qLower = String(q).toLowerCase();
      filtered = filtered.filter(item =>
        (item.vacancy && String(item.vacancy).toLowerCase().includes(qLower)) ||
        (item.subject && String(item.subject).toLowerCase().includes(qLower)) ||
        (item.institution && String(item.institution).toLowerCase().includes(qLower))
      );
    }
    if(field){
      const fLower = String(field).toLowerCase();
      filtered = filtered.filter(item => (item.subject && String(item.subject).toLowerCase().includes(fLower)));
    }
    if(university){
      const uLower = String(university).toLowerCase();
      filtered = filtered.filter(item => (item.institution && String(item.institution).toLowerCase().includes(uLower)));
    }

    const total = filtered.length;
    const start = (pageNum - 1) * size;
    const items = filtered.slice(start, start + size);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json({ items, total, page: pageNum, pageSize: size });
  }catch(err){
    console.error(err);
    res.status(500).json({error: String(err)});
  }
}
