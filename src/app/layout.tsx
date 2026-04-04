/**
 * layout.tsx — Root layout
 * Wraps every page with:
 *  - WalletProvider (global wallet state)
 *  - Toaster (toast notifications)
 *  - NavBar
 */

import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/lib/WalletContext';
import { Toaster } from 'react-hot-toast';
import NavBar from '@/components/ui/NavBar';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'StellarPay — Send Money Like a Message',
  description: 'Instant, transparent, near-zero-fee money transfers powered by Stellar blockchain.',
  keywords: ['stellar', 'blockchain', 'money transfer', 'remittance', 'xlm'],
  openGraph: {
    title: 'StellarPay — Send Money Like a Message',
    description: 'Instant Stellar testnet transfers with live INR pricing and transparent fees.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StellarPay',
    description: 'Instant Stellar testnet transfers with live INR pricing and transparent fees.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-white min-h-screen antialiased">
        <WalletProvider>
          <NavBar />
          <main className="max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
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
