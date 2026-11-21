'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RentalActions } from './rental-actions';
import { SiteHeader } from '@/components/site-header';
import { authClient, authenticatedFetch } from '@/lib/auth-client';
import { type Equipment, money } from '@/lib/equipment';
export default function EquipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [item, setItem] = useState<Equipment | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace(`/login?next=${encodeURIComponent(`/equipment/${id}`)}`); return; }
    let active = true;
    authenticatedFetch(`/api/equipment/${id}`).then(data => { if (active) setItem(data); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [id, session, isPending, router]);
  return <><SiteHeader/><main className="details"><Link href="/equipment" className="auth-back">Explore all equipment</Link>{error ? <div className="empty-state" role="alert"><h2>Unable to load this equipment.</h2><p>{error}</p></div> : !item ? <p role="status">Loading equipment details…</p> : <><div className="detail-layout"><div className="detail-photo"><Image fill unoptimized sizes="(max-width: 760px) 100vw, 60vw" src={item.image} alt={item.name}/></div><section className="detail-summary"><p className="eyebrow">{item.category}</p><h1>{item.name}</h1><p className="muted">{item.location}</p><span className={`status-badge ${item.status}`}>{item.status}</span><p className="detail-price">{money(item.price)}<small> / {item.rentalType === 'daily' ? 'day' : item.rentalType === 'weekly' ? 'week' : 'month'}</small></p><p>{item.quantity ? `${item.quantity} available` : 'Currently unavailable'}</p><dl><div><dt>Condition</dt><dd>{item.condition}</dd></div><div><dt>Brand</dt><dd>{item.brand}</dd></div><div><dt>Model</dt><dd>{item.model}</dd></div></dl><RentalActions item={item}/></section></div><div className="detail-information"><section><h2>About this equipment</h2><p>{item.description}</p><h2>Rental terms and conditions</h2><p>{item.terms}</p></section><aside><p className="eyebrow">LISTED BY</p><h3>{item.owner?.name}</h3><p>{item.owner?.email}</p></aside></div></>}</main></>;
}

