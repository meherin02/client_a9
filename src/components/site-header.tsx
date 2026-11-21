import Link from 'next/link';
import { AccountNav } from './account-nav';
export function SiteHeader() { return <header><Link className="brand" href="/">gear<span>harbor</span><small>EQUIPMENT. POSSIBILITIES.</small></Link><nav><Link href="/">Home</Link><Link href="/equipment">Explore equipment</Link><Link href="/#how-it-works">How it works</Link></nav><AccountNav /></header>; }
