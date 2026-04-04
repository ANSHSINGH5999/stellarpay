/**
 * dashboard/page.tsx
 * ──────────────────────────────────────────────────────────
 * Main dashboard showing:
 *  - Wallet balance card with live indicator
 *  - Quick actions (Send, Refresh)
 *  - Recent transaction list
 *  - Wallet address QR/copy
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/lib/WalletContext';
import {
  Send, RefreshCw, Copy, ExternalLink,
  ArrowUpRight, ArrowDownLeft, Wallet, Clock, QrCode, Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStellarPrice } from '@/hooks/useStellarPrice';
import clsx from 'clsx';

export default function DashboardPage() {
  const router = useRouter();
  const { publicKey, balance, transactions, isLoading, refreshBalance } = useWallet();
  const { xlmToInr: liveXlmToInr, rate, lastUpdated } = useStellarPrice();

  useEffect(() => { document.title = 'Dashboard — StellarPay'; }, []);

  // Redirect to home if no wallet
  useEffect(() => {
    if (!publicKey) router.replace('/');
  }, [publicKey, router]);

  if (!publicKey) return null;

  const balanceInr = liveXlmToInr(parseFloat(balance)).toFixed(2);

  const copyAddress = () => {
    navigator.clipboard.writeText(publicKey);
    toast.success('Address copied!');
  };

  const handleRefresh = async () => {
    const t = toast.loading('Refreshing…');
    await refreshBalance();
    toast.success('Updated!', { id: t });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Your Stellar testnet wallet</p>
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

      {/* ── Balance card ──────────────────────────────────────────────────── */}
      <div className="card bg-gradient-to-br from-brand-900/40 to-surface-card
                      border-brand-800/50 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl" />

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
              <Wallet className="w-4 h-4" />
              Total Balance
              <span className="w-2 h-2 rounded-full bg-emerald-400 glow-pulse" />
              <span className="text-emerald-400 text-xs">Live</span>
            </div>
            <div className="text-4xl font-extrabold text-white">
              {parseFloat(balance).toFixed(2)}{' '}
              <span className="text-brand-400 text-2xl">XLM</span>
            </div>
            <div className="text-slate-400 text-lg mt-1">
              ≈ ₹{balanceInr}
            </div>
          </div>

          <div className="text-right">
            <div className="badge-info mb-2">Stellar Testnet</div>
            <div className="text-xs text-slate-500 font-mono">
              {publicKey.slice(0, 8)}…{publicKey.slice(-8)}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              1 XLM ≈ ₹{rate.toFixed(2)}
              {lastUpdated && <span className="ml-1 text-emerald-600 font-medium">● live</span>}
            </div>
          </div>
        </div>

        {/* Wallet address row */}
        <div className="mt-4 flex items-center gap-2 bg-surface/50 rounded-xl p-3">
          <span className="text-xs font-mono text-slate-400 flex-1 truncate">{publicKey}</span>
          <button onClick={copyAddress} className="text-slate-500 hover:text-brand-400 transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-brand-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link
          href="/send"
          className="card flex flex-col items-center gap-3 py-6 hover:border-brand-500
                     transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center
                          group-hover:bg-brand-500/30 transition-colors">
            <Send className="w-6 h-6 text-brand-400" />
          </div>
          <span className="font-semibold text-white text-sm">Send</span>
          <span className="text-xs text-slate-500">Transfer XLM</span>
        </Link>

        <Link
          href="/receive"
          className="card flex flex-col items-center gap-3 py-6 hover:border-emerald-500
                     transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-900/30 flex items-center justify-center
                          group-hover:bg-emerald-900/50 transition-colors">
            <QrCode className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="font-semibold text-white text-sm">Receive</span>
          <span className="text-xs text-slate-500">Share address</span>
        </Link>

        <Link
          href="/history"
          className="card flex flex-col items-center gap-3 py-6 hover:border-slate-500
                     transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center
                          group-hover:bg-slate-700 transition-colors">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <span className="font-semibold text-white text-sm">History</span>
          <span className="text-xs text-slate-500">View all txns</span>
        </Link>

        <Link
          href="/ops"
          className="card flex flex-col items-center gap-3 py-6 hover:border-brand-500
                     transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center
                          group-hover:bg-brand-500/25 transition-colors">
            <Gauge className="w-6 h-6 text-brand-300" />
          </div>
          <span className="font-semibold text-white text-sm">Ops Center</span>
          <span className="text-xs text-slate-500">Metrics & security</span>
        </Link>
      </div>

      {/* ── Recent transactions ───────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Recent Transactions</h2>
          <Link href="/history" className="text-brand-400 text-sm hover:underline">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No transactions yet.</p>
            <p className="text-xs mt-1">Send your first payment to see it here.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-surface-muted">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center gap-4 py-3">
                {/* Direction icon */}
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

                {/* Address + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 capitalize">{tx.type}</p>
                  <p className="text-xs text-slate-500 font-mono truncate">
                    {tx.type === 'sent' ? '→ ' : '← '}
                    {tx.counterpart.slice(0, 12)}…{tx.counterpart.slice(-6)}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className={clsx(
                    'font-semibold text-sm',
                    tx.type === 'sent' ? 'text-red-400' : 'text-emerald-400'
                  )}>
                    {tx.type === 'sent' ? '−' : '+'}{tx.amount} {tx.asset}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Explorer link */}
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-brand-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Testnet info bar ──────────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-600">
        Running on <strong className="text-slate-500">Stellar Testnet</strong> ·{' '}
        <a
          href="https://stellar.expert/explorer/testnet"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-brand-400 transition-colors"
        >
          Open Explorer ↗
        </a>
      </div>
    </div>
  );
}
