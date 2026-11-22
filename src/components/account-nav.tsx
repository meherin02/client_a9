'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
export function AccountNav() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  if (isPending) return <div className="account" aria-live="polite"><span className="account-loading"/></div>;
  if (!data) return <div className="account"><Link href="/login">Log in</Link><Link className="button dark" href="/register">Get started</Link></div>;

  const user = data.user;
  const initial = user.name.trim().charAt(0).toUpperCase() || 'G';
  async function signOut() {
    const result = await authClient.signOut();
    if (result.error) { toast.error('Unable to sign out. Please try again.'); return; }
    toast.success('Signed out successfully.');
    router.replace('/');
    router.refresh();
  }

  return <details className="account-menu">
    <summary aria-label={`Open account menu for ${user.name}`}>
      {user.image ? <Image unoptimized src={user.image} alt="" width={36} height={36}/> : <span className="account-avatar-fallback">{initial}</span>}
      <span className="account-name">{user.name}</span><span className="account-chevron" aria-hidden="true">⌄</span>
    </summary>
    <div className="account-menu-panel">
      <div className="account-menu-identity"><strong>{user.name}</strong><span>{user.email}</span></div>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/dashboard/customer/profile">My profile</Link>
      <Link href="/dashboard/customer/rentals">My rentals</Link>
      <Link href="/dashboard/customer/favorites">Saved equipment</Link>
      <button type="button" onClick={signOut}>Log out</button>
    </div>
  </details>;
}
