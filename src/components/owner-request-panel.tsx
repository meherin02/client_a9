'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { authenticatedFetch } from '@/lib/auth-client';

type Request = { status: 'pending' | 'approved' | 'rejected'; message: string; submittedAt: string; decidedAt?: string };
type Applicant = { _id: string; name: string; email: string; ownerRequest: Request };

export function OwnerRequestPanel({ role }: { role: 'customer' | 'admin' }) {
  const [request, setRequest] = useState<Request | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    authenticatedFetch(role === 'customer' ? '/api/customer/owner-request' : '/api/admin/owner-requests')
      .then(value => { if (active) { if (role === 'customer') setRequest(value); else setApplicants(value); } })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Unable to load requests.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role, refresh]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get('message') || '').trim();
    setBusy(true); setError('');
    try {
      await authenticatedFetch('/api/customer/owner-request', { method: 'POST', body: JSON.stringify({ message }) });
      toast.success('Your request has been sent to the admin.');
      setLoading(true); setRefresh(value => value + 1);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to send your request.'); }
    finally { setBusy(false); }
  }

  async function decide(id: string, status: 'approved' | 'rejected') {
    setBusy(true); setError('');
    try {
      const result = await authenticatedFetch(`/api/admin/owner-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success(result.message);
      setLoading(true); setRefresh(value => value + 1);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to review this request.'); }
    finally { setBusy(false); }
  }

  if (loading) return <p role="status">Loading owner requests…</p>;
  if (role === 'customer') return <section className="owner-request-panel">
    <p className="eyebrow">SHARE YOUR EQUIPMENT</p>
    <h2>List your gear on GearHarbor.</h2>
    <p className="muted">Tell the admin what equipment you plan to offer. Once approved, your Owner dashboard will let you add listings for review.</p>
    {request?.status === 'pending' ? <div className="owner-request-state"><span className="status-badge pending">Pending review</span><p>Your request was sent on {new Date(request.submittedAt).toLocaleDateString()}. You can check back here for the decision.</p><blockquote>{request.message}</blockquote></div>
      : <>{request?.status === 'rejected' && <div className="owner-request-state"><span className="status-badge rejected">Request declined</span><p>You may submit a new request with more details about your equipment.</p></div>}
        <form className="equipment-form owner-request-form" onSubmit={submit}>
          <label className="form-wide">What equipment would you like to rent out?<textarea name="message" required minLength={20} maxLength={500} rows={5} placeholder="Describe your equipment, its condition, and where renters can collect it."/></label>
          <button className="button dark form-wide" disabled={busy}>{busy ? 'Sending request…' : 'Request Owner access'}</button>
        </form></>}
    {error && <p role="alert" className="form-error">{error}</p>}
  </section>;

  return <section className="owner-request-panel">
    <p className="eyebrow">OWNER ACCESS</p>
    <h2>Review applications.</h2>
    <p className="muted">Approve a Customer to give them the Owner dashboard. Their equipment listings will still need separate approval.</p>
    {error && <p role="alert" className="form-error">{error}</p>}
    {!applicants.length ? <div className="empty-state"><h3>All caught up.</h3><p>No pending Owner requests right now.</p></div> : <div className="owner-request-list">{applicants.map(person => <article className="owner-request-card" key={person._id}>
      <div><p className="eyebrow">REQUESTED {new Date(person.ownerRequest.submittedAt).toLocaleDateString()}</p><h3>{person.name}</h3><p className="muted">{person.email}</p></div>
      <p>{person.ownerRequest.message}</p>
      <div className="owner-request-actions"><button className="button dark" disabled={busy} onClick={() => decide(person._id, 'approved')}>Approve as Owner</button><button className="button" disabled={busy} onClick={() => decide(person._id, 'rejected')}>Decline</button></div>
    </article>)}</div>}
  </section>;
}
