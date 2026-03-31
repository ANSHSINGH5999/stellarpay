/**
 * page.tsx — Homepage / Onboarding
 * ─────────────────────────────────
 * First screen users see. Two paths:
 *  A) Create a new testnet wallet (Friendbot funded)
 *  B) Import an existing wallet via secret key
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';
import { Zap, Plus, Key, AlertTriangle, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { publicKey, createWallet, importWallet, isLoading, error } = useWallet();
  const [showImport, setShowImport] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // ── Already connected → show go-to-dashboard prompt ──────────────────────
  if (publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Wallet Connected!</h1>
          <p className="text-slate-400 font-mono text-sm break-all max-w-md">
            {publicKey}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard" className="btn-primary flex items-center gap-2">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/send" className="btn-secondary flex items-center gap-2">
            Send Money
          </Link>
        </div>
      </div>
    );
  }

  // ── Create wallet handler ─────────────────────────────────────────────────
  const handleCreate = async () => {
    const toastId = toast.loading('Creating wallet & requesting testnet funds…');
    try {
      await createWallet();
      toast.success('Wallet created! You got 10,000 test XLM 🎉', { id: toastId });
      router.push('/dashboard');
    } catch {
      toast.error('Failed to create wallet. Try again.', { id: toastId });
    }
  };

  // ── Import wallet handler ─────────────────────────────────────────────────
  const handleImport = async () => {
    if (!secretInput.trim()) {
      toast.error('Please enter your secret key');
      return;
    }
    const toastId = toast.loading('Importing wallet…');
    try {
      await importWallet(secretInput.trim());
      toast.success('Wallet imported!', { id: toastId });
      router.push('/dashboard');
    } catch {
      toast.error(error || 'Invalid secret key', { id: toastId });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="text-center max-w-2xl animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/20 border border-brand-500/30
                          flex items-center justify-center">
            <Zap className="w-10 h-10 text-brand-400" fill="currentColor" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          Send money like{' '}
          <span className="text-brand-400">sending a message</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Instant transfers. Near-zero fees. Full transparency. Powered by the Stellar blockchain.
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-8 mt-8">
          {[
            { label: 'Transfer time', value: '< 5 sec' },
            { label: 'Network fee',   value: '₹0.003' },
            { label: 'Transparent',   value: '100%' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-brand-400">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Wallet setup card ─────────────────────────────────────────────── */}
      <div className="card w-full max-w-md animate-slide-up">
        <h2 className="text-xl font-bold mb-1">Get Started</h2>
        <p className="text-slate-400 text-sm mb-6">
          Create a free testnet wallet — no real money needed.
        </p>

        {!showImport ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create New Wallet
            </button>

            <button
              onClick={() => setShowImport(true)}
              className="btn-secondary flex items-center justify-center gap-2 w-full"
            >
              <Key className="w-4 h-4" />
              Import Existing Wallet
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                placeholder="S... (your Stellar secret key)"
                value={secretInput}
                onChange={e => setSecretInput(e.target.value)}
                className="input-field pr-12 font-mono text-sm"
              />
              <button
                onClick={() => setShowSecret(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Warning: demo only */}
            <div className="flex gap-2 bg-amber-900/30 border border-amber-700/50 rounded-xl p-3 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Demo only. Never enter a real mainnet secret key in a web app.</span>
            </div>

            <button onClick={handleImport} disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Importing…' : 'Import Wallet'}
            </button>
            <button onClick={() => setShowImport(false)} className="btn-secondary w-full">
              ← Back
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-red-400 text-sm">{error}</p>
        )}
      </div>

      {/* ── Testnet disclaimer ─────────────────────────────────────────────── */}
      <p className="text-slate-600 text-xs text-center max-w-sm">
        This app uses the Stellar <strong className="text-slate-500">testnet</strong>. No real money is involved.
        All XLM here is free test currency for development purposes.
      </p>
    </div>
  );
}
