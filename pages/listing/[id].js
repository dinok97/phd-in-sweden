import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function formatDeadline(d){
  if(!d) return '—';
  const s = String(d);
  const m = s.match(/^Date\(\s*(\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\s*\)$/i);
  if(m){
    const year = m[1];
    const month = String(m[2]).padStart(2,'0');
    const day = String(m[3]).padStart(2,'0');
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(s);
  if(!isNaN(parsed)){
    const y = parsed.getFullYear();
    const mm = String(parsed.getMonth()+1).padStart(2,'0');
    const dd = String(parsed.getDate()).padStart(2,'0');
    return `${y}-${mm}-${dd}`;
  }
  return s;
}

export default function Listing(){
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!id) return;
    setLoading(true);
    (async()=>{
      // fetch all vacancies and find id
      const res = await fetch('/api/vacancies-all');
      const j = await res.json();
      const found = (j.items || []).find(it => String(it.id) === String(id));
      setItem(found || null);
      setLoading(false);
    })();
  }, [id]);

  if(!id) return null;

  return (
    <div className="container">
      <div style={{marginTop:24}}>
        <Link href="/">← Back to listings</Link>
      </div>

      <div style={{marginTop:12}} className="card">
        {loading && <div>Loading…</div>}
        {!loading && !item && <div>Not found</div>}
        {item && (
          <div>
            <h1 style={{marginTop:0}}>{item.vacancy || item.subject}</h1>

            <div className="institution-line">
              <svg className="building-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 11l9-6 9 6v9a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1v-9zM9 19h6v1H9v-1z" fill="currentColor"/></svg>
              <div style={{fontWeight:600}}>{item.institution || '—'}</div>
            </div>

            <div className="card-meta subject-line">{item.subject || '—'}</div>

            <div style={{marginTop:12}}>
              <p><strong>Deadline:</strong> {formatDeadline(item.deadline)}</p>
              <p><strong>Raw data:</strong></p>
              <pre style={{whiteSpace:'pre-wrap',background:'rgba(0,0,0,0.05)',padding:12,borderRadius:8}}>{JSON.stringify(item.raw,null,2)}</pre>
            </div>

            {/* Apply button: prefer normalized `link` field, fall back to raw Link */}
            <div style={{marginTop:12}}>
              {(item.link || item.raw && (item.raw['Link'] || item.raw['URL'] || item.raw['Web'])) ? (
                <a className="btn" href={item.link || item.raw['Link'] || item.raw['URL'] || item.raw['Web']} target="_blank" rel="noopener noreferrer">Apply</a>
              ) : (
                <button className="btn" disabled>Apply (no external link)</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
