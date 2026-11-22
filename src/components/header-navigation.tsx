'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { label: 'Home', href: '/', matches: (path: string) => path === '/' },
  { label: 'All equipment', href: '/equipment', matches: (path: string) => path === '/equipment' || path.startsWith('/equipment/') },
  { label: 'How it works', href: '/#how-it-works', matches: () => false },
];

export function HeaderNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Main navigation">
    {links.map(link => <Link key={link.href} href={link.href} aria-current={link.matches(pathname) ? 'page' : undefined}>{link.label}</Link>)}
  </nav>;
}
