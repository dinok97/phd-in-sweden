import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
            <div className="card-meta">{item.institution} · {item.subject}</div>
            <div style={{marginTop:12}}>
              <p><strong>Deadline:</strong> {item.deadline || '—'}</p>
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
