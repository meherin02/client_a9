import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';


export const metadata: Metadata = {
  title: "GearHarbor | Equipment. Possibilities.",
  description: "Find equipment for your next project. Explore local daily, weekly, and monthly rentals with GearHarbor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}<Toaster richColors position="top-right" /></body>
    </html>
  );
}

