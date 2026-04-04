/**
 * send/page.tsx
 * ──────────────────────────────────────────────────────────
 * The core "Send Money" flow:
 *  1. User enters INR amount + receiver address
 *  2. App shows transparent fee breakdown
 *  3. User confirms → transaction sent via Stellar SDK
 *  4. Success screen with tx hash, time, explorer link
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';
import { sendPayment, getFeeBreakdown } from '@/lib/stellar';
import { useStellarPrice } from '@/hooks/useStellarPrice';
import {
  Send, ArrowRight, CheckCircle2, ExternalLink,
  AlertTriangle, Info, Zap, Clock, Shield, Clipboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type Step = 'input' | 'confirm' | 'sending' | 'success';

interface TxResult {
  hash:        string;
  timeSeconds: number;
  fee:         string;
  explorerUrl: string;
}

export default function SendPage() {
  const router     = useRouter();
  const { publicKey, secretKey, balance, refreshBalance } = useWallet();
  const { rate: xlmRate } = useStellarPrice();

  // Form state
  const [amountInr,  setAmountInr]  = useState('');
  const [receiver,   setReceiver]   = useState('');
  const [memo,       setMemo]       = useState('');
  const [step,       setStep]       = useState<Step>('input');
  const [txResult,   setTxResult]   = useState<TxResult | null>(null);
  const [sendError,  setSendError]  = useState('');

  // Redirect if no wallet
  useEffect(() => {
    if (!publicKey) router.replace('/');
  }, [publicKey, router]);

  if (!publicKey || !secretKey) return null;

  // ── Fee breakdown (computed whenever amount or live rate changes) ─────────
  const feeBreakdown = useMemo(() => {
    const amount = parseFloat(amountInr);
    if (!amountInr || isNaN(amount) || amount <= 0) return null;
    return getFeeBreakdown(amount, xlmRate);
  }, [amountInr, xlmRate]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const isValidAddress = (addr: string) => addr.startsWith('G') && addr.length === 56;
  const amount = parseFloat(amountInr);
  const balanceXLM = parseFloat(balance);
  const neededXLM = feeBreakdown ? parseFloat(feeBreakdown.xlmAmount) : 0;

  const errors = {
    amount:   !amountInr ? '' : isNaN(amount) || amount <= 0 ? 'Enter a valid amount' : amount < 1 ? 'Minimum ₹1' : '',
    receiver: !receiver ? '' : !isValidAddress(receiver) ? 'Invalid Stellar address (must start with G, 56 chars)' : receiver === publicKey ? 'Cannot send to yourself' : '',
    balance:  feeBreakdown && neededXLM > balanceXLM - 1 ? `Insufficient balance (need ${neededXLM.toFixed(4)} XLM, have ${balance})` : '',
  };

  const canProceed = amountInr && receiver && !errors.amount && !errors.receiver && !errors.balance;

  // ── Step 1 → Step 2 (show confirmation) ──────────────────────────────────
  const handlePreview = () => {
    if (!canProceed) return;
    setStep('confirm');
  };

  // ── Step 2 → Step 3/4 (send transaction) ─────────────────────────────────
  const handleSend = async () => {
    if (!feeBreakdown) return;
    setSendError('');
    setStep('sending');

    try {
      const result = await sendPayment(
        secretKey,
        receiver.trim(),
        feeBreakdown.xlmAmount,   // send the XLM equivalent
        memo || undefined
      );

      setTxResult(result);
      setStep('success');

      // Refresh balance after sending
      await refreshBalance();
      toast.success('Transaction confirmed on Stellar! ⚡');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Transaction failed. Please try again.');
      setStep('confirm');
    }
  };

  // ── Reset form ────────────────────────────────────────────────────────────
  const handleReset = () => {
    setAmountInr('');
    setReceiver('');
    setMemo('');
    setTxResult(null);
    setSendError('');
    setStep('input');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: Success screen
  // ──────────────────────────────────────────────────────────────────────────
  if (step === 'success' && txResult) {
    return (
      <div className="max-w-md mx-auto animate-slide-up">
        <div className="card text-center flex flex-col items-center gap-4">

          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Money Sent! ⚡</h2>
            <p className="text-slate-400 text-sm mt-1">Transaction confirmed on Stellar</p>
          </div>

          {/* Stats */}
          <div className="w-full grid grid-cols-3 gap-3">
            {[
              { icon: Zap,    label: 'Speed',   value: `${txResult.timeSeconds}s` },
              { icon: Shield, label: 'Fee',      value: `${txResult.fee} XLM` },
              { icon: Clock,  label: 'Ledger',   value: 'Confirmed' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-surface rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 mx-auto mb-1 text-brand-400" />
                <div className="text-white font-semibold text-sm">{value}</div>
                <div className="text-slate-500 text-xs">{label}</div>
              </div>
            ))}
          </div>

          {/* Amount summary */}
          <div className="w-full bg-surface rounded-xl p-4 text-sm text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">You sent</span>
              <span className="text-white font-medium">₹{amountInr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Receiver gets</span>
              <span className="text-emerald-400 font-medium">₹{feeBreakdown?.receiverGets}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">To</span>
              <span className="text-slate-400 font-mono">
                {receiver.slice(0, 8)}…{receiver.slice(-6)}
              </span>
            </div>
          </div>

          {/* Transaction hash */}
          <div className="w-full bg-surface rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500">Transaction Hash</p>
              <button
                onClick={() => { navigator.clipboard.writeText(txResult.hash); toast.success('Hash copied!'); }}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                <Clipboard className="w-3 h-3" /> Copy
              </button>
            </div>
            <p className="text-xs font-mono text-slate-300 break-all">{txResult.hash}</p>
          </div>

          {/* Explorer link */}
          <a
            href={txResult.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 btn-secondary"
          >
            <ExternalLink className="w-4 h-4" />
            View on Stellar Explorer
          </a>

          <div className="flex gap-3 w-full">
            <button onClick={handleReset} className="btn-primary flex-1">
              Send Again
            </button>
            <button onClick={() => router.push('/dashboard')} className="btn-secondary flex-1">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER: Input + Confirm forms
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Send Money</h1>
        <p className="text-slate-400 text-sm mt-1">Instant transfer on Stellar testnet</p>
      </div>

      {/* ── Step indicator ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm">
        {['Input', 'Confirm', 'Sent'].map((label, i) => {
          const currentStep = step === 'input' ? 0 : step === 'confirm' ? 1 : 2;
          const done        = i < currentStep;
          const active      = i === currentStep;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                done   ? 'bg-brand-500 text-white' :
                active ? 'bg-brand-500/30 text-brand-400 border border-brand-500' :
                         'bg-surface-muted text-slate-500'
              )}>
                {done ? '✓' : i + 1}
              </div>
              <span className={active ? 'text-white font-medium' : 'text-slate-500'}>{label}</span>
              {i < 2 && <ArrowRight className="w-3 h-3 text-slate-600" />}
            </div>
          );
        })}
      </div>

      {/* ── INPUT FORM ─────────────────────────────────────────────────────── */}
      {step === 'input' && (
        <div className="card flex flex-col gap-5">

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
              <input
                type="number"
                min="1"
                placeholder="500"
                value={amountInr}
                onChange={e => setAmountInr(e.target.value)}
                className="input-field pl-8 text-xl font-semibold"
              />
            </div>
            {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}

            {/* Quick amount buttons */}
            <div className="flex gap-2 mt-2">
              {[100, 500, 1000, 2000, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmountInr(String(amt))}
                  className={clsx(
                    'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                    amountInr === String(amt)
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'border-surface-muted text-slate-500 hover:text-slate-300'
                  )}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Receiver address */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
              Receiver's Stellar Address
              <button
                type="button"
                onClick={async () => {
                  const text = await navigator.clipboard.readText();
                  setReceiver(text.trim());
                }}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5" /> Paste
              </button>
            </label>
            <input
              type="text"
              placeholder="GABC...XYZ (56 characters starting with G)"
              value={receiver}
              onChange={e => setReceiver(e.target.value)}
              className="input-field font-mono text-sm"
            />
            {errors.receiver && <p className="text-red-400 text-xs mt-1">{errors.receiver}</p>}
            {errors.balance  && <p className="text-red-400 text-xs mt-1">{errors.balance}</p>}
          </div>

          {/* Optional memo */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                Memo <span className="text-slate-500 text-xs">(optional)</span>
              </span>
              <span className={clsx(
                'text-xs font-mono',
                memo.length > 24 ? 'text-amber-400' : 'text-slate-600'
              )}>
                {28 - memo.length} chars left
              </span>
            </label>
            <input
              type="text"
              maxLength={28}
              placeholder="e.g. Rent for June"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          {/* Live fee preview */}
          {feeBreakdown && !errors.amount && (
            <div className="bg-surface rounded-xl p-4 border border-surface-muted">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                <Info className="w-3.5 h-3.5" />
                Fee Breakdown (transparent)
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">You send</span>
                  <span className="text-white font-semibold">₹{feeBreakdown.youSend}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Platform fee</span>
                  <span className="text-slate-400">−₹{feeBreakdown.platformFee}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Stellar network fee</span>
                  <span className="text-slate-400">−₹{feeBreakdown.networkFee}</span>
                </div>
                <div className="border-t border-surface-muted pt-2 flex justify-between font-semibold">
                  <span className="text-slate-300">Receiver gets</span>
                  <span className="text-emerald-400">₹{feeBreakdown.receiverGets}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>XLM to send</span>
                  <span className="font-mono">{feeBreakdown.xlmAmount} XLM</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-surface-muted">
                  <span>Rate used</span>
                  <span>1 XLM = ₹{xlmRate.toFixed(2)} (live)</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handlePreview}
            disabled={!canProceed}
            className="btn-primary flex items-center justify-center gap-2 w-full"
          >
            Review Transfer <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── CONFIRM STEP ───────────────────────────────────────────────────── */}
      {(step === 'confirm' || step === 'sending') && feeBreakdown && (
        <div className="card flex flex-col gap-5">
          <h2 className="text-lg font-bold">Confirm Transfer</h2>

          {/* Summary */}
          <div className="space-y-3">
            {[
              { label: 'You send',      value: `₹${feeBreakdown.youSend}`,      highlight: false },
              { label: 'Platform fee',  value: `₹${feeBreakdown.platformFee}`,  highlight: false },
              { label: 'Network fee',   value: `₹${feeBreakdown.networkFee}`,   highlight: false },
              { label: 'Receiver gets', value: `₹${feeBreakdown.receiverGets}`, highlight: true  },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={clsx(
                'flex justify-between py-2 border-b border-surface-muted',
                highlight && 'border-b-0 text-lg'
              )}>
                <span className={highlight ? 'font-bold text-white' : 'text-slate-400 text-sm'}>{label}</span>
                <span className={highlight ? 'font-bold text-emerald-400' : 'text-slate-300 text-sm'}>{value}</span>
              </div>
            ))}
          </div>

          {/* Receiver */}
          <div className="bg-surface rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">Sending to</p>
            <p className="font-mono text-sm text-slate-300 break-all">{receiver}</p>
          </div>

          {memo && (
            <div className="bg-surface rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Memo</p>
              <p className="text-sm text-slate-300">{memo}</p>
            </div>
          )}

          {/* Warning */}
          <div className="flex gap-2 bg-amber-900/30 border border-amber-700/50 rounded-xl p-3 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Stellar transactions are irreversible. Double-check the receiver address.</span>
          </div>

          {/* Error */}
          {sendError && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-sm text-red-300">
              {sendError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('input')}
              disabled={step === 'sending'}
              className="btn-secondary flex-1"
            >
              ← Edit
            </button>
            <button
              onClick={handleSend}
              disabled={step === 'sending'}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {step === 'sending' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirm & Send
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
