'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { HeaderNavigation } from './header-navigation';
import { AccountNav } from './account-nav';

export function MobileNavigation() {
  const menu = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => { if (menu.current) menu.current.open = false; }, [pathname]);
  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  return <details className="mobile-navigation" ref={menu} onKeyDown={event => {
    if (event.key === 'Escape' && menu.current) {
      menu.current.open = false;
      menu.current.querySelector('summary')?.focus();
    }
  }} onClickCapture={event => {
    if ((event.target as HTMLElement).closest('a, .account-menu-panel button') && menu.current) menu.current.open = false;
  }}>
    <summary aria-label="Open navigation menu"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span>Menu</span></summary>
    <div className="mobile-navigation-panel"><HeaderNavigation/><div className="mobile-account"><AccountNav/></div></div>
  </details>;
}
