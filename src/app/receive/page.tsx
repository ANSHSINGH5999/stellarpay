/**
 * receive/page.tsx
 * ──────────────────────────────────────────────────────────
 * Wallet receive page — lets users share their Stellar address.
 * Added in v1.1 based on user feedback:
 *   "How do I share my address so someone can pay me?"
 *   "The address is too long to type manually."
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/lib/WalletContext';
import { Copy, ExternalLink, CheckCircle2, ArrowLeft, Share2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStellarPrice } from '@/hooks/useStellarPrice';

export default function ReceivePage() {
  const router = useRouter();
  const { publicKey, balance, isInitializing } = useWallet();
  const { xlmToInr, rate } = useStellarPrice();
  const [copied, setCopied] = useState(false);

  useEffect(() => { document.title = 'Receive XLM — StellarPay'; }, []);

  useEffect(() => {
    if (!isInitializing && !publicKey) router.replace('/');
  }, [publicKey, isInitializing, router]);

  if (isInitializing) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
    </div>
  );
  if (!publicKey) return null;

  const balanceInr = xlmToInr(parseFloat(balance)).toFixed(2);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My StellarPay Wallet',
          text: `Send me XLM on Stellar testnet: ${publicKey}`,
        });
      } catch {
        // User cancelled share dialog
      }
    } else {
      copyAddress();
    }
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Receive XLM</h1>
          <p className="text-slate-400 text-sm mt-0.5">Share your address to receive payments</p>
        </div>
      </div>

      {/* Balance pill */}
      <div className="flex items-center gap-2 bg-surface-card border border-surface-muted rounded-xl px-4 py-3">
        <Wallet className="w-4 h-4 text-brand-400" />
        <span className="text-slate-400 text-sm">Current balance:</span>
        <span className="text-white font-semibold">{parseFloat(balance).toFixed(2)} XLM</span>
        <span className="text-slate-500 text-sm">≈ ₹{balanceInr}</span>
      </div>

      {/* Address card */}
      <div className="card flex flex-col gap-5">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-3">Your Stellar Wallet Address</p>

          {/* Visual address display */}
          <div className="bg-surface border-2 border-brand-500/30 rounded-2xl p-5 mb-4">
            {/* Address in chunks for readability */}
            <p className="font-mono text-white text-xs leading-relaxed break-all select-all tracking-wide">
              {publicKey.match(/.{1,8}/g)?.map((chunk, i) => (
                <span key={i}>
                  <span className={i % 2 === 0 ? 'text-brand-400' : 'text-white'}>{chunk}</span>
                  {i < (publicKey.match(/.{1,8}/g)?.length ?? 0) - 1 && ' '}
                </span>
              ))}
            </p>
          </div>

          <p className="text-slate-500 text-xs">
            This is your Stellar testnet address. Anyone can send XLM to this address.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={copyAddress}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold
                        transition-all duration-200 ${
                          copied
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                            : 'btn-primary'
                        }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Address
              </>
            )}
          </button>

          <button
            onClick={shareAddress}
            className="btn-secondary flex items-center justify-center gap-2 px-4"
            title="Share address"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Copy as payment URI */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(`web+stellar:pay?destination=${publicKey}`);
            toast.success('Payment URI copied!');
          }}
          className="w-full text-xs text-slate-500 hover:text-brand-400 transition-colors py-2 font-mono"
        >
          Copy as web+stellar: payment URI
        </button>
      </div>

      {/* Instructions card */}
      <div className="card flex flex-col gap-4">
        <h3 className="font-semibold text-white">How to receive XLM</h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Copy your wallet address above' },
            { step: '2', text: 'Share it with the sender via WhatsApp, email, or any chat' },
            { step: '3', text: 'Ask them to paste it in the "Receiver Address" field on StellarPay' },
            { step: '4', text: 'The XLM will arrive in your wallet within 5 seconds' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40
                              flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-400">
                {step}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rate info */}
      <div className="text-center text-xs text-slate-600">
        <p>Current rate: 1 XLM ≈ ₹{rate.toFixed(2)} (live)</p>
      </div>

      {/* Explorer link */}
      <a
        href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-slate-500 hover:text-brand-400
                   transition-colors text-sm"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View on Stellar Explorer
      </a>
    </div>
  );
}
