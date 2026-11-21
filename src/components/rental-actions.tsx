'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { authenticatedFetch } from '@/lib/auth-client';
import { type Equipment, money } from '@/lib/equipment';
export function RentalActions({ item }: { item: Equipment }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [role, setRole] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dates, setDates] = useState({ startDate: '', endDate: '', quantity: 1 });
  useEffect(() => {
    let active = true;
    authenticatedFetch('/api/me').then(async profile => {
      if (!active) return; setRole(profile.role);
      if (profile.role === 'customer') {
        const favorites = await authenticatedFetch('/api/customer/favorites');
        if (active) setSaved(favorites.some((favorite: { equipmentId: string }) => favorite.equipmentId === item._id));
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [item._id]);
  async function favorite() {
    setBusy(true);
    try { await authenticatedFetch(`/api/customer/favorites/${item._id}`, { method: saved ? 'DELETE' : 'PUT' }); setSaved(!saved); toast.success(saved ? 'Favorite removed.' : 'Saved to favorites.'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Unable to save favorite.'); } finally { setBusy(false); }
  }
  async function book(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setError('');
    try {
      const result = await authenticatedFetch('/api/customer/checkout', { method: 'POST', body: JSON.stringify({ equipmentId: item._id, ...dates, contact: data.get('contact'), address: data.get('address'), notes: data.get('notes') }) });
      const url = new URL(result.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('Invalid payment destination.');
      window.location.assign(url.href);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to start checkout.'); setBusy(false); }
  }
  const days = dates.startDate && dates.endDate ? Math.round((Date.parse(dates.endDate) - Date.parse(dates.startDate)) / 86400000) + 1 : 0;
  const units = Math.ceil(days / ({ daily: 1, weekly: 7, monthly: 30 }[item.rentalType] || 1));
  if (role !== 'customer') return <p className="muted">A Customer account is required to save favorites and rent equipment.</p>;
  return <><div className="rental-actions"><button disabled={busy} className="button" onClick={favorite}>{saved ? 'Remove favorite' : 'Save to favorites'}</button><button disabled={!item.quantity || item.status !== 'approved'} className="button dark" onClick={() => { setError(''); dialog.current?.showModal(); }}>Book now</button></div><dialog className="booking-modal" ref={dialog} aria-labelledby="booking-title" onCancel={event => { if (busy) event.preventDefault(); }}><div className="modal-heading"><div><p className="eyebrow">MAKE IT HAPPEN</p><h2 id="booking-title">Book {item.name}</h2></div><button className="text-button" disabled={busy} onClick={() => dialog.current?.close()} aria-label="Close booking">Close</button></div><form className="equipment-form booking-form" onSubmit={book}><label>Rental start date<input type="date" required value={dates.startDate} min={new Date().toISOString().slice(0,10)} onChange={e => setDates({ ...dates, startDate: e.target.value })}/></label><label>Rental end date<input type="date" required min={dates.startDate || new Date().toISOString().slice(0,10)} value={dates.endDate} onChange={e => setDates({ ...dates, endDate: e.target.value })}/></label><label>Required quantity<input type="number" min="1" max={item.quantity} step="1" required value={dates.quantity} onChange={e => setDates({ ...dates, quantity: Number(e.target.value) })}/></label><label>Contact number<input name="contact" type="tel" required minLength={7} maxLength={25} placeholder="+880…"/></label><label className="form-wide">Delivery address<textarea name="address" required minLength={5} maxLength={1000} rows={2}/></label><label className="form-wide">Additional notes<textarea name="notes" maxLength={2000} rows={2}/></label><div className="booking-summary form-wide"><p>Both start and end dates are billable. Weekly rentals use 7-day units; monthly rentals use 30-day units, rounded up.</p>{days > 0 && dates.quantity > 0 ? <><p>{days} days · {units} billing units · {dates.quantity} item(s)</p><strong>Estimated total: {money(item.price * units * dates.quantity)}</strong></> : <p>Select your dates to see an estimate.</p>}<small>Final pricing and availability are checked on the server before checkout.</small></div>{error && <p role="alert" className="form-error form-wide">{error}</p>}<button className="button dark form-wide" disabled={busy || days < 1}>{busy ? 'Checking availability…' : 'Continue to Stripe Checkout'}</button></form></dialog></>;
}
