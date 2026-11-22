'use client';
import { ThemeToggle } from './theme-toggle';
import Link from 'next/link';
import { GoogleAccountLink } from './google-account-link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { authClient, authenticatedFetch } from '@/lib/auth-client';
import { money } from '@/lib/equipment';
type Role = 'customer' | 'owner' | 'admin';
type Profile = { id: string; name: string; email: string; emailVerified?: boolean; image?: string; phone?: string; address?: string; role: Role };
type Rental = { _id: string; customer?: { name: string; email: string }; owner?: { name: string; email: string }; equipmentName: string; startDate: string; endDate: string; quantity: number; total: number; paymentStatus: string; bookingStatus: string };
type User = { _id: string; name: string; email: string; role: Role; createdAt: string; suspended?: boolean };
type Analytics = { equipment: number; completed: number; bookings: number; pending: number; users: number; revenue: number; monthly: { month: string; bookings: number; earnings: number }[] };
export function DashboardWorkspace({ mode = 'overview', role }: { mode?: 'overview' | 'profile' | 'rentals' | 'users'; role?: Role }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`); return; }
    let active = true;
    async function load() {
      try {
        const me = await authenticatedFetch('/api/me');
        if (role && me.role !== role) throw new Error(`This page requires the ${role} role.`);
        if (!active) return; setProfile(me);
        if (mode === 'overview' && me.role !== 'customer') { const value = await authenticatedFetch(`/api/${me.role}/analytics`); if (active) setAnalytics(value); }
        if (mode === 'rentals') { const value = await authenticatedFetch(`/api/${me.role}/rentals`); if (active) setRentals(value); }
        if (mode === 'users') { const value = await authenticatedFetch('/api/admin/users'); if (active) setUsers(value); }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Unable to open dashboard.'); }
      finally { if (active) setLoading(false); }
    }
    load(); return () => { active = false; };
  }, [session, isPending, router, role, mode, retry]);
  async function mutation(path: string, body: object) {
    setBusy(true);
    try { const result = await authenticatedFetch(path, { method: 'PATCH', body: JSON.stringify(body) }); toast.success(result.message); setRetry(value => value + 1); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Unable to save.'); } finally { setBusy(false); }
  }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!profile) return;
    const data = Object.fromEntries(new FormData(event.currentTarget)); setBusy(true);
    try {
      await authenticatedFetch('/api/me', { method: 'PATCH', body: JSON.stringify(data) });
      if (data.email !== profile.email && !profile.emailVerified) {
        const result = await authClient.changeEmail({ newEmail: String(data.email) });
        if (result.error) throw new Error(`Profile saved; email could not change: ${result.error.message}`);
      }
      await authClient.getSession({ query: { disableCookieCache: true } });
      toast.success('Profile updated.'); setRetry(value => value + 1);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Unable to save profile.'); } finally { setBusy(false); }
  }
  const nav = profile ? profile.role === 'owner' ? [['Overview','/dashboard/owner'],['Add equipment','/dashboard/owner/add-equipment'],['My equipment','/dashboard/owner/equipment'],['My equipment rentals','/dashboard/owner/rentals'],['My profile','/dashboard/owner/profile']] : profile.role === 'admin' ? [['Overview','/dashboard/admin'],['All users','/dashboard/admin/users'],['All equipment','/dashboard/admin/equipment'],['All rentals','/dashboard/admin/rentals'],['My profile','/dashboard/admin/profile']] : [['Overview','/dashboard'],['My rentals','/dashboard/customer/rentals'],['Favorites','/dashboard/customer/favorites'],['Profile','/dashboard/customer/profile']] : [];
  const title = mode === 'profile' ? 'Your profile' : mode === 'users' ? 'All users' : mode === 'rentals' ? 'Rental management' : `Welcome back${profile ? `, ${profile.name.split(' ')[0]}` : ''}.`;
  return <div className="dashboard-shell"><aside className="dashboard-sidebar"><Link href="/" className="brand">gear<span>harbor</span></Link><ThemeToggle/><p className="eyebrow">YOUR WORKSPACE</p><nav aria-label="Dashboard">{nav.map(([label,href]) => <Link key={href} href={href}>{label}</Link>)}</nav><Link href="/equipment">Explore equipment</Link>{profile && <div className="sidebar-profile">{profile.image && <Image unoptimized src={profile.image} alt="Your profile" width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }}/>}<strong>{profile.name}</strong><small>{profile.role} · {profile.email}</small></div>}</aside><main className="dashboard-content"><div className="dashboard-heading"><div><p className="eyebrow">{profile?.role.toUpperCase() || 'GEARHARBOR'} DASHBOARD</p><h1>{title}</h1></div><button className="button" onClick={() => { setError(''); setLoading(true); setRetry(value => value + 1); }}>Refresh</button></div>{loading ? <p role="status">Loading your workspace…</p> : error ? <div className="empty-state" role="alert"><h2>Unable to load this page.</h2><p>{error}</p></div> : profile && <>{mode === 'overview' && <>{analytics ? <><div className="stat-grid">{[...(profile.role === 'admin' ? [['Total users',analytics.users]] : []),['Listed equipment',analytics.equipment],['Total bookings',analytics.bookings],['Pending approvals',analytics.pending],['Completed rentals',analytics.completed],[profile.role === 'owner' ? 'Total earnings' : 'Total revenue',money(analytics.revenue / 100)]].map(([label,value]) => <article className="stat-card" key={label}><p>{label}</p><strong>{value}</strong></article>)}</div><section className="chart-panel"><p className="eyebrow">THE LAST TWELVE MONTHS · UTC</p><h2>{profile.role === 'owner' ? 'Monthly earnings' : 'Monthly bookings'}</h2><p className="muted">{profile.role === 'owner' ? 'Successful payments only' : 'Confirmed booking records'}</p><div className="bar-chart" role="img" aria-label="Monthly activity chart. Exact values are available in the table below.">{analytics.monthly.map(row => { const value = profile.role === 'owner' ? row.earnings : row.bookings; const max = Math.max(1,...analytics.monthly.map(r => profile.role === 'owner' ? r.earnings : r.bookings)); return <div className="chart-column" key={row.month}><span>{profile.role === 'owner' ? money(value/100) : value}</span><div className="chart-track"><div className="chart-bar" style={{ height: `${value/max*100}%` }}/></div><span>{row.month.slice(5)}</span></div>; })}</div><details><summary>View exact monthly data</summary><div className="table-scroll"><table><thead><tr><th>Month</th><th>Bookings</th><th>Earnings</th></tr></thead><tbody>{analytics.monthly.map(row => <tr key={row.month}><td>{row.month}</td><td>{row.bookings}</td><td>{money(row.earnings/100)}</td></tr>)}</tbody></table></div></details></section></> : <section className="empty-state"><h2>Your next project starts here.</h2><p>Explore equipment, save favorites, and manage your rentals using your workspace navigation.</p><Link className="button dark" href="/equipment">Explore equipment</Link></section>}</>}{mode === 'profile' && <><GoogleAccountLink/><form key={`${profile.id}-${retry}`} className="equipment-form" onSubmit={saveProfile}><div className="form-heading"><h2>Make yourself at home.</h2><p>Keep your contact information up to date for rentals.</p></div><label>Full name<input name="name" required maxLength={100} defaultValue={profile.name}/></label><label>Email address<input name="email" type="email" required defaultValue={profile.email} readOnly={profile.emailVerified}/>{profile.emailVerified && <small>Your verified email is managed by your sign-in provider.</small>}</label><label>Profile image URL<input name="image" type="url" required defaultValue={profile.image}/></label><label>Phone number<input name="phone" type="tel" maxLength={25} defaultValue={profile.phone || ''}/></label><label className="form-wide">Address<textarea name="address" maxLength={1000} rows={3} defaultValue={profile.address || ''}/></label><button disabled={busy} className="button dark form-wide">{busy ? 'Saving…' : 'Save profile'}</button></form></>}{mode === 'rentals' && (!rentals.length ? <div className="empty-state"><h2>No rentals yet.</h2><p>Paid equipment bookings will appear here.</p></div> : <div className="table-scroll"><table><thead><tr><th>Customer</th>{profile.role === 'admin' && <th>Owner</th>}<th>Equipment</th><th>Rental duration</th><th>Quantity</th><th>Amount</th><th>Payment</th><th>Booking status</th><th>Actions</th></tr></thead><tbody>{rentals.map(row => <tr key={row._id}><td>{row.customer?.name}<small>{row.customer?.email}</small></td>{profile.role === 'admin' && <td>{row.owner?.name}<small>{row.owner?.email}</small></td>}<td>{row.equipmentName}</td><td>{row.startDate}<small>to {row.endDate}</small></td><td>{row.quantity}</td><td>{money(row.total/100)}</td><td>{row.paymentStatus}</td><td>{row.bookingStatus}</td><td><div className="table-actions">{row.bookingStatus === 'confirmed' && <button disabled={busy} onClick={() => mutation(`/api/${profile.role}/rentals/${row._id}/status`, { status: 'active' })}>Start rental</button>}{['confirmed','active'].includes(row.bookingStatus) && <button disabled={busy} onClick={() => { if (window.confirm('Complete this rental? Its end date must have passed.')) mutation(`/api/${profile.role}/rentals/${row._id}/status`, { status: 'completed' }); }}>Complete rental</button>}</div></td></tr>)}</tbody></table></div>)}{mode === 'users' && <div className="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Registration date</th><th>Status</th><th>Manage user</th></tr></thead><tbody>{users.map(user => <tr key={user._id}><td>{user.name}</td><td>{user.email}</td><td><select aria-label={`Role for ${user.name}`} disabled={busy || user._id === profile.id} value={user.role} onChange={e => { if (window.confirm(`Change ${user.name}'s role to ${e.target.value}?`)) mutation(`/api/admin/users/${user._id}`, { role: e.target.value }); }}><option value="customer">Customer</option><option value="owner">Owner</option><option value="admin">Admin</option></select></td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td>{user.suspended ? 'Suspended' : 'Active'}</td><td><button className="text-button" disabled={busy || user._id === profile.id} onClick={() => { if (window.confirm(`${user.suspended ? 'Reactivate' : 'Suspend'} ${user.name}?`)) mutation(`/api/admin/users/${user._id}`, { suspended: !user.suspended }); }}>{user.suspended ? 'Reactivate' : 'Suspend'}</button></td></tr>)}</tbody></table></div>}</>}</main></div>;
}


