/**
 * history/page.tsx
 * Full transaction history with explorer links
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { xlmToInr } from '@/lib/stellar';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type Filter = 'all' | 'sent' | 'received';

export default function HistoryPage() {
  const router = useRouter();
  const { publicKey, transactions, isLoading, refreshBalance } = useWallet();
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { document.title = 'History — StellarPay'; }, []);

  useEffect(() => {
    if (!publicKey) router.replace('/');
  }, [publicKey, router]);

  if (!publicKey) return null;

  const handleRefresh = async () => {
    const t = toast.loading('Refreshing transactions…');
    await refreshBalance();
    toast.success('Updated!', { id: t });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-slate-400 text-sm mt-1">All payments on your account</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
        >
          <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'sent', 'received'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors',
              filter === f
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm mt-1">Your payment history will appear here.</p>
          </div>
        ) : (() => {
            const filtered = transactions.filter(tx => filter === 'all' || tx.type === filter);
            if (filtered.length === 0) return (
              <div className="text-center py-12 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No {filter} transactions found.</p>
              </div>
            );
            return (
          <div className="flex flex-col gap-1">
            {filtered.map((tx, i) => {
              const amtInr = xlmToInr(parseFloat(tx.amount)).toFixed(2);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface transition-colors"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Icon */}
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    tx.type === 'sent'
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-emerald-900/30 text-emerald-400'
                  )}>
                    {tx.type === 'sent'
                      ? <ArrowUpRight className="w-5 h-5" />
                      : <ArrowDownLeft className="w-5 h-5" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 capitalize">
                      {tx.type === 'sent' ? 'Sent' : 'Received'}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {tx.type === 'sent' ? '→ ' : '← '}
                      {tx.counterpart}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={clsx(
                      'font-bold',
                      tx.type === 'sent' ? 'text-red-400' : 'text-emerald-400'
                    )}>
                      {tx.type === 'sent' ? '−' : '+'}{tx.amount} XLM
                    </p>
                    <p className="text-xs text-slate-500">≈ ₹{amtInr}</p>
                  </div>

                  {/* Explorer */}
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-brand-400 transition-colors flex-shrink-0"
                    title="View on Stellar Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
            );
          })()}
      </div>

      {/* Summary stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {(() => {
            const sent     = transactions.filter(t => t.type === 'sent').reduce((s, t) => s + parseFloat(t.amount), 0);
            const received = transactions.filter(t => t.type === 'received').reduce((s, t) => s + parseFloat(t.amount), 0);
            const net      = received - sent;
            return [
              { label: 'Total Sent',     value: sent.toFixed(2) + ' XLM',                color: 'text-red-400'     },
              { label: 'Total Received', value: received.toFixed(2) + ' XLM',            color: 'text-emerald-400' },
              { label: 'Net Flow',       value: (net >= 0 ? '+' : '') + net.toFixed(2) + ' XLM', color: net >= 0 ? 'text-emerald-400' : 'text-red-400' },
              { label: 'Transactions',   value: String(transactions.length),             color: 'text-brand-400'   },
            ];
          })().map(({ label, value, color }) => (
            <div key={label} className="card text-center py-4">
              <div className={`text-lg font-bold ${color}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
