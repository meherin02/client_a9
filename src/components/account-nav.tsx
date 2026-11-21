'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
export function AccountNav() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  if (isPending) return <div className="account" aria-live="polite">Loading account…</div>;
  return <div className="account">{data ? <><Link href="/dashboard">Dashboard</Link><button className="button dark" onClick={async () => { const result = await authClient.signOut(); if (result.error) { toast.error('Unable to sign out. Please try again.'); return; } toast.success('Signed out successfully.'); router.replace('/'); router.refresh(); }}>Log out</button></> : <><Link href="/login">Log in</Link><Link className="button dark" href="/register">Get started</Link></>}</div>;
}
