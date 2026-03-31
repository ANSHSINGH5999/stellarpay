/**
 * layout.tsx — Root layout
 * Wraps every page with:
 *  - WalletProvider (global wallet state)
 *  - Toaster (toast notifications)
 *  - NavBar
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/lib/WalletContext';
import { Toaster } from 'react-hot-toast';
import NavBar from '@/components/ui/NavBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'StellarPay — Send Money Like a Message',
  description: 'Instant, transparent, near-zero-fee money transfers powered by Stellar blockchain.',
  keywords: ['stellar', 'blockchain', 'money transfer', 'remittance', 'xlm'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-surface text-white min-h-screen antialiased">
        <WalletProvider>
          <NavBar />
          <main className="max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color:      '#f1f5f9',
                border:     '1px solid #334155',
                fontFamily: 'var(--font-inter)',
              },
              success: { iconTheme: { primary: '#38bdf8', secondary: '#0f172a' } },
              error:   { iconTheme: { primary: '#f87171', secondary: '#0f172a' } },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
