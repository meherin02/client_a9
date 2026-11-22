'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { SiteHeader } from '@/components/site-header';
import { EquipmentCard } from '@/components/equipment-card';
import { API_URL } from '@/lib/auth-client';
import { categories, type Equipment } from '@/lib/equipment';
export default function Catalog() {
  const [result, setResult] = useState<{ items: Equipment[]; total: number; page: number; limit: number } | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const sync = () => { setLoading(true); setError(''); setQuery(window.location.search); };
    sync(); window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    if (query === null) return;
    const controller = new AbortController();
    fetch(`${API_URL}/api/equipment${query}`, { signal: controller.signal }).then(async response => {
      const body = await response.json(); if (!response.ok) throw new Error(body.message || 'Unable to load equipment.'); return body;
    }).then(setResult).catch(err => { if (err.name !== 'AbortError') setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, attempt]);
  function navigate(params: URLSearchParams) { const next = `?${params}`; window.history.pushState({}, '', `/equipment${next}`); setLoading(true); setError(''); if (next === query) setAttempt(value => value + 1); setQuery(next); }
  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) if (String(value).trim()) params.set(key, String(value).trim());
    params.set('page', '1'); navigate(params);
  }
  const values = new URLSearchParams(query || '');
  return <><SiteHeader/><main className="catalog"><section className="catalog-intro"><p className="eyebrow">THE RIGHT TOOLS. AROUND THE CORNER.</p><h1>Find your next possibility.</h1><p className="muted">Equipment for the things you want to make, build, and do.</p></section><div className="catalog-layout"><aside className="filter-panel"><h2>Find your fit</h2><form key={query ?? 'initial'} onSubmit={filter}><label>Search equipment<input name="q" defaultValue={values.get('q') || ''} placeholder="Name, location, or category"/></label><label>Category<select name="category" defaultValue={values.get('category') || ''}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Rental type<select name="rentalType" defaultValue={values.get('rentalType') || ''}><option value="">Any duration</option>{['daily','weekly','monthly'].map(t => <option key={t} value={t}>{t}</option>)}</select></label><div className="price-inputs"><label>Min price<input type="number" min="0" name="minPrice" defaultValue={values.get('minPrice') || ''} placeholder="৳ 0"/></label><label>Max price<input type="number" min="0" name="maxPrice" defaultValue={values.get('maxPrice') || ''} placeholder="Any"/></label></div><label>Availability<select name="availability" defaultValue={values.get('availability') || ''}><option value="">All equipment</option><option value="available">Available now</option></select></label><label>Sort by<select name="sort" defaultValue={values.get('sort') || 'recent'}><option value="recent">Recently added</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option></select></label><button className="button dark">Apply filters</button><button className="text-button" type="button" onClick={() => { window.history.pushState({}, '', '/equipment'); if (query === '') setAttempt(value => value + 1); setQuery(''); setLoading(true); setError(''); }}>Clear filters</button></form></aside><section aria-live="polite"><div className="results-heading"><strong>{loading ? 'Finding equipment…' : `${result?.total || 0} equipment items`}</strong><span>Made for your next project</span></div>{error ? <div className="empty-state"><h2>Equipment is taking a moment.</h2><p>{error}</p><button className="button dark" onClick={() => { setError(''); setLoading(true); setAttempt(attempt + 1); }}>Try again</button></div> : loading ? <div className="equipment-grid">{Array.from({ length: 6 }, (_, i) => <div className="equipment-skeleton" key={i}/>)}</div> : !result?.items.length ? <div className="empty-state"><h2>No equipment found.</h2><p>Try another location, a wider price range, or fewer filters.</p></div> : <><div className="equipment-grid">{result.items.map(item => <EquipmentCard item={item} key={item._id}/>)}</div><div className="pagination"><button className="button" disabled={result.page <= 1} onClick={() => { values.set('page', String(result.page - 1)); navigate(values); }}>Previous</button><span>Page {result.page} of {Math.max(1, Math.ceil(result.total / result.limit))}</span><button className="button" disabled={result.page * result.limit >= result.total} onClick={() => { values.set('page', String(result.page + 1)); navigate(values); }}>Next</button></div></>}</section></div></main></>;
}


