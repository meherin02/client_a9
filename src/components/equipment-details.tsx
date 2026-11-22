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
  const [imageUnavailable, setImageUnavailable] = useState(false);
  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace(`/login?next=${encodeURIComponent(`/equipment/${id}`)}`); return; }
    let active = true;
    authenticatedFetch(`/api/equipment/${id}`).then(data => { if (active) setItem(data); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [id, session, isPending, router]);
  return <><SiteHeader/><main className="details"><div className="detail-breadcrumb"><Link href="/equipment">All equipment</Link><span>/</span><Link href={`/equipment?category=${encodeURIComponent(item?.category || '')}`}>{item?.category || 'Equipment'}</Link><span>/</span><span>{item?.name || 'Item details'}</span></div>{error ? <div className="empty-state" role="alert"><h2>Unable to load this equipment.</h2><p>{error}</p></div> : !item ? <p role="status">Loading equipment details…</p> : <><div className="detail-layout"><div className="detail-gallery"><div className="detail-photo">{item.image && !imageUnavailable ? <Image fill unoptimized priority sizes="(max-width: 760px) 100vw, 58vw" src={item.image} alt={item.name} onError={() => setImageUnavailable(true)}/> : <div className="equipment-image-fallback" role="img" aria-label="Equipment image unavailable"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="8" y="12" width="48" height="40" rx="5"/><circle cx="23" cy="26" r="4"/><path d="m12 46 13-12 9 8 8-7 10 11"/></svg><span>Equipment photo unavailable</span></div>}<span className={`detail-stock ${item.quantity ? '' : 'unavailable'}`}><span aria-hidden="true">●</span>{item.quantity ? `${item.quantity} available` : 'Currently unavailable'}</span></div><div className="detail-gallery-caption"><span>GEARHARBOR EQUIPMENT</span><span>{item.condition} condition</span></div></div><section className="detail-summary"><p className="eyebrow">{item.category}</p><h1>{item.name}</h1><p className="detail-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>{item.location}</p><p className="detail-price">{money(item.price)}<small> / {item.rentalType === 'daily' ? 'day' : item.rentalType === 'weekly' ? 'week' : 'month'}</small></p><div className="detail-quick-facts"><div><span>Availability</span><strong>{item.quantity ? `${item.quantity} units` : 'Fully booked'}</strong></div><div><span>Rental period</span><strong>{item.rentalType === 'daily' ? 'Daily' : item.rentalType === 'weekly' ? 'Weekly' : 'Monthly'}</strong></div></div><div className="detail-specifications"><div><span>Condition</span><strong>{item.condition}</strong></div><div><span>Brand</span><strong>{item.brand}</strong></div><div><span>Model</span><strong>{item.model}</strong></div><div><span>Category</span><strong>{item.category}</strong></div></div><div className="detail-booking-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg><span>Dates and availability are checked before secure checkout.</span></div><RentalActions item={item}/></section></div><div className="detail-information"><section><p className="eyebrow">THE DETAILS</p><h2>About this equipment</h2><p>{item.description}</p><h2>Rental terms and conditions</h2><p>{item.terms}</p></section><aside><p className="eyebrow">LISTED BY</p><h3>{item.owner?.name}</h3><p>{item.owner?.email}</p><p className="owner-response-note">Equipment is provided by its local owner. Review the rental terms and contact details before checkout.</p></aside></div></>}</main></>;
}

