import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import { SiteFooter } from '@/components/site-footer';
import { Inter } from 'next/font/google';
import { ThemeSync } from '@/components/theme-toggle';
import { themeInitScript } from '@/lib/theme-script';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});


export const metadata: Metadata = {
  title: "GearHarbor | Equipment. Possibilities.",
  icons: { icon: '/icon.svg', shortcut: '/icon.svg' },
  description: "Find equipment for your next project. Explore local daily, weekly, and monthly rentals with GearHarbor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${inter.variable}`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }}/></head>
      <body className="min-h-full flex flex-col"><ThemeSync/>{children}<SiteFooter/><Toaster richColors position="top-right" /></body>
    </html>
  );
}

