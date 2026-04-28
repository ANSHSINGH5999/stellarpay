'use client';

import Link from 'next/link';
import { Zap, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-muted mt-16">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-brand-500" fill="currentColor" />
          <span className="font-semibold text-slate-500">StellarPay</span>
          <span>— Soroban dApp on Stellar Testnet</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Horizon testnet live
          </span>
          <Link href="/ops" className="hover:text-brand-400 transition-colors">
            Ops Center
          </Link>
          <Link href="/escrow" className="hover:text-brand-400 transition-colors">
            Escrow
          </Link>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-400 transition-colors flex items-center gap-1"
          >
            Explorer <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/ANSHSINGH5999/stellarpay"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-400 transition-colors flex items-center gap-1"
          >
            GitHub <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/ANSHSINGH5999/stellarpay/blob/main/docs/security-checklist.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-400 transition-colors flex items-center gap-1"
          >
            Security <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
