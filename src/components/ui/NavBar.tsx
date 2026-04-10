'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';
import { Zap, LayoutDashboard, Send, Clock, ChevronDown, QrCode, Menu, X, Gauge } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const NAV_LINKS = [
  { href: '/',          label: 'Home',      icon: Zap },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/send',      label: 'Send',      icon: Send },
  { href: '/receive',   label: 'Receive',   icon: QrCode },
  { href: '/history',   label: 'History',   icon: Clock },
  { href: '/ops',       label: 'Ops',       icon: Gauge },
];

export default function NavBar() {
  const pathname = usePathname();
  const { publicKey, balance, disconnect } = useWallet();
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setWalletMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const shortAddress = publicKey
    ? `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`
    : null;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/78 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <Zap className="w-6 h-6" fill="currentColor" />
          StellarPay
          <span className="badge-warn text-[10px]">TESTNET</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-white/12 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/8'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Wallet chip */}
          {publicKey ? (
            <div className="relative">
              <button
                onClick={() => { setWalletMenuOpen(o => !o); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5
                           px-3 py-2 text-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 glow-pulse" />
                <span className="text-slate-300 font-mono text-xs hidden sm:block">{shortAddress}</span>
                <span className="text-white font-semibold text-xs sm:text-sm">{parseFloat(balance).toFixed(1)} XLM</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {walletMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-xs text-slate-500">Connected wallet</p>
                    <p className="text-xs font-mono text-slate-300 truncate">{publicKey}</p>
                  </div>
                  <Link
                    href="/receive"
                    onClick={() => setWalletMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-200 transition-colors
                               hover:bg-white/6"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    Receive XLM
                  </Link>
                  <button
                    onClick={() => { disconnect(); setWalletMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-red-400
                               hover:bg-red-900/20 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/" className="btn-primary py-2 px-4 text-sm hidden sm:block">
              Connect Wallet
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => { setMobileMenuOpen(o => !o); setWalletMenuOpen(false); }}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="bg-[#0a0a0a] border-t border-white/10 md:hidden">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-white/12 text-white'
                    : 'text-slate-300 hover:bg-white/6 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
