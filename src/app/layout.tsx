import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import { SiteFooter } from '@/components/site-footer';
import { Inter } from 'next/font/google';

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
      className={`h-full antialiased ${inter.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}<SiteFooter/><Toaster richColors position="top-right" /></body>
    </html>
  );
}

