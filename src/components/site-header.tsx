import Link from 'next/link';
import { AccountNav } from './account-nav';
import { ThemeToggle } from './theme-toggle';
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        gear<span>harbor</span>
        <small>EQUIPMENT. POSSIBILITIES.</small>
      </Link>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/equipment">All equipment</Link>
        <Link href="/#how-it-works">How it works</Link>
      </nav>
      <div className="header-actions"><ThemeToggle/><AccountNav/></div>
      <details className="mobile-navigation">
        <summary>☰ Menu</summary>
        <div>
          <Link href="/">Home</Link>
          <Link href="/equipment">All equipment</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </details>
    </header>
  );
}
