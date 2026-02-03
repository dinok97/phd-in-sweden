import { useEffect, useState, useCallback } from 'react';

function Pagination({ currentPage, totalPages, onPageChange, disabled = false }){
  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // pages to show around current page

    for(let i = 1; i <= totalPages; i++){
      if(
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ){
        pages.push(i);
      } else if(pages.length > 0 && pages[pages.length - 1] !== '...'){
        pages.push('...');
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button
        className="pagination-btn pagination-nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        aria-label="Previous page"
      >
        &lt; Prev
      </button>

      {pageNumbers.map((num, i) => (
        num === '...' ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
        ) : (
          <button
            key={num}
            className={`pagination-btn ${num === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(num)}
            disabled={disabled}
            aria-current={num === currentPage ? 'page' : undefined}
          >
            {num}
          </button>
        )
      ))}

      <button
        className="pagination-btn pagination-nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        aria-label="Next page"
      >
        Next &gt;
      </button>
    </div>
  );
}

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
      <input aria-label="Search" className="input search-input" placeholder="Search universities, subject, vacancies..." value={q} onChange={e=>setQ(e.target.value)} />
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

function VacancyCard({ v }){
  return (
    <div className="card" style={{marginBottom:12}}>
      <div className="card-title">{v.vacancy || v.subject || 'Untitled'}</div>

      <div className="institution-line">
        <svg className="building-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 11l9-6 9 6v9a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1v-9zM9 19h6v1H9v-1z" fill="currentColor"/>
        </svg>
        <div style={{fontWeight:600}}>{v.institution || v.raw?.Institution || '—'}</div>
      </div>

      <div className="card-meta subject-line">{v.subject || v.raw?.Subject || '—'}</div>

      <div className="card-footer">
        <div className="card-meta">Application Deadline: {formatDeadline(v.deadline)}</div>
        <div className="card-actions">
          {/* Add to calendar button (Google Calendar) */}
          {(() => {
            const fd = formatDeadline(v.deadline);
            const m = String(fd).match(/^(\d{4})-(\d{2})-(\d{2})$/);
            let dates = '';
            if(m){
              const start = `${m[1]}${m[2]}${m[3]}`;
              const endDate = new Date(`${m[1]}-${m[2]}-${m[3]}`);
              endDate.setDate(endDate.getDate() + 1);
              const y = endDate.getFullYear();
              const mm = String(endDate.getMonth()+1).padStart(2,'0');
              const dd = String(endDate.getDate()).padStart(2,'0');
              const end = `${y}${mm}${dd}`;
              dates = `${start}/${end}`;
            }

            const title = encodeURIComponent(v.vacancy || v.subject || 'PhD vacancy');
            const details = encodeURIComponent((v.institution ? v.institution + '\n' : '') + (v.link || v.raw?.Link || ''));
            const location = encodeURIComponent(v.institution || '');
            const href = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}${dates ? `&dates=${dates}` : ''}&details=${details}&location=${location}`;

            return dates ? (
              <a className="btn-calendar" href={href} target="_blank" rel="noopener noreferrer" title="Add deadline to Google Calendar">
                Add to Calendar
              </a>
            ) : (
              <button className="btn-calendar" disabled title="No deadline available">Add to Calendar</button>
            );
          })()}

          {(v.link || v.raw?.Link) ? (
            <a className="btn-apply" href={v.link || v.raw?.Link} target="_blank" rel="noopener noreferrer">
              Apply
              <svg viewBox="0 0 24 24" width="14" height="14" style={{marginLeft:8,opacity:0.9}} xmlns="http://www.w3.org/2000/svg"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor"/></svg>
            </a>
          ) : (
            <button className="btn-apply" disabled>Apply</button>
          )}
        </div>
      </div>
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

  const handleSearch = useCallback((f) => {
    setFilters(f);
    const filtered = applyFilters(allVacancies, f);
    setFilteredVacancies(filtered);
    setVacancies(filtered.slice(0, PAGE_SIZE));
    setPage(1);
    setHasMore(filtered.length > PAGE_SIZE);
  }, [allVacancies, PAGE_SIZE]);

  function goToPage(n){
    if(n < 1 || n > totalPages) return;
    const start = (n - 1) * PAGE_SIZE;
    setVacancies(filteredVacancies.slice(start, start + PAGE_SIZE));
    setPage(n);
  }

  const totalPages = Math.max(1, Math.ceil(filteredVacancies.length / PAGE_SIZE));

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

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={goToPage}
              disabled={loading}
            />
          )}
        </div>
      </div>

      <footer className="site-footer" aria-label="Site footer">
        <div className="site-footer-inner">
          <small className="footer-text">Made to support your PhD journey by PPI Swedia</small>
        </div>
      </footer>

    </div>
  );
} 
