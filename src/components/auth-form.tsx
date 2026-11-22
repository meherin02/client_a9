'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { authClient, safeReturnPath } from '@/lib/auth-client';

function subscribeLocation(notify: () => void) { window.addEventListener('popstate', notify); return () => window.removeEventListener('popstate', notify); }
function readOAuthError() { const code = new URLSearchParams(window.location.search).get('error'); return code ? 'Google sign-in could not finish. Error code: ' + (/^[a-zA-Z0-9_-]{1,80}$/.test(code) ? code : 'oauth_failed') : ''; }
export function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const oauthError = useSyncExternalStore(subscribeLocation, readOAuthError, () => '');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const fields = new FormData(event.currentTarget);
    const password = String(fields.get('password'));
    if (register && (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password))) {
      setError('Use at least 6 characters, including an uppercase and a lowercase letter.'); return;
    }
    setBusy(true);
    try {
      const credentials = { email: String(fields.get('email')), password };
      const result = register ? await authClient.signUp.email({ ...credentials, name: String(fields.get('name')), image: String(fields.get('image')) }) : await authClient.signIn.email(credentials);
      if (result.error) throw new Error(result.error.message || 'Unable to sign in.');
      toast.success(register ? 'Your account is ready. Welcome to GearHarbor!' : 'Welcome back!');
      router.replace(safeReturnPath(new URLSearchParams(window.location.search).get('next')));
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  async function google() {
    setBusy(true); setError('');
    try {
      const path = safeReturnPath(new URLSearchParams(window.location.search).get('next'));
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/auth/complete?next=${encodeURIComponent(path)}`, errorCallbackURL: `${window.location.origin}/login?next=${encodeURIComponent(path)}` });
      if (result.error) throw new Error(result.error.message || 'Google sign-in is unavailable.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Google sign-in failed.'); setBusy(false); }
  }
  return <main className="auth-shell"><aside className="auth-story"><Link className="brand" href="/">gear<span>harbor</span></Link><div><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h1>Great ideas.<br/>Meet the<br/><em>right gear.</em></h1><p>Find the tools to create, build, and bring your next project to life.</p></div><p>Rent thoughtfully. Create freely.</p></aside><section className="auth-panel"><Link href="/" className="auth-back">Back to GearHarbor</Link><p className="eyebrow">{register ? 'MAKE ROOM FOR POSSIBILITY' : 'GOOD TO HAVE YOU BACK'}</p><h2>{register ? 'Create your account' : 'Welcome back.'}</h2><p className="auth-subtitle">{register ? 'Your next project is one step closer.' : 'Sign in and pick up where you left off.'}</p><button className="google-button" onClick={google} disabled={busy}>Continue with Google</button><div className="auth-divider">or continue with email</div><form onSubmit={submit} className="auth-form">{register && <><label>Full name<input name="name" autoComplete="name" required maxLength={100} placeholder="Your full name"/></label><label>Profile image URL<input name="image" type="url" required placeholder="https://example.com/your-photo.jpg"/><small>Use a direct link to your profile photo.</small></label></>}<label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label><label>Password<div className="password-field"><input name="password" type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} required minLength={6} maxLength={128}/><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</button></div>{register && <small>At least 6 characters with uppercase and lowercase letters.</small>}</label>{(error || oauthError) && <p role="alert" className="form-error">{error || oauthError}</p>}<button className="button dark" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button></form><p className="auth-switch">{register ? 'Already have an account?' : 'New to GearHarbor?'} <Link href={register ? '/login' : '/register'} onClick={event => { const next = new URLSearchParams(window.location.search).get('next'); if (next) { event.preventDefault(); router.push(`${register ? '/login' : '/register'}?next=${encodeURIComponent(safeReturnPath(next))}`); } }}>{register ? 'Sign in' : 'Create an account'}</Link></p></section></main>;
}


