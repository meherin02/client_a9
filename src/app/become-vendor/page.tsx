'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { API_URL, authClient, authenticatedFetch } from '@/lib/auth-client';

export default function BecomeVendor() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [role, setRole] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [payoutCountry, setPayoutCountry] = useState('');
  useEffect(() => { fetch(`${API_URL}/api/vendor/payout-country`).then(response => response.ok ? response.json() : null).then(data => { if (data?.country) setPayoutCountry(data.country); }).catch(() => {}); }, []);
  useEffect(() => {
    if (!session) return;
    authenticatedFetch('/api/me').then(me => setRole(me.role)).catch(err => setError(err.message));
  }, [session]);
  async function join() {
    setBusy(true); setError('');
    try {
      await authenticatedFetch('/api/vendor/join', { method: 'POST' });
      await authClient.getSession({ query: { disableCookieCache: true } });
      router.replace('/dashboard/owner'); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create your vendor account.'); setBusy(false); }
  }
  return <><SiteHeader/><main className="vendor-landing"><div className="vendor-landing-copy"><p className="eyebrow">GEARHARBOR FOR OWNERS</p><h1>Let your gear earn its keep.</h1><p>Open a vendor workspace, list your equipment, and receive your share when someone books it. Every listing is reviewed before it goes live.</p><div className="vendor-steps"><span><strong>01</strong>Create your account</span><span><strong>02</strong>Set up Stripe payouts</span><span><strong>03</strong>List and earn</span></div>{payoutCountry && <p className="vendor-country-note">Stripe payout setup is currently configured for <strong>{new Intl.DisplayNames(['en'], { type: 'region' }).of(payoutCountry) || payoutCountry}</strong>. Stripe will ask for eligible identity and bank details for that country.</p>}{error && <p className="form-error" role="alert">{error}</p>}{isPending || (session && !role) ? <p role="status">Checking your account…</p> : !session ? <Link className="button dark" href="/register?next=%2Fbecome-vendor">Create a vendor account</Link> : role === 'owner' ? <Link className="button dark" href="/dashboard/owner">Go to vendor workspace</Link> : role === 'admin' ? <p>Admin accounts cannot become vendors.</p> : <button className="button dark" disabled={busy} onClick={join}>{busy ? 'Creating workspace…' : 'Become a vendor'}</button>}<p className="vendor-legal">Your platform fee and rental share are shown in your vendor workspace. Stripe handles identity verification and payout timing. Processing fees, refunds, and disputes can affect your final payout.</p></div><aside className="vendor-landing-aside"><p className="eyebrow">FROM IDLE TO IN DEMAND</p><h2>Your equipment has more to offer.</h2><p>Set your daily, weekly, or monthly rental price. Track bookings and your earnings in one place.</p></aside></main></>;
}
