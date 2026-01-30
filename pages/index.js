import { useEffect, useState } from 'react';
import Link from 'next/link';

function SearchBar({ onSearch, fields = [], universities = [], debounceMs = 300 }){
  const [q, setQ] = useState('');
  const [field, setField] = useState('');
  const [university, setUniversity] = useState('');

  // Reactive search: debounce user input and call onSearch
  useEffect(() => {
    const id = setTimeout(() => {
      onSearch({ q, field, university });
    }, debounceMs);
    return () => clearTimeout(id);
  }, [q, field, university, debounceMs, onSearch]);

  function submit(e){
    e && e.preventDefault();
    // immediate search on form submit
    onSearch({ q, field, university });
  }

  return (
    <form className="searchbar" onSubmit={submit}>
      <input aria-label="Search" className="input" placeholder="Search universities, subject, vacancies..." value={q} onChange={e=>setQ(e.target.value)} />
      <select className="input" value={field} onChange={e=>setField(e.target.value)}>
        <option value="">All fields</option>
        {fields.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
      <select className="input" value={university} onChange={e=>setUniversity(e.target.value)}>
        <option value="">All universities</option>
        {universities.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <button type="submit" className="btn">Search</button>
    </form>
  );
}

function VacancyCard({ v }){
  return (
    <div className="card" style={{marginBottom:12}}>
      <div className="card-title"><Link href={`/listing/${v.id}`}>{v.vacancy || v.subject || 'Untitled'}</Link></div>
      <div className="card-meta">{v.institution} · {v.subject}</div>
      <div className="card-meta">Deadline: {v.deadline || '—'}</div>
    </div>
  );
}

export default function Home(){
  const [vacancies, setVacancies] = useState([]); // visible page
  const [allVacancies, setAllVacancies] = useState([]); // full dataset
  const [filteredVacancies, setFilteredVacancies] = useState([]); // filtered dataset
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q:'', field:'', university:'' });
  const [fieldsList, setFieldsList] = useState([]);
  const [universitiesList, setUniversitiesList] = useState([]);
  const [universityLinks, setUniversityLinks] = useState([]);

  async function fetchAll(){
    setLoading(true);
    try{
      const res = await fetch('/api/vacancies-all');
      const json = await res.json();
      const items = json.items || [];
      setAllVacancies(items);
      setFilteredVacancies(items);
      setVacancies(items.slice(0, PAGE_SIZE));
      setPage(1);
      setHasMore(items.length > PAGE_SIZE);

      // derive facets from full data (updated column names)
      const uniqUnis = Array.from(new Set(items.map(i=>i.institution || i.raw?.Institution).filter(Boolean))).slice(0,50);
      setUniversitiesList(uniqUnis);
      const uniqFields = Array.from(new Set(items.map(i=>i.subject || i.raw?.Subject).filter(Boolean))).slice(0,50);
      setFieldsList(uniqFields);

      // fetch university link list for sidebar (from /api/universities)
      try{
        const r2 = await fetch('/api/universities');
        const j2 = await r2.json();
        const uniItems = (j2.items || []).filter(u => u.link).slice(0,40);
        setUniversityLinks(uniItems);
      }catch(err){
        console.error('fetch universities', err);
      }
    }catch(err){
      console.error('fetchAll error', err);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchAll();
  }, []);

  function applyFilters(list, f){
    if(!f) return list;
    const q = (f.q || '').toLowerCase();
    const field = (f.field || '').toLowerCase();
    const university = (f.university || '').toLowerCase();

    return list.filter(item => {
      if(q){
        const matchQ = (item.vacancy && String(item.vacancy).toLowerCase().includes(q)) ||
                       (item.subject && String(item.subject).toLowerCase().includes(q)) ||
                       (item.institution && String(item.institution).toLowerCase().includes(q));
        if(!matchQ) return false;
      }
      if(field){
        const fMatch = (item.subject && String(item.subject).toLowerCase().includes(field));
        if(!fMatch) return false;
      }
      if(university){
        if(!(item.institution && String(item.institution).toLowerCase().includes(university))) return false;
      }
      return true;
    });
  }

  function handleSearch(f){
    setFilters(f);
    const filtered = applyFilters(allVacancies, f);
    setFilteredVacancies(filtered);
    setVacancies(filtered.slice(0, PAGE_SIZE));
    setPage(1);
    setHasMore(filtered.length > PAGE_SIZE);
  }

  function loadMore(){
    const nextPage = page + 1;
    const start = (nextPage - 1) * PAGE_SIZE;
    const nextItems = filteredVacancies.slice(start, start + PAGE_SIZE);
    setVacancies(prev => [...prev, ...nextItems]);
    setPage(nextPage);
    setHasMore(filteredVacancies.length > nextPage * PAGE_SIZE);
  }

  return (
    <div className="container">
      <header className="site-header">
        <div className="logo" aria-label="Site logo">
          {/* Add your logo at /public/logo.svg or replace with your own markup */}
          <img src="/logo.svg" alt="PhD in Sweden" style={{height:40}} onError={(e)=>{e.target.style.display='none'}} />
          <strong style={{marginLeft:8}}>PhD in Sweden</strong>
        </div>
        <nav style={{marginLeft:'auto'}} />
      </header>

      <div className="hero">
        <h1 style={{margin:0}}>Find PhD positions in Sweden</h1>
        <p style={{color:'var(--muted)'}}>Browse and apply to PhD vacancies across Swedish universities.</p>
        <div style={{marginTop:16}}>
          <SearchBar onSearch={handleSearch} fields={fieldsList} universities={universitiesList} />
        </div>
      </div>

      <div className="grid">
        <div>
          <div className="card">
            <h3 style={{marginTop:0}}>Filters</h3>
            <p className="card-meta">Field, region, date posted and more coming soon.</p>
          </div>

          <div className="card" style={{marginTop:12}}>
            <h4 style={{marginTop:0}}>Universities</h4>
            <p className="card-meta">Quick links to university vacancy pages</p>
            <ul className="university-list" style={{marginTop:12, paddingLeft:0}}>
              {universityLinks.length === 0 && <li className="card-meta">No links available</li>}
              {universityLinks.map(u => (
                <li key={u.id} className="university-item" style={{listStyle:'none', marginBottom:8}}>
                  <a href={u.link} target="_blank" rel="noopener noreferrer" style={{color:'var(--accent)', textDecoration:'none'}}>{u.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h2 style={{margin:0}}>Listings</h2>
            <span className="card-meta">{vacancies.length} visible</span>
          </div>

          <div style={{marginTop:12}}>
            {vacancies.map(v => <VacancyCard key={v.id} v={v} />)}
          </div>

          {hasMore && <button disabled={loading} onClick={()=>loadMore()} className="load-more">{loading ? 'Loading...' : 'Load more'}</button>}
        </div>
      </div>

    </div>
  );
}
