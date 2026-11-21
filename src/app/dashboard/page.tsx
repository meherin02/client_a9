'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, authenticatedFetch } from '@/lib/auth-client';
type Profile = { name: string; email: string; role: 'customer' | 'owner' | 'admin' };
export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  useEffect(() => {
    if (isPending) return;
    if (!session) { router.replace('/login?next=/dashboard'); return; }
    let active = true;
    authenticatedFetch('/api/me').then(data => { if (active) setProfile(data); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [session, isPending, router]);
  return <main className="dashboard-start"><Link className="brand" href="/">gear<span>harbor</span></Link>{error ? <p role="alert">{error}</p> : !profile ? <p role="status">Restoring your session and loading your account…</p> : <><p className="eyebrow">YOUR {profile.role.toUpperCase()} WORKSPACE</p><h1>Welcome, {profile.name}.</h1><p>Signed in as {profile.email}</p><div className="workspace-links">{profile.role === 'customer' && <><Link className="button dark" href="/dashboard/customer/rentals">My rentals</Link><Link className="button" href="/dashboard/customer/favorites">Favorites</Link></>}{profile.role === 'owner' && <><Link className="button dark" href="/dashboard/owner/add-equipment">Add equipment</Link><Link className="button" href="/dashboard/owner/equipment">My equipment</Link></>}{profile.role === 'admin' && <Link className="button dark" href="/dashboard/admin/equipment">Manage equipment</Link>}<Link className="button" href="/equipment">Explore equipment</Link></div></>}</main>;
}

