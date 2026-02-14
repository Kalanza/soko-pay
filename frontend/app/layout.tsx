import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Soko Pay - Shop Instagram & WhatsApp Safely',
  description:
    'AI-powered escrow payments for social commerce in Kenya. Pay with M-Pesa, your money is protected until delivery.',
  keywords: ['escrow', 'M-Pesa', 'Kenya', 'social commerce', 'Instagram shopping', 'WhatsApp shopping'],
  openGraph: {
    title: 'Soko Pay - Shop Safely on Social Media',
    description: 'Your money, protected until delivery. Escrow payments for Instagram & WhatsApp shopping in Kenya.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
