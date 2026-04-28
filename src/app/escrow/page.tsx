'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/lib/WalletContext';
import {
  buildEscrowTxXdr, buildClaimBalanceTxXdr, submitSignedTxXdr,
  getMyEscrows, type EscrowBalance,
} from '@/lib/stellar';
import {
  ArrowLeft, Clock, CheckCircle2, AlertTriangle,
  Lock, Unlock, RefreshCw, ExternalLink, Plus, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function EscrowPage() {
  const router = useRouter();
  const { publicKey, isInitializing, signTx } = useWallet();

  const [showCreate, setShowCreate]     = useState(false);
  const [receiver, setReceiver]         = useState('');
  const [amount, setAmount]             = useState('');
  const [hours, setHours]               = useState('24');
  const [isCreating, setIsCreating]     = useState(false);
  const [createError, setCreateError]   = useState('');

  const [escrows, setEscrows]               = useState<EscrowBalance[]>([]);
  const [isLoadingEscrows, setIsLoadingEscrows] = useState(false);
  const [claimingId, setClaimingId]         = useState<string | null>(null);

  useEffect(() => { document.title = 'Escrow — StellarPay'; }, []);

  useEffect(() => {
    if (!isInitializing && !publicKey) router.replace('/');
  }, [publicKey, isInitializing, router]);

  const loadEscrows = useCallback(async () => {
    if (!publicKey) return;
    setIsLoadingEscrows(true);
    const data = await getMyEscrows(publicKey);
    setEscrows(data);
    setIsLoadingEscrows(false);
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) loadEscrows();
  }, [publicKey, loadEscrows]);

  if (isInitializing) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
    </div>
  );
  if (!publicKey) return null;

  const isValidAddress = (a: string) => a.startsWith('G') && a.length === 56;
  const canCreate = isValidAddress(receiver) && receiver !== publicKey && parseFloat(amount) > 0 && parseInt(hours) > 0;

  const handleCreate = async () => {
    if (!canCreate || !publicKey) return;
    setIsCreating(true);
    setCreateError('');
    const expiryDate = new Date(Date.now() + parseInt(hours) * 3_600_000);
    try {
      const unsignedXdr = await buildEscrowTxXdr(publicKey, receiver, amount, expiryDate);
      const signedXdr   = await signTx(unsignedXdr);
      const result      = await submitSignedTxXdr(signedXdr);
      toast.success('Escrow locked on Stellar!');
      setShowCreate(false);
      setReceiver('');
      setAmount('');
      setHours('24');
      await loadEscrows();
      window.open(result.explorerUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create escrow';
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClaim = async (escrow: EscrowBalance) => {
    if (!publicKey) return;
    setClaimingId(escrow.id);
    const toastId = toast.loading(escrow.role === 'receiver' ? 'Claiming funds…' : 'Refunding…');
    try {
      const unsignedXdr = await buildClaimBalanceTxXdr(publicKey, escrow.id);
      const signedXdr   = await signTx(unsignedXdr);
      const result      = await submitSignedTxXdr(signedXdr);
      toast.success(`Done! Tx: ${result.hash.slice(0, 10)}…`, { id: toastId });
      await loadEscrows();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      toast.error(msg, { id: toastId });
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Escrow</h1>
          <p className="text-slate-400 text-sm mt-0.5">Time-locked transfers via Stellar Claimable Balances</p>
        </div>
        <a
          href="https://github.com/ANSHSINGH5999/stellarpay/tree/main/contracts/escrow_contract"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors border border-brand-500/30 rounded-xl px-3 py-2"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Contract source
        </a>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-white text-sm">How Stellar Claimable Balance escrow works</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 text-xs text-slate-400">
          {[
            { icon: Lock,         step: '1. Lock',    desc: 'XLM is locked on-chain in a Claimable Balance until the receiver claims it or the expiry time passes.' },
            { icon: CheckCircle2, step: '2. Claim',   desc: 'Receiver calls claim() before the expiry to receive the funds directly to their wallet.' },
            { icon: RefreshCw,    step: '3. Refund',  desc: 'After expiry, sender can reclaim the funds. The Stellar network enforces the time lock.' },
          ].map(({ icon: Icon, step, desc }) => (
            <div key={step} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-brand-300 font-semibold">
                <Icon className="w-3.5 h-3.5" />
                {step}
              </div>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create form */}
      {!showCreate ? (
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full py-4 text-base"
        >
          <Plus className="w-5 h-5" />
          Create New Escrow
        </button>
      ) : (
        <div className="card flex flex-col gap-5">
          <h2 className="font-bold text-white text-lg">New Escrow</h2>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Receiver Address</label>
            <input
              type="text"
              placeholder="G... (56 characters)"
              value={receiver}
              onChange={e => setReceiver(e.target.value)}
              className="input-field font-mono text-sm"
            />
            {receiver && !isValidAddress(receiver) && (
              <p className="text-red-400 text-xs mt-1">Invalid Stellar address</p>
            )}
            {receiver && receiver === publicKey && (
              <p className="text-red-400 text-xs mt-1">Cannot send escrow to yourself</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Amount (XLM)</label>
            <input
              type="number"
              min="0.0000001"
              step="0.1"
              placeholder="10"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Expiry (hours from now)
            </label>
            <div className="flex gap-2">
              {[1, 6, 24, 72].map(h => (
                <button
                  key={h}
                  onClick={() => setHours(String(h))}
                  className={clsx(
                    'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                    hours === String(h)
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'border-surface-muted text-slate-500 hover:text-slate-300'
                  )}
                >
                  {h}h
                </button>
              ))}
              <input
                type="number"
                min="1"
                value={hours}
                onChange={e => setHours(e.target.value)}
                className="input-field w-20 text-sm text-center"
              />
            </div>
            {hours && parseInt(hours) > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Expires {new Date(Date.now() + parseInt(hours) * 3_600_000).toLocaleString()}
              </p>
            )}
          </div>

          {createError && (
            <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-3 text-sm text-red-300">
              {createError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setShowCreate(false); setCreateError(''); }}
              disabled={isCreating}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate || isCreating}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Locking…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Lock Funds
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Escrow list */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-lg">Active Escrows</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{escrows.length} total</span>
            <button
              onClick={loadEscrows}
              disabled={isLoadingEscrows}
              className="text-slate-500 hover:text-brand-400 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', isLoadingEscrows && 'animate-spin')} />
            </button>
          </div>
        </div>

        {isLoadingEscrows ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : escrows.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-sm">No active escrows</p>
            <p className="text-xs mt-1">Create an escrow above to lock funds for a receiver.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {escrows.map(e => {
              const canAction =
                (e.role === 'receiver' && !e.isExpired) ||
                (e.role === 'sender' && e.isExpired);
              const actionLabel = e.role === 'receiver' ? 'Claim' : 'Refund';
              const isClaiming = claimingId === e.id;

              return (
                <div key={e.id} className={clsx(
                  'rounded-2xl border p-4 transition-colors',
                  e.isExpired
                    ? 'border-slate-700/40 bg-slate-800/20'
                    : e.role === 'receiver'
                    ? 'border-emerald-500/25 bg-emerald-500/5'
                    : 'border-amber-500/25 bg-amber-500/5'
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                        e.role === 'receiver'
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                          : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                      )}>
                        {e.role === 'receiver' ? 'Received' : 'Sent'}
                      </span>
                      <span className={clsx(
                        'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
                        e.isExpired
                          ? 'border-slate-600/40 bg-slate-700/40 text-slate-400'
                          : 'border-brand-500/40 bg-brand-500/15 text-brand-300'
                      )}>
                        {e.isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/contract/${e.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-brand-400 transition-colors"
                      title="View on Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-lg font-bold text-white">{e.amount} {e.asset}</p>

                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                    {e.role === 'sender' ? (
                      <p className="font-mono truncate">→ {e.receiver}</p>
                    ) : (
                      <p className="font-mono truncate">← from {e.sponsor}</p>
                    )}
                    {e.expiresAt && (
                      <p className={clsx(e.isExpired ? 'text-slate-500' : 'text-amber-300')}>
                        {e.isExpired ? 'Expired' : 'Expires'} {new Date(e.expiresAt).toLocaleString()}
                      </p>
                    )}
                    <p className="text-slate-600 truncate font-mono text-[10px]">{e.id}</p>
                  </div>

                  {canAction && (
                    <button
                      onClick={() => handleClaim(e)}
                      disabled={isClaiming}
                      className={clsx(
                        'mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors',
                        e.role === 'receiver'
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                      )}
                    >
                      {isClaiming ? (
                        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : e.role === 'receiver' ? (
                        <Unlock className="w-4 h-4" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {isClaiming ? 'Processing…' : actionLabel}
                    </button>
                  )}

                  {e.role === 'receiver' && e.isExpired && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      Claim window expired — the sender can now refund.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
