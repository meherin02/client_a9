import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
async function CopyrightYear() { 'use cache'; return new Date().getFullYear(); }
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-feature">
          <div>
            <span className="footer-kicker">YOUR NEXT PROJECT STARTS HERE</span>
            <h2>Good ideas deserve<br/><em>the right gear.</em></h2>
            <p>Find what you need, rent for the time you need it, and get to work.</p>
          </div>
          <Link className="footer-cta" href="/equipment">Explore equipment <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="footer-main">
          <div className="footer-about">
            <Link className="brand" href="/">gear<span>harbor</span><small>EQUIPMENT. POSSIBILITIES.</small></Link>
            <p>More room to make, build, and explore. The equipment is closer than you think.</p>
          </div>
          <nav className="footer-link-group" aria-label="Explore equipment">
            <h3>Explore</h3>
            <Link href="/equipment">All equipment</Link>
            <Link href="/equipment?category=Photography">Photography</Link>
            <Link href="/equipment?category=Construction">Construction</Link>
            <Link href="/equipment?category=Fashion">Fashion</Link>
          </nav>
          <nav className="footer-link-group" aria-label="GearHarbor links">
            <h3>GearHarbor</h3>
            <Link href="/">Home</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/dashboard">Your dashboard</Link>
            <Link href="/register">Create an account</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© <CopyrightYear/> GearHarbor. Made for what&apos;s next.</p>
          <div><span>Find your gear. Make it happen.</span><ThemeToggle/></div>
        </div>
      </div>
    </footer>
  );
}
