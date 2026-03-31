'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';
import { Zap, LayoutDashboard, Send, Clock, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const NAV_LINKS = [
  { href: '/',          label: 'Home',       icon: Zap },
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/send',      label: 'Send Money', icon: Send },
  { href: '/history',   label: 'History',    icon: Clock },
];

export default function NavBar() {
  const pathname = usePathname();
  const { publicKey, balance, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  // Truncate long wallet addresses: GABC...XYZ
  const shortAddress = publicKey
    ? `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`
    : null;

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-surface-muted">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-400">
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
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-card'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>

        {/* Wallet chip */}
        {publicKey ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-2 bg-surface-card border border-surface-muted
                         rounded-xl px-3 py-2 text-sm hover:border-brand-500 transition-colors"
            >
              {/* Live indicator */}
              <span className="w-2 h-2 rounded-full bg-emerald-400 glow-pulse" />
              <span className="text-slate-300 font-mono text-xs">{shortAddress}</span>
              <span className="text-brand-400 font-semibold">{balance} XLM</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-card border border-surface-muted
                              rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-surface-muted">
                  <p className="text-xs text-slate-500">Connected wallet</p>
                  <p className="text-xs font-mono text-slate-300 truncate">{publicKey}</p>
                </div>
                <button
                  onClick={() => { disconnect(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-red-400
                             hover:bg-red-900/20 transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/" className="btn-primary py-2 px-4 text-sm">
            Connect Wallet
          </Link>
        )}
      </div>
    </nav>
  );
}
