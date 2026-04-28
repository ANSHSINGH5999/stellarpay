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
import Waves from '@/components/ui/Waves';

export const metadata: Metadata = {
  title: 'StellarPay — Decentralized Payments on Stellar',
  description: 'A Soroban-powered dApp for instant, transparent XLM transfers with live INR pricing, on-chain fee logic, and time-locked escrow.',
  keywords: ['stellar', 'soroban', 'blockchain', 'dapp', 'money transfer', 'remittance', 'xlm', 'smart contracts', 'escrow'],
  openGraph: {
    title: 'StellarPay — Decentralized Payments on Stellar',
    description: 'A Soroban-powered dApp for instant XLM transfers with on-chain fee logic and time-locked escrow.',
    type: 'website',
    url: 'https://stellarpay-bxs8.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StellarPay — Soroban dApp',
    description: 'Instant Stellar testnet transfers with live INR pricing, transparent fees, and Soroban smart contracts.',
    creator: '@anshansh5999',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-white min-h-screen antialiased">
        <WalletProvider>
          <NavBar />
          <div className="relative min-h-[calc(100vh-4rem)]">
            <Waves
              lineColor="rgba(255, 255, 255, 0.22)"
              backgroundColor="rgba(255, 255, 255, 0.028)"
              waveSpeedX={0.0125}
              waveSpeedY={0.01}
              waveAmpX={48}
              waveAmpY={24}
              friction={0.9}
              tension={0.01}
              maxCursorMove={120}
              xGap={11}
              yGap={32}
              className="z-0"
            />
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.09),_transparent_26%),radial-gradient(circle_at_78%_18%,_rgba(244,114,182,0.09),_transparent_22%),linear-gradient(180deg,_rgba(5,5,5,0.06)_0%,_rgba(5,5,5,0.38)_62%,_rgba(0,0,0,0.82)_100%)]" />
            <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
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
