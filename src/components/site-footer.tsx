import Link from 'next/link';
async function CopyrightYear() { 'use cache'; return new Date().getFullYear(); }
export function SiteFooter() { return <footer className="site-footer"><div><Link className="brand" href="/">gear<span>harbor</span></Link><p>Good equipment. Great possibilities.</p></div><div className="footer-links"><Link href="/equipment">All equipment</Link><Link href="/#how-it-works">How it works</Link><Link href="/dashboard">Your dashboard</Link></div><p>© <CopyrightYear/> GearHarbor</p></footer>; }
