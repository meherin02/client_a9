'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SiteHeader } from './site-header';
import { authClient, authenticatedFetch } from '@/lib/auth-client';
import { type Equipment, money } from '@/lib/equipment';
type Favorite = { _id: string; equipmentId: string; equipment?: Equipment };
type Booking = { _id: string; equipmentName: string; startDate: string; endDate: string; bookingDate: string; total: number; paymentStatus: string; bookingStatus: string };
export function CustomerRecords({ favorites = false }: { favorites?: boolean }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [rows, setRows] = useState<(Favorite & Booking)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`); return; }
    let active = true;
    authenticatedFetch(`/api/customer/${favorites ? 'favorites' : 'rentals'}`).then(data => { if (active) setRows(data); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, isPending, router, favorites, retry]);
  async function remove(id: string) {
    setBusy(true);
    try { await authenticatedFetch(`/api/customer/favorites/${id}`, { method: 'DELETE' }); setRows(rows.filter(row => row.equipmentId !== id)); toast.success('Favorite removed.'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Unable to remove favorite.'); } finally { setBusy(false); }
  }
  return <><SiteHeader/><main className="workspace"><div className="workspace-top"><div><p className="eyebrow">CUSTOMER WORKSPACE</p><h1>{favorites ? 'Your saved possibilities.' : 'My rentals'}</h1></div><div className="workspace-links"><Link href="/dashboard">Dashboard</Link><Link href={favorites ? '/dashboard/customer/rentals' : '/dashboard/customer/favorites'}>{favorites ? 'My rentals' : 'Favorites'}</Link><Link className="button dark" href="/equipment">Explore equipment</Link></div></div>{loading ? <p role="status">Loading your {favorites ? 'favorites' : 'rentals'}…</p> : error ? <div className="empty-state" role="alert"><p>{error}</p><button className="button" onClick={() => { setError(''); setLoading(true); setRetry(retry + 1); }}>Try again</button></div> : !rows.length ? <div className="empty-state"><h2>{favorites ? 'Keep your next project in mind.' : 'Your next project starts with the right gear.'}</h2><p>{favorites ? 'Save equipment from its details page to find it here later.' : 'Your paid rental bookings will appear here.'}</p></div> : <div className="table-scroll"><table><thead>{favorites ? <tr><th>Equipment</th><th>Category</th><th>Rental price</th><th>Actions</th></tr> : <tr><th>Equipment</th><th>Start date</th><th>End date</th><th>Booking date</th><th>Total amount</th><th>Payment status</th><th>Booking status</th></tr>}</thead><tbody>{rows.map(row => favorites ? <tr key={row._id}><td>{row.equipment?.name || 'Removed equipment'}</td><td>{row.equipment?.category || '—'}</td><td>{row.equipment ? `${money(row.equipment.price)} / ${row.equipment.rentalType}` : '—'}</td><td><div className="table-actions">{row.equipment && !('archived' in row.equipment && row.equipment.archived) && <Link href={`/equipment/${row.equipmentId}`}>View details</Link>}<button disabled={busy} onClick={() => remove(row.equipmentId)}>Remove favorite</button></div></td></tr> : <tr key={row._id}><td>{row.equipmentName}</td><td>{row.startDate}</td><td>{row.endDate}</td><td>{new Date(row.bookingDate).toLocaleDateString()}</td><td>{money(row.total / 100)}</td><td><span className="status-badge approved">{row.paymentStatus}</span></td><td>{row.bookingStatus}</td></tr>)}</tbody></table></div>}</main></>;
}
