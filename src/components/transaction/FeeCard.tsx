/**
 * FeeCard.tsx
 * ────────────────────────────────────────────────
 * Transparent fee breakdown card.
 * Shows exactly what the sender pays and what
 * the receiver actually gets — no hidden costs.
 *
 * Usage:
 *   <FeeCard amountInr={500} />
 */

import { Info, TrendingDown } from 'lucide-react';
import { getFeeBreakdown } from '@/lib/stellar';

interface FeeCardProps {
  amountInr: number;
  className?: string;
}

export default function FeeCard({ amountInr, className = '' }: FeeCardProps) {
  const fb = getFeeBreakdown(amountInr);

  // Calculate savings vs traditional transfer (avg 3% fee)
  const traditionalFee  = (amountInr * 0.03).toFixed(2);
  const ourFee          = (0.10 + 0.003).toFixed(3);
  const savings         = (parseFloat(traditionalFee) - parseFloat(ourFee)).toFixed(2);

  return (
    <div className={`rounded-2xl border border-surface-muted overflow-hidden ${className}`}>

      {/* Header */}
      <div className="bg-surface-muted/40 px-4 py-3 flex items-center gap-2">
        <Info className="w-4 h-4 text-brand-400" />
        <span className="text-sm font-semibold text-slate-300">Fee Breakdown</span>
        <span className="ml-auto badge-success text-[10px]">Transparent</span>
      </div>

      {/* Main breakdown */}
      <div className="px-4 py-4 space-y-3 bg-surface-card">

        {/* You send */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">You send</span>
          <span className="text-white font-bold text-lg">₹{fb.youSend}</span>
        </div>

        {/* Divider with minus */}
        <div className="border-t border-surface-muted" />

        {/* Platform fee */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-slate-400">Platform fee</span>
            <span className="ml-2 text-[10px] text-slate-600 bg-surface-muted px-1.5 py-0.5 rounded">
              keeps lights on
            </span>
          </div>
          <span className="text-slate-300 font-mono">−₹{fb.platformFee}</span>
        </div>

        {/* Network fee */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-slate-400">Stellar network fee</span>
            <span className="ml-2 text-[10px] text-slate-600 bg-surface-muted px-1.5 py-0.5 rounded">
              100 stroops
            </span>
          </div>
          <span className="text-slate-300 font-mono">−₹{fb.networkFee}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-surface-muted" />

        {/* Receiver gets — highlighted */}
        <div className="flex justify-between items-center">
          <span className="text-slate-200 font-semibold">Receiver gets</span>
          <span className="text-emerald-400 font-bold text-xl">₹{fb.receiverGets}</span>
        </div>

        {/* XLM equivalent */}
        <div className="flex justify-between items-center text-xs text-slate-500 border-t border-surface-muted pt-2">
          <span>XLM sent on-chain</span>
          <span className="font-mono text-brand-400">{fb.xlmAmount} XLM</span>
        </div>
      </div>

      {/* Savings comparison */}
      <div className="px-4 py-3 bg-emerald-900/20 border-t border-emerald-900/40 flex items-start gap-2">
        <TrendingDown className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-300">
          <span className="font-semibold">You save ₹{savings}</span>
          {' '}vs traditional bank transfer (avg 3% fee = ₹{traditionalFee})
        </div>
      </div>
    </div>
  );
}
