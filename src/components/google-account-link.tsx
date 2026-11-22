'use client';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
export function GoogleAccountLink() {
  const [linked,setLinked]=useState<boolean|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    authClient.listAccounts().then(result=>{
      if(!active)return;
      if(result.error)setError('Unable to check linked accounts. Refresh and try again.');
      else setLinked(!!result.data?.some(account=>account.providerId==='google'));
    }).catch(()=>{if(active)setError('Unable to check linked accounts.');});
    return()=>{active=false;};
  },[]);
  async function link(){
    setBusy(true);setError('');
    try{
      const result=await authClient.linkSocial({provider:'google',callbackURL:`${window.location.origin}/auth/complete?next=${encodeURIComponent(window.location.pathname)}`});
      if(result.error)throw new Error(result.error.message || 'Google linking failed.');
    }catch(err){setError(err instanceof Error?err.message:'Unable to link Google.');setBusy(false);}
  }
  return <section className="chart-panel" style={{marginBottom:24,maxWidth:950}}><h2>Google sign-in</h2><p className="muted">{linked?'Your Google account is linked. You can use Continue with Google on the login page.':'Link the Google account with the same email address as this account. Your rentals and role stay with your existing account.'}</p>{!linked&&<button type="button" className="button dark" disabled={busy || linked===null} onClick={link}>{busy?'Opening Google…':linked===null?'Checking account…':'Link Google account'}</button>}{error&&<p role="alert" className="form-error">{error}</p>}</section>;
}
