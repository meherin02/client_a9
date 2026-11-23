import Link from 'next/link';
import { AccountNav } from './account-nav';
import { ThemeToggle } from './theme-toggle';
import { HeaderNavigation } from './header-navigation';
import { MobileNavigation } from './mobile-navigation';
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        gear<span>harbor</span>
        <small>EQUIPMENT. POSSIBILITIES.</small>
      </Link>
      <HeaderNavigation />
      <div className="header-actions"><ThemeToggle/><AccountNav/></div>
      <MobileNavigation/>
    </header>
  );
}
