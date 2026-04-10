'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';
import { Zap, Plus, Key, AlertTriangle, Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { publicKey, createWallet, importWallet, isLoading, error } = useWallet();
  const [showImport, setShowImport] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // -- Already connected → show go-to-dashboard prompt --
  if (publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Wallet Connected!</h1>
          <p className="text-white/85 font-mono text-sm break-all max-w-md">
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

  // -- Create wallet handler --
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

  // -- Import wallet handler --
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

  const heroStats = [
    { label: 'Transfer time', value: '< 5 sec', accent: 'text-amber-300', panel: 'border-amber-400/20 bg-amber-400/8' },
    { label: 'Network fee', value: '₹0.003', accent: 'text-rose-200', panel: 'border-rose-400/20 bg-rose-400/8' },
    { label: 'Beta users', value: '30+', accent: 'text-emerald-200', panel: 'border-emerald-400/20 bg-emerald-400/8' },
  ];

  const featurePills = [
    { label: 'Instant settlement', icon: Zap, tone: 'border-amber-400/20 bg-amber-400/10 text-amber-100' },
    { label: 'Near-zero fees', icon: Coins, tone: 'border-rose-400/20 bg-rose-400/10 text-rose-100' },
    { label: 'Transparent ledger', icon: ShieldCheck, tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-14 px-4 py-8">
      <div className="max-w-3xl text-center animate-fade-in">
        <div className="mb-5 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/78 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Fast borderless money movement
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/6 backdrop-blur-sm shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <div className="absolute inset-0 rounded-[1.75rem] bg-[linear-gradient(145deg,rgba(250,204,21,0.18),transparent_42%,rgba(244,114,182,0.14))]" />
            <Zap className="relative h-11 w-11 text-white" fill="currentColor" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
          Move money with
          <span className="block bg-[linear-gradient(90deg,#ffffff_0%,#fde68a_42%,#fecdd3_78%,#bbf7d0_100%)] bg-clip-text text-transparent">
            message-speed clarity
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-white/82">
          StellarPay turns testnet transfers into a cleaner, calmer experience with instant delivery, visible fees, and a wallet flow that feels simple from the first click.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {featurePills.map(({ label, icon: Icon, tone }) => (
            <div
              key={label}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm ${tone}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {heroStats.map(({ label, value, accent, panel }) => (
            <div key={label} className={`rounded-2xl border px-5 py-4 text-left backdrop-blur-sm ${panel}`}>
              <div className={`text-2xl font-black ${accent}`}>{value}</div>
              <div className="mt-1 text-sm text-white/70">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg animate-slide-up rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-[1px] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="rounded-[calc(2rem-1px)] bg-[linear-gradient(180deg,rgba(10,10,10,0.9),rgba(10,10,10,0.82))] px-6 py-7 backdrop-blur-xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Wallet Setup</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Get Started</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                Create a free testnet wallet or import an existing one to explore the transfer flow.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-right">
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-100/70">Status</div>
              <div className="mt-1 text-sm font-semibold text-amber-200">Testnet Ready</div>
            </div>
          </div>

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
                className="btn-secondary flex items-center justify-center gap-2 w-full bg-black/75 hover:bg-zinc-900 border border-white/15"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 hover:text-white/85"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2 bg-amber-900/30 border border-amber-700/50 rounded-xl p-3 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Demo only. Never enter a real mainnet secret key in a web app.</span>
              </div>

              <button onClick={handleImport} disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Importing…' : 'Import Wallet'}
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="btn-secondary w-full bg-black/75 hover:bg-zinc-900 border border-white/15"
              >
                ← Back
              </button>
            </div>
          )}

          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
        </div>
      </div>

      <p className="max-w-md text-center text-xs leading-relaxed text-white/68">
        This app uses the Stellar <strong className="text-white">testnet</strong>. No real money is involved.
        All XLM here is free test currency for development purposes.
      </p>
    </div>
  );
}
