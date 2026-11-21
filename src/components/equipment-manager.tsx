'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient, authenticatedFetch } from '@/lib/auth-client';
import { type Equipment, money } from '@/lib/equipment';
import { EquipmentForm } from './equipment-form';
import { SiteHeader } from './site-header';
export function EquipmentManager({ role, add = false }: { role: 'owner' | 'admin'; add?: boolean }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [items, setItems] = useState<Equipment[]>([]);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`); return; }
    let active = true;
    async function load() {
      try {
        const profile = await authenticatedFetch('/api/me');
        if (profile.role !== role) throw new Error(`This workspace is available to ${role}s only.`);
        const rows = add ? [] : await authenticatedFetch(`/api/${role}/equipment`);
        if (active) { setAllowed(true); setItems(rows); }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Unable to load equipment.'); }
      finally { if (active) setLoading(false); }
    }
    load(); return () => { active = false; };
  }, [session, isPending, router, role, add, refresh]);
  async function action(item: Equipment, status?: string) {
    if (!status && !window.confirm(`Remove ${item.name}? Historical rental records will be preserved.`)) return;
    setBusy(true);
    try {
      await authenticatedFetch(status ? `/api/admin/equipment/${item._id}/status` : `/api/equipment/${item._id}`, { method: status ? 'PATCH' : 'DELETE', ...(status ? { body: JSON.stringify({ status }) } : {}) });
      toast.success(status ? `Equipment ${status}.` : 'Equipment removed.'); setRefresh(refresh + 1);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Unable to update equipment.'); } finally { setBusy(false); }
  }
  return <><SiteHeader/><main className="workspace"><div className="workspace-top"><div><p className="eyebrow">{role.toUpperCase()} WORKSPACE</p><h1>{add ? 'Add equipment' : role === 'admin' ? 'Equipment moderation' : 'My equipment'}</h1></div><div className="workspace-links"><Link href="/dashboard">Dashboard</Link>{role === 'owner' && <Link className="button dark" href={add ? '/dashboard/owner/equipment' : '/dashboard/owner/add-equipment'}>{add ? 'My equipment' : 'Add equipment'}</Link>}</div></div>{loading ? <p role="status">Checking your account and loading equipment…</p> : error ? <div role="alert" className="empty-state"><h2>Unable to open this workspace.</h2><p>{error}</p></div> : allowed && <>{add ? <EquipmentForm onSaved={() => router.push('/dashboard/owner/equipment')}/> : editing ? <><button className="text-button" onClick={() => setEditing(null)}>Cancel editing</button><EquipmentForm key={editing._id} item={editing} onSaved={() => { setEditing(null); setRefresh(refresh + 1); }}/></> : !items.length ? <div className="empty-state"><h2>{role === 'owner' ? 'Your first listing starts here.' : 'No equipment to review yet.'}</h2><p>{role === 'owner' ? 'Add equipment and submit it for approval to start sharing your gear.' : 'Owner submissions will appear here for moderation.'}</p></div> : <div className="table-scroll"><table><thead><tr><th>Equipment</th><th>Category</th><th>Rental price</th><th>Quantity</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map(item => <tr key={item._id}><td><strong>{item.name}</strong><small>{item.location}{role === 'admin' && ` · ${item.owner?.name || 'Owner'}`}</small></td><td>{item.category}</td><td>{money(item.price)} / {item.rentalType}</td><td>{item.quantity}</td><td><span className={`status-badge ${item.status}`}>{item.status}</span></td><td><div className="table-actions"><Link href={`/equipment/${item._id}`}>View details</Link><button disabled={busy} onClick={() => setEditing(item)}>Update</button>{role === 'admin' && <><button disabled={busy || item.status === 'approved'} onClick={() => action(item, 'approved')}>Approve</button><button disabled={busy || item.status === 'rejected'} onClick={() => action(item, 'rejected')}>Reject</button></>}<button disabled={busy} className="danger" onClick={() => action(item)}>Delete</button></div></td></tr>)}</tbody></table></div>}</>}</main></>;
}
