/**
 * WalletCard.tsx
 * ─────────────────────────────────────────────
 * Compact wallet display card, reusable across pages.
 * Shows: balance, address (truncated), copy + explorer link.
 */

'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Check, Wallet } from 'lucide-react';
import { xlmToInr } from '@/lib/stellar';
import clsx from 'clsx';

interface WalletCardProps {
  publicKey: string;
  balance:   string;
  compact?:  boolean;   // compact mode for sidebars / small spaces
}

export default function WalletCard({ publicKey, balance, compact = false }: WalletCardProps) {
  const [copied, setCopied] = useState(false);

  const balanceInr = xlmToInr(parseFloat(balance)).toFixed(2);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const short = `${publicKey.slice(0, 6)}…${publicKey.slice(-6)}`;

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-surface-card rounded-xl px-3 py-2 border border-surface-muted">
        <Wallet className="w-4 h-4 text-brand-400 flex-shrink-0" />
        <span className="text-sm font-mono text-slate-300">{short}</span>
        <span className="text-sm font-bold text-brand-400 ml-auto">{parseFloat(balance).toFixed(2)} XLM</span>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-brand-400" />
        <h3 className="font-semibold text-slate-200">Your Wallet</h3>
        <span className="ml-auto badge-info">Testnet</span>
      </div>

      {/* Balance */}
      <div className="text-center py-4">
        <div className="text-3xl font-extrabold text-white">
          {parseFloat(balance).toFixed(4)}{' '}
          <span className="text-brand-400 text-xl">XLM</span>
        </div>
        <div className="text-slate-400 mt-1">≈ ₹{balanceInr}</div>
      </div>

      {/* Address */}
      <div className="flex items-center gap-2 bg-surface rounded-xl p-3 mt-2">
        <span className="text-xs font-mono text-slate-400 flex-1 truncate">{publicKey}</span>
        <button
          onClick={handleCopy}
          className={clsx(
            'transition-colors flex-shrink-0',
            copied ? 'text-emerald-400' : 'text-slate-500 hover:text-brand-400'
          )}
          title="Copy address"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <a
          href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-brand-400 transition-colors flex-shrink-0"
          title="View on Stellar Explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
