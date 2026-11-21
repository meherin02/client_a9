'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/auth-client';
import type { Equipment } from '@/lib/equipment';
import { EquipmentCard } from './equipment-card';
import { Reveal } from './reveal';
export function HomeEquipment({ recent = false }: { recent?: boolean }) {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/equipment?limit=${recent ? 3 : 6}&sort=${recent ? 'recent' : 'priceDesc'}`, { signal: controller.signal }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Equipment could not be loaded.'); return data.items; }).then(setItems).catch(err => { if (err.name !== 'AbortError') setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [recent, attempt]);
  return <section className="home-equipment"><div className="section-top"><div><p className="eyebrow">{recent ? 'FRESH POSSIBILITIES' : 'GEAR WORTH MAKING PLANS FOR'}</p><h2>{recent ? 'New to the neighborhood.' : 'Featured equipment.'}</h2></div><Link href="/equipment">View all equipment</Link></div>{loading ? <div className="equipment-grid" aria-label="Loading equipment">{Array.from({ length: recent ? 3 : 6 }, (_, i) => <div key={i} className="equipment-skeleton skeleton"/>)}</div> : error ? <div className="home-data-state" role="status"><p>Equipment is taking a moment to load.</p><button className="button" onClick={() => { setLoading(true); setError(''); setAttempt(value => value + 1); }}>Try again</button></div> : !items.length ? <div className="home-data-state"><h3>Good gear is on its way.</h3><p>Approved owner listings will appear here as they become available.</p><Link href="/equipment" className="button dark">Explore equipment</Link></div> : <div className="equipment-grid">{items.map((item,i) => <Reveal key={item._id} className="home-card-reveal" delay={i * 0.04}><EquipmentCard item={item}/></Reveal>)}</div>}</section>;
}
