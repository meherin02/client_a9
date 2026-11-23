'use client';
import { useEffect, useState } from 'react';
import { authenticatedFetch } from '@/lib/auth-client';
type Status = { connected: boolean; chargesEnabled: boolean; payoutsEnabled: boolean; detailsSubmitted?: boolean; platformFeePercent: number };
export function VendorPayoutSetup() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { authenticatedFetch('/api/vendor/status').then(setStatus).catch(err => setError(err.message)); }, []);
  async function open(path: string) {
    setBusy(true); setError('');
    try { const result = await authenticatedFetch(path, { method: 'POST' }); window.location.assign(result.url); }
    catch (err) { setError(err instanceof Error ? err.message : 'Stripe could not open.'); setBusy(false); }
  }
  const ready = status?.chargesEnabled && status?.payoutsEnabled;
  return <section className="vendor-payout-card" aria-labelledby="vendor-payout-title"><div><p className="eyebrow">VENDOR PAYOUTS</p><h2 id="vendor-payout-title">{ready ? 'You are ready to earn.' : 'Connect your payout account.'}</h2><p>{ready ? 'Approved bookings can send your rental share to Stripe. Track transfers and bank payouts there.' : 'Complete Stripe identity and bank setup to receive your share of future bookings.'}</p>{status && <p className="vendor-fee-note">Your share: {100 - status.platformFeePercent}% of each rental before Stripe processing fees, refunds, and disputes.</p>}{error && <p className="form-error" role="alert">{error}</p>}</div><div className="vendor-payout-actions"><span className={`status-badge ${ready ? 'approved' : 'pending'}`}>{ready ? 'Payouts enabled' : status ? 'Setup needed' : 'Checking status'}</span>{status && <button className="button dark" disabled={busy} onClick={() => open(ready ? '/api/vendor/payout-dashboard' : '/api/vendor/onboard')}>{busy ? 'Opening Stripe…' : ready ? 'View Stripe payouts' : status.connected ? 'Continue payout setup' : 'Set up payouts'}</button>}</div></section>;
}
