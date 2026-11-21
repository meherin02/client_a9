'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, authenticatedFetch } from '@/lib/auth-client';
import { money } from '@/lib/equipment';
import { SiteHeader } from '@/components/site-header';
export default function PaymentSuccess() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [result, setResult] = useState<{ status: string; booking?: { equipmentName: string; total: number } } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`); return; }
    const id = new URLSearchParams(window.location.search).get('session_id');
    let active = true, timer: ReturnType<typeof setTimeout>;
    async function poll() {
      if (!id) { setError('No checkout reference was provided.'); return; }
      try {
        const data = await authenticatedFetch(`/api/customer/payments/${encodeURIComponent(id)}`);
        if (!active) return;
        setResult(data);
        if (data.status === 'expired') setError('This checkout expired without a confirmed payment. Please start a new booking.');
        else if (data.status !== 'paid') timer = setTimeout(poll, 3000);
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Unable to verify payment.'); }
    }
    poll(); return () => { active = false; clearTimeout(timer); };
  }, [session, isPending, router]);
  return <><SiteHeader/><main className="workspace"><div className="payment-result" aria-live="polite"><p className="eyebrow">YOUR NEXT PROJECT</p><h1>{error ? 'Unable to verify payment' : result?.status === 'paid' ? 'You’re all booked.' : 'Confirming your payment…'}</h1><p>{error || (result?.booking ? `${result.booking.equipmentName} · ${money(result.booking.total / 100)} paid` : 'We’re waiting for secure payment confirmation. Your rental will appear after confirmation.')}</p><Link className="button dark" href="/dashboard/customer/rentals">View my rentals</Link></div></main></>;
}
