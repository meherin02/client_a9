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
  const [quote, setQuote] = useState<{ available: boolean; availableQuantity: number; days: number; units: number; total: number; quote: string; daysAvailability: { date: string; available: number }[] } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
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
  useEffect(() => {
    if (!dates.startDate || !dates.endDate || dates.endDate < dates.startDate || dates.quantity < 1) { setQuote(null); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCheckingAvailability(true);
      try {
        const result = await authenticatedFetch('/api/customer/availability', { method: 'POST', body: JSON.stringify({ equipmentId: item._id, ...dates }), signal: controller.signal });
        if (!controller.signal.aborted) setQuote(result);
      } catch (error) {
        if (!controller.signal.aborted) setQuote(null);
      } finally { if (!controller.signal.aborted) setCheckingAvailability(false); }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [item._id, dates]);
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
  if (role !== 'customer') return <p className="muted">A Customer account is required to save favorites and rent equipment.</p>;
  return <><div className="rental-actions"><button disabled={busy} className="button" onClick={favorite}>{saved ? 'Remove favorite' : 'Save to favorites'}</button><button disabled={!item.quantity || item.status !== 'approved'} className="button dark" onClick={() => { setError(''); setQuote(null); dialog.current?.showModal(); }}>Book now</button></div><dialog className="booking-modal" ref={dialog} aria-labelledby="booking-title" onCancel={event => { if (busy) event.preventDefault(); }}><div className="modal-heading"><div><p className="eyebrow">MAKE IT HAPPEN</p><h2 id="booking-title">Book {item.name}</h2></div><button type="button" className="text-button" disabled={busy} onClick={() => dialog.current?.close()} aria-label="Close booking">Close</button></div><form className="equipment-form booking-form" onSubmit={book}><label>Rental start date<input type="date" required value={dates.startDate} min={new Date().toISOString().slice(0,10)} onChange={e => { setQuote(null); setDates({ ...dates, startDate: e.target.value }); }}/></label><label>Rental end date<input type="date" required min={dates.startDate || new Date().toISOString().slice(0,10)} value={dates.endDate} onChange={e => { setQuote(null); setDates({ ...dates, endDate: e.target.value }); }}/></label><label>Required quantity<input type="number" min="1" max={item.quantity} step="1" required value={dates.quantity} onChange={e => { setQuote(null); setDates({ ...dates, quantity: Number(e.target.value) }); }}/></label><label>Contact number<input name="contact" type="tel" required minLength={7} maxLength={25} placeholder="+880…"/></label><label className="form-wide">Delivery address<textarea name="address" required minLength={5} maxLength={1000} rows={2}/></label><label className="form-wide">Additional notes<textarea name="notes" maxLength={2000} rows={2}/></label><div className="booking-summary form-wide"><p>Both start and end dates are billable. Weekly rentals use 7-day units; monthly rentals use 30-day units, rounded up.</p>{days > 0 && dates.quantity > 0 && quote ? <><p>{quote.days} days · {quote.units} billing units · {dates.quantity} item(s)</p><strong>Server estimate: {money(quote.total / 100)}</strong><p role="status" className={quote.available ? 'availability-positive' : 'availability-negative'}>{quote.available ? `${quote.availableQuantity} item(s) available for these dates.` : `Only ${quote.availableQuantity} item(s) available for these dates.`}</p>{quote.daysAvailability.length > 1 && <details className="availability-days"><summary>View daily availability</summary><ul>{quote.daysAvailability.map(day => <li key={day.date}><span>{day.date}</span><span>{day.available} available</span></li>)}</ul></details>}{quote.quote === 'provisional' && <small>Some checkout attempts are still being confirmed. Inventory is checked again before payment.</small>}</> : checkingAvailability ? <p role="status">Checking current availability and price…</p> : <p>Select your dates to see availability and server pricing.</p>}<small>Inventory and final pricing are checked again before checkout.</small></div>{error && <p role="alert" className="form-error form-wide">{error}</p>}<button className="button dark form-wide" disabled={busy || days < 1 || checkingAvailability || !quote?.available}>{busy ? 'Checking availability…' : !quote?.available && quote ? 'Unavailable for these dates' : 'Continue to Stripe Checkout'}</button></form></dialog></>;
}
