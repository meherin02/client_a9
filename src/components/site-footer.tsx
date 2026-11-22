import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
async function CopyrightYear() { 'use cache'; return new Date().getFullYear(); }
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="brand" href="/">gear<span>harbor</span></Link>
        <p>Good equipment. Great possibilities.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/equipment">All equipment</Link>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/dashboard">Your dashboard</Link>
        <Link href="/register">Join GearHarbor</Link>
      </nav>
      <ThemeToggle/>
      <p>© <CopyrightYear/> GearHarbor</p>
    </footer>
  );
}
