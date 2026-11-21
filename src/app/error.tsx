'use client';
import Link from 'next/link';
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) { return <main className="route-state"><p className="eyebrow">LET’S GET YOU BACK ON TRACK</p><h1>Something interrupted your visit.</h1><p>Please try again, or return home to keep exploring.</p><div className="workspace-links"><button className="button dark" onClick={() => retry()}>Try again</button><Link className="button" href="/">Back to home</Link></div></main>; }
