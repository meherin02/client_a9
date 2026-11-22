'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authClient, safeReturnPath } from '@/lib/auth-client';
export default function CompleteSignIn() {
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    async function complete(){
      try{
        const result=await authClient.getSession({query:{disableCookieCache:true}});
        if(!active)return;
        if(result.error || !result.data?.user)throw new Error('Google returned, but your session cookie was not available. Please check the production auth origin and cookie configuration.');
        toast.success('Google sign-in successful.');
        window.location.replace(safeReturnPath(new URLSearchParams(window.location.search).get('next')));
      }catch(err){if(active)setError(err instanceof Error?err.message:'Unable to verify sign-in.');}
    }
    complete();return()=>{active=false;};
  },[]);
  return <main className="route-state" aria-live="polite"><p className="eyebrow">GEARHARBOR</p><h1>{error?'Sign-in needs attention.':'Completing your sign-in…'}</h1>{error?<><p role="alert">{error}</p><Link className="button dark" href="/login">Back to login</Link></>:<p>Checking your session before opening your dashboard.</p>}</main>;
}
