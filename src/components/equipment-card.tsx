'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { authenticatedFetch, authClient } from '@/lib/auth-client';
import { type Equipment, money } from '@/lib/equipment';

function EquipmentFavorite({ id }: { id: string }) {
  const { data, isPending } = authClient.useSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    let active = true;
    authenticatedFetch('/api/customer/favorites').then((favorites: { equipmentId: string }[]) => {
      if (active) setSaved(favorites.some(favorite => favorite.equipmentId === id));
    }).catch(() => {}).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [data, id]);

  async function toggleFavorite() {
    if (!data) {
      toast('Sign in with a Customer account to save equipment.');
      return;
    }
    setBusy(true);
    try {
      await authenticatedFetch(`/api/customer/favorites/${id}`, { method: saved ? 'DELETE' : 'PUT' });
      setSaved(value => !value);
      toast.success(saved ? 'Removed from saved equipment.' : 'Saved to your equipment list.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update saved equipment.');
    } finally { setBusy(false); }
  }

  return <button type="button" className={`equipment-favorite${saved ? ' is-saved' : ''}`} disabled={isPending || busy} aria-label={saved ? 'Remove from saved equipment' : 'Save equipment'} aria-pressed={saved} onClick={toggleFavorite}>
    <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
  </button>;
}

function FallbackImage() {
  return <div className="equipment-image-fallback" role="img" aria-label="Equipment image unavailable">
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="8" y="12" width="48" height="40" rx="5"/><circle cx="23" cy="26" r="4"/><path d="m12 46 13-12 9 8 8-7 10 11"/></svg>
    <span>Equipment photo</span>
  </div>;
}

export function EquipmentCard({ item }: { item: Equipment }) {
  const [imageFailed, setImageFailed] = useState(false);
  const priceUnit = item.rentalType === 'daily' ? 'day' : item.rentalType === 'weekly' ? 'week' : 'month';

  return <article className="equipment-card">
    <div className="equipment-image">
      {item.image && !imageFailed ? <Image unoptimized fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" src={item.image} alt={item.name} onError={() => setImageFailed(true)}/> : <FallbackImage/>}
      <span className={`stock ${item.quantity ? '' : 'unavailable'}`}>{item.quantity ? 'Available' : 'Unavailable'}</span>
      <EquipmentFavorite key={item._id} id={item._id}/>
    </div>
    <div className="equipment-card-body">
      <div className="equipment-card-heading"><p className="eyebrow">{item.category}</p><span className="equipment-condition">{item.condition}</span></div>
      <h3><Link href={`/equipment/${item._id}`}>{item.name}</Link></h3>
      <p className="equipment-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>{item.location}</p>
      <div className="card-bottom"><p><strong>{money(item.price)}</strong><span> / {priceUnit}</span></p><Link className="button dark" href={`/equipment/${item._id}`}>View details</Link></div>
    </div>
  </article>;
}
