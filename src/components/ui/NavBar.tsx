'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';
import {
  Zap, LayoutDashboard, Send, Clock, ChevronDown, QrCode,
  Menu, X, Gauge, Lock, Wallet, Plus, Key, Eye, EyeOff, AlertTriangle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const PUBLIC_LINKS    = [{ href: '/',          label: 'Home',      icon: Zap }];
const PROTECTED_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/send',      label: 'Send',      icon: Send },
  { href: '/receive',   label: 'Receive',   icon: QrCode },
  { href: '/history',   label: 'History',   icon: Clock },
  { href: '/escrow',    label: 'Escrow',    icon: Lock },
  { href: '/ops',       label: 'Ops',       icon: Gauge },
];

export default function NavBar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const {
    publicKey, balance, isLoading,
    createWallet, importWallet, connectFreighter,
    disconnect,
  } = useWallet();

  const [walletMenuOpen,  setWalletMenuOpen]  = useState(false);
  const [connectOpen,     setConnectOpen]     = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);

  // Connect panel state
  const [showImport,      setShowImport]      = useState(false);
  const [secretInput,     setSecretInput]     = useState('');
  const [showSecret,      setShowSecret]      = useState(false);
  const [connecting,      setConnecting]      = useState<'freighter'|'create'|'import'|null>(null);

  const walletMenuRef  = useRef<HTMLDivElement>(null);
  const connectPanelRef = useRef<HTMLDivElement>(null);

  const navLinks = publicKey ? [...PUBLIC_LINKS, ...PROTECTED_LINKS] : PUBLIC_LINKS;

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setWalletMenuOpen(false); setConnectOpen(false); setMobileMenuOpen(false); }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  // Close wallet dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(e.target as Node)) setWalletMenuOpen(false);
    };
    if (walletMenuOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [walletMenuOpen]);

  // Close connect panel on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (connectPanelRef.current && !connectPanelRef.current.contains(e.target as Node)) {
        setConnectOpen(false);
        setShowImport(false);
        setSecretInput('');
      }
    };
    if (connectOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [connectOpen]);

  // Auto-close connect panel once wallet connects
  useEffect(() => {
    if (publicKey && connectOpen) {
      setConnectOpen(false);
      setShowImport(false);
      setSecretInput('');
    }
  }, [publicKey, connectOpen]);

  const shortAddress = publicKey ? `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}` : null;
  const displayBalance = isLoading ? '…' : `${parseFloat(balance).toFixed(1)} XLM`;

  // ── Connect handlers ──────────────────────────────────────────────────────
  const handleFreighter = async () => {
    setConnecting('freighter');
    try {
      await connectFreighter();
      toast.success('Freighter connected!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Freighter connection failed');
    } finally {
      setConnecting(null);
    }
  };

  const handleCreate = async () => {
    setConnecting('create');
    const id = toast.loading('Creating wallet & requesting testnet funds…');
    try {
      await createWallet();
      toast.success('Wallet created! You got 10,000 test XLM', { id });
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create wallet', { id });
    } finally {
      setConnecting(null);
    }
  };

  const handleImport = async () => {
    if (!secretInput.trim()) { toast.error('Enter your secret key'); return; }
    setConnecting('import');
    const id = toast.loading('Importing wallet…');
    try {
      await importWallet(secretInput.trim());
      toast.success('Wallet imported!', { id });
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid secret key', { id });
    } finally {
      setConnecting(null);
    }
  };

  const isAnyConnecting = connecting !== null;

  // ── Connect panel (shared between desktop + mobile) ───────────────────────
  const ConnectPanel = () => (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Connect Wallet</p>

      {/* Freighter */}
      <button
        onClick={handleFreighter}
        disabled={isAnyConnecting}
        className="flex items-center gap-3 w-full rounded-xl border border-brand-500/40 bg-brand-500/10
                   px-4 py-3 text-sm font-semibold text-brand-200 hover:bg-brand-500/20
                   transition-colors disabled:opacity-50"
      >
        {connecting === 'freighter'
          ? <span className="w-4 h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin flex-shrink-0" />
          : <Wallet className="w-4 h-4 flex-shrink-0" />}
        {connecting === 'freighter' ? 'Connecting…' : 'Connect Freighter'}
        <span className="ml-auto text-[10px] text-brand-400/70 font-normal">Recommended</span>
      </button>

      <div className="flex items-center gap-2 text-[11px] text-slate-700">
        <div className="flex-1 h-px bg-white/8" />
        testnet options
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Create */}
      <button
        onClick={handleCreate}
        disabled={isAnyConnecting}
        className="flex items-center gap-3 w-full rounded-xl border border-white/10 bg-white/5
                   px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10
                   transition-colors disabled:opacity-50"
      >
        {connecting === 'create'
          ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin flex-shrink-0" />
          : <Plus className="w-4 h-4 flex-shrink-0" />}
        {connecting === 'create' ? 'Creating…' : 'Create Testnet Wallet'}
      </button>

      {/* Import */}
      {!showImport ? (
        <button
          onClick={() => setShowImport(true)}
          disabled={isAnyConnecting}
          className="flex items-center gap-3 w-full rounded-xl border border-white/10 bg-white/5
                     px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10
                     transition-colors disabled:opacity-50"
        >
          <Key className="w-4 h-4 flex-shrink-0" />
          Import Secret Key
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              placeholder="S… (your Stellar secret key)"
              value={secretInput}
              onChange={e => setSecretInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleImport()}
              className="input-field pr-10 font-mono text-xs"
              autoFocus
            />
            <button
              onClick={() => setShowSecret(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              tabIndex={-1}
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-start gap-1.5 text-[10px] text-amber-400/80 bg-amber-900/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
            Demo only — never use a real mainnet key
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowImport(false); setSecretInput(''); }}
              className="flex-1 btn-secondary py-2 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!secretInput.trim() || isAnyConnecting}
              className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
            >
              {connecting === 'import' && <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
              {connecting === 'import' ? 'Importing…' : 'Import'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/78 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <Zap className="w-6 h-6" fill="currentColor" />
          StellarPay
          <span className="badge-warn text-[10px]">TESTNET</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-white/12 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/8'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {publicKey ? (
            /* ── Connected wallet chip ── */
            <div className="relative" ref={walletMenuRef}>
              <button
                onClick={() => { setWalletMenuOpen(o => !o); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5
                           px-3 py-2 text-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 glow-pulse" />
                <span className="text-slate-300 font-mono text-xs hidden sm:block">{shortAddress}</span>
                <span className={clsx('font-semibold text-xs sm:text-sm', isLoading ? 'text-slate-500' : 'text-white')}>
                  {displayBalance}
                </span>
                <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-400 transition-transform', walletMenuOpen && 'rotate-180')} />
              </button>

              {walletMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-xs text-slate-500">Connected wallet</p>
                    <p className="text-xs font-mono text-slate-300 truncate">{publicKey}</p>
                    <p className={clsx('text-xs mt-1', isLoading ? 'text-slate-600' : 'text-brand-400 font-semibold')}>
                      {isLoading ? 'Loading…' : `${parseFloat(balance).toFixed(4)} XLM`}
                    </p>
                  </div>
                  <Link href="/dashboard" onClick={() => setWalletMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-200 hover:bg-white/6 transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-brand-400" /> Dashboard
                  </Link>
                  <Link href="/receive" onClick={() => setWalletMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-200 hover:bg-white/6 transition-colors">
                    <QrCode className="w-4 h-4 text-emerald-400" /> Receive XLM
                  </Link>
                  <button
                    onClick={() => { disconnect(); setWalletMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors border-t border-white/10"
                  >
                    <X className="w-4 h-4" /> Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Connect panel trigger (desktop) ── */
            <div className="relative hidden sm:block" ref={connectPanelRef}>
              <button
                onClick={() => { setConnectOpen(o => !o); setMobileMenuOpen(false); }}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
              >
                <Wallet className="w-3.5 h-3.5" />
                Connect Wallet
                <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', connectOpen && 'rotate-180')} />
              </button>

              {connectOpen && (
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
                  <ConnectPanel />
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => { setMobileMenuOpen(o => !o); setWalletMenuOpen(false); setConnectOpen(false); }}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="bg-[#0a0a0a] border-t border-white/10 md:hidden">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  pathname === href ? 'bg-white/12 text-white' : 'text-slate-300 hover:bg-white/6 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}

            {publicKey ? (
              <button
                onClick={() => { disconnect(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors mt-1 border-t border-white/10 pt-3"
              >
                <X className="w-4 h-4" /> Disconnect Wallet
              </button>
            ) : (
              <div className="mt-2 border-t border-white/10 pt-2">
                <ConnectPanel />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
