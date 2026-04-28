'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  AlertTriangle, ArrowUpRight, CheckCircle2, ExternalLink,
  Gauge, HeartPulse, Layers3, RefreshCw, Rocket,
  Search, ShieldCheck, Target, Users, Wifi, WifiOff, Zap, Code2,
} from 'lucide-react';
import {
  PAYMENT_CONTRACT_ID,
  ESCROW_CONTRACT_ID,
  getContractInfo,
  getPaymentContractCount,
  getEscrowContractCount,
  type ContractInfo,
} from '@/lib/soroban';
import { useWallet } from '@/lib/WalletContext';
import clsx from 'clsx';
import {
  indexingStages, monitoringChecks, securityChecklist,
  submissionChecklist, verifiedUsers, weeklyMetrics,
} from '@/data/production';
import { useLiveOpsMetrics } from '@/hooks/useLiveOpsMetrics';

// ── helpers ──────────────────────────────────────────────────────────────────
function statusRing(status: string) {
  if (status === 'healthy' || status === 'complete')  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/20';
  if (status === 'watching' || status === 'in_progress') return 'bg-amber-500/15 text-amber-200 border-amber-500/40 ring-1 ring-amber-500/20';
  return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
}

function RatingStars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={clsx('text-xs', i <= n ? 'text-amber-400' : 'text-slate-700')}>★</span>
      ))}
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────
export default function OpsPage() {
  useEffect(() => { document.title = 'Ops Center — StellarPay'; }, []);

  const live = useLiveOpsMetrics();
  const { publicKey } = useWallet();

  const [userSearch,    setUserSearch]    = useState('');
  const [showAllUsers,  setShowAllUsers]  = useState(false);

  const [paymentContractInfo, setPaymentContractInfo] = useState<ContractInfo | null>(null);
  const [escrowContractInfo,  setEscrowContractInfo]  = useState<ContractInfo | null>(null);
  const [paymentCount, setPaymentCount] = useState<number | null>(null);
  const [escrowCount,  setEscrowCount]  = useState<number | null>(null);

  useEffect(() => {
    getContractInfo(PAYMENT_CONTRACT_ID).then(setPaymentContractInfo);
    getContractInfo(ESCROW_CONTRACT_ID).then(setEscrowContractInfo);
  }, []);

  useEffect(() => {
    if (!publicKey) return;
    if (paymentContractInfo?.deployed) {
      getPaymentContractCount(publicKey).then(setPaymentCount);
    }
    if (escrowContractInfo?.deployed) {
      getEscrowContractCount(publicKey).then(setEscrowCount);
    }
  }, [publicKey, paymentContractInfo, escrowContractInfo]);

  // derived stats
  const totalTx     = verifiedUsers.reduce((s, u) => s + u.txCount, 0);
  const avgRating   = verifiedUsers.reduce((s, u) => s + u.feedbackRating, 0) / verifiedUsers.length;
  const latestDay   = weeklyMetrics[weeklyMetrics.length - 1];
  const maxDau      = Math.max(...weeklyMetrics.map(p => p.dau));
  const maxTx       = Math.max(...weeklyMetrics.map(p => p.txCount));

  // filtered user list
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return verifiedUsers.filter(u =>
      u.name.toLowerCase().includes(q) || u.wallet.toLowerCase().includes(q)
    );
  }, [userSearch]);
  const displayUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 5);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-800/50 bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#0f172a] p-8">
        {/* background glows */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-sky-500/8 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* left copy */}
          <div className="max-w-xl">
            <div className="badge-info inline-flex items-center gap-2 mb-4">
              <Rocket className="w-3.5 h-3.5" />
              Level 6 Production Center
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Black Belt Control Room
            </h1>
            <p className="text-slate-400 mt-3 leading-relaxed text-sm">
              One place to review growth, readiness, security, monitoring, indexing,
              and the advanced feature proof for StellarPay.
            </p>

            {/* live status bar */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
              <div className={clsx(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium',
                live.horizonOnline
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/40 bg-red-500/10 text-red-300'
              )}>
                {live.horizonOnline
                  ? <><Wifi className="w-3 h-3" /> Horizon online {live.horizonLatencyMs !== null && `· ${live.horizonLatencyMs} ms`}</>
                  : <><WifiOff className="w-3 h-3" /> Horizon offline</>}
              </div>

              {live.xlmPriceInr && (
                <div className="flex items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 text-brand-300 px-3 py-1.5 font-medium">
                  <Zap className="w-3 h-3" />
                  1 XLM = ₹{live.xlmPriceInr.toFixed(2)} live
                </div>
              )}

              <button
                onClick={live.refresh}
                disabled={live.isRefreshing}
                className="flex items-center gap-1.5 rounded-full border border-slate-600/50 bg-slate-700/30 text-slate-400 hover:text-slate-200 hover:border-slate-500 px-3 py-1.5 transition-colors"
              >
                <RefreshCw className={clsx('w-3 h-3', live.isRefreshing && 'animate-spin')} />
                {live.isRefreshing ? 'Refreshing…' : `Refresh · ${live.secondsToRefresh}s`}
              </button>

              {live.lastUpdated && (
                <span className="text-slate-600">
                  Updated {live.lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Verified users', value: `${verifiedUsers.length} real`, icon: Users,       color: 'text-brand-400',   bg: 'bg-brand-500/10',   ring: 'ring-brand-500/20' },
              { label: 'DAU today',      value: String(latestDay.dau),        icon: Gauge,        color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
              { label: 'Total txns',     value: String(totalTx),              icon: ArrowUpRight, color: 'text-sky-400',     bg: 'bg-sky-500/10',     ring: 'ring-sky-500/20' },
              { label: 'Avg rating',     value: avgRating.toFixed(1) + ' ★',  icon: HeartPulse,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   ring: 'ring-amber-500/20' },
            ].map(({ label, value, icon: Icon, color, bg, ring }) => (
              <div key={label} className={clsx('rounded-2xl border border-white/8 p-4 ring-1', bg, ring)}>
                <Icon className={clsx('w-4 h-4 mb-3', color)} />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-[11px] text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS + CHECKLIST ───────────────────────────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

        {/* metrics chart */}
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Growth metrics</h2>
              <p className="text-sm text-slate-500 mt-1">DAU, transactions, and retention — 8-day cohort</p>
            </div>
            <span className="badge-success text-[11px]">Live cohort data</span>
          </div>

          <div className="space-y-5">
            {weeklyMetrics.map((point, i) => {
              const isLatest = i === weeklyMetrics.length - 1;
              return (
                <div key={point.label} className={clsx(
                  'rounded-2xl p-4 transition-colors',
                  isLatest ? 'bg-brand-500/8 border border-brand-500/20' : 'bg-surface/60'
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={clsx('text-xs font-semibold', isLatest ? 'text-brand-300' : 'text-slate-500')}>
                      {point.label} {isLatest && '← today'}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Retention {point.retention}%
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {/* DAU bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>DAU</span><span className="font-mono font-semibold text-brand-400">{point.dau}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
                          style={{ width: `${(point.dau / maxDau) * 100}%` }}
                        />
                      </div>
                    </div>
                    {/* Tx bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Transactions</span><span className="font-mono font-semibold text-emerald-400">{point.txCount}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-700"
                          style={{ width: `${(point.txCount / maxTx) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* submission checklist */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-5">Submission checklist</h2>
          <div className="space-y-3">
            {submissionChecklist.map(item => (
              <div key={item.name} className={clsx(
                'rounded-2xl border p-4 transition-colors',
                item.status === 'complete'
                  ? 'border-emerald-500/25 bg-emerald-500/5'
                  : 'border-surface-muted'
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    {item.status === 'complete'
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{item.evidence}</div>
                    </div>
                  </div>
                  <span className={clsx(
                    'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex-shrink-0',
                    item.status === 'complete'
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                  )}>
                    {item.status === 'complete' ? '✓ done' : 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* completion bar */}
          {(() => {
            const done = submissionChecklist.filter(i => i.status === 'complete').length;
            const pct  = Math.round((done / submissionChecklist.length) * 100);
            return (
              <div className="mt-5 pt-4 border-t border-surface-muted">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Completion</span>
                  <span className="font-semibold text-emerald-400">{done}/{submissionChecklist.length}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[11px] text-emerald-400 mt-2 font-semibold text-right">{pct}% complete</div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── USER REGISTRY + MONITORING ────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-2">

        {/* user registry */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-bold text-white">Verified users</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-info">{verifiedUsers.length} total</span>
            </div>
          </div>

          {/* search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or wallet…"
              value={userSearch}
              onChange={e => { setUserSearch(e.target.value); setShowAllUsers(true); }}
              className="input-field pl-9 text-sm py-2"
            />
          </div>

          <div className="space-y-2">
            {displayUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No users match &quot;{userSearch}&quot;</div>
            ) : displayUsers.map((user, i) => (
              <div
                key={user.wallet}
                className="group rounded-2xl border border-surface-muted hover:border-brand-500/40 bg-surface/40 hover:bg-brand-500/5 p-4 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* avatar */}
                    <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300 flex-shrink-0">
                      {String(i + 1 + (showAllUsers ? 0 : 0)).padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm">{user.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Joined {new Date(user.joinedOn).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-sm font-bold text-brand-300">{user.txCount} tx</div>
                    <RatingStars n={user.feedbackRating} />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-900/60 px-3 py-2">
                  <span className="font-mono text-[11px] text-slate-400 truncate">{user.wallet}</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${user.wallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-[11px] font-semibold flex-shrink-0 transition-colors"
                  >
                    Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* show more / less */}
          {filteredUsers.length > 5 && (
            <button
              onClick={() => setShowAllUsers(s => !s)}
              className="mt-4 w-full text-sm text-brand-400 hover:text-brand-300 transition-colors py-2.5 rounded-xl border border-brand-500/20 hover:border-brand-500/40 bg-brand-500/5"
            >
              {showAllUsers
                ? `↑ Show fewer`
                : `↓ Show all ${filteredUsers.length} users`}
            </button>
          )}

          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-3 text-sm text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {verifiedUsers.length} form-verified wallets — name, rating, and wallet collected via Google Form
          </div>
        </div>

        {/* monitoring + security */}
        <div className="space-y-6">

          {/* monitoring */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Monitoring</h2>
              </div>
              {/* live horizon badge */}
              <div className={clsx(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                live.horizonOnline
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/40 bg-red-500/10 text-red-300'
              )}>
                <span className={clsx(
                  'w-1.5 h-1.5 rounded-full',
                  live.horizonOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                )} />
                {live.horizonOnline
                  ? `Horizon ${live.horizonLatencyMs ?? '…'} ms`
                  : 'Horizon offline'}
              </div>
            </div>

            <div className="space-y-3">
              {monitoringChecks.map(check => (
                <div key={check.name} className={clsx(
                  'rounded-2xl border p-4 transition-colors',
                  check.status === 'healthy' ? 'border-emerald-500/20 bg-emerald-500/5' :
                  check.status === 'watching' ? 'border-amber-500/20 bg-amber-500/5' :
                  'border-surface-muted'
                )}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="font-semibold text-white text-sm">{check.name}</div>
                    <span className={clsx('rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', statusRing(check.status))}>
                      {check.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-brand-300">{check.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{check.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* security */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-bold text-white">Security</h2>
            </div>
            <div className="space-y-2">
              {securityChecklist.map(check => (
                <div key={check.category} className={clsx(
                  'rounded-xl border p-3 transition-colors',
                  check.status === 'complete'    ? 'border-emerald-500/20 bg-emerald-500/5' :
                  check.status === 'in_progress' ? 'border-amber-500/20 bg-amber-500/5' :
                  'border-surface-muted'
                )}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {check.status === 'complete'
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                      <span className="text-sm font-medium text-white truncate">{check.category}</span>
                    </div>
                    <span className={clsx('rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide flex-shrink-0', statusRing(check.status))}>
                      {check.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1.5 pl-5">{check.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INDEXING + ADVANCED FEATURE ──────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-2">

        {/* indexing pipeline */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Layers3 className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Indexing pipeline</h2>
          </div>
          <div className="relative space-y-0">
            {indexingStages.map((stage, index) => (
              <div key={stage.name} className="flex items-start gap-4 pb-6 last:pb-0">
                {/* step + connector */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 border border-brand-400/40 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-brand-500/20">
                    {index + 1}
                  </div>
                  {index < indexingStages.length - 1 && (
                    <div className="w-0.5 flex-1 mt-1 bg-gradient-to-b from-brand-500/40 to-transparent" style={{ minHeight: 24 }} />
                  )}
                </div>
                <div className="pt-1">
                  <div className="font-semibold text-white">{stage.name}</div>
                  <div className="text-sm text-slate-400 mt-1 leading-relaxed">{stage.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* advanced feature */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Advanced feature</h2>
          </div>

          <div className="space-y-3 mb-4">
            <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-emerald-200 text-sm">Escrow — Stellar Claimable Balances (live)</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Time-locked escrow deployed directly on the Stellar testnet using native
                Claimable Balances. Receiver claims before expiry; sender refunds after.
                No custom contract deployment required.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-500/10 to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span className="font-semibold text-brand-200 text-sm">Fee sponsorship — fee-bump transactions</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                <code className="text-brand-300 text-xs">submitSponsoredPayment()</code> builds
                and submits a fee-bump envelope so a sponsor account covers network fees on
                behalf of the sender — the foundation for fully gasless transfers.
              </p>
            </div>
          </div>

          <pre className="overflow-x-auto rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-300 font-mono leading-relaxed mb-4">
{`// src/lib/stellar.ts

// Feature 1 — Claimable Balance escrow (live on testnet)
await createEscrow(senderSecret, receiverPublic, amountXLM, expiryDate)
// → locks XLM on-chain; receiver claims, sender refunds

// Feature 2 — Fee-bump sponsorship
await submitSponsoredPayment(senderSecret, sponsorSecret, receiverPublic, amountXLM)
// → submits fee-bump tx; sponsor pays fee, sender signs inner tx`}
          </pre>

          <div className="space-y-2.5 text-sm">
            {[
              { icon: CheckCircle2, color: 'text-emerald-400', text: 'Escrow enforced by Stellar network time predicates — no off-chain trust needed.' },
              { icon: CheckCircle2, color: 'text-emerald-400', text: 'Fee-bump inner tx signed by sender, outer fee-bump signed by sponsor.' },
              { icon: AlertTriangle, color: 'text-amber-400',  text: 'Sponsor secret must live server-side in production.' },
            ].map(({ icon: Icon, color, text }) => (
              <div key={text} className="flex items-start gap-2.5 text-slate-400">
                <Icon className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', color)} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCS ─────────────────────────────────────────────────────────────── */}
      <section className="card">
        <h2 className="text-xl font-bold text-white mb-4">Documentation</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Security checklist',  path: 'docs/security-checklist.md',  color: 'border-brand-500/30 hover:border-brand-500/60'   },
            { label: 'User guide',           path: 'docs/user-guide.md',          color: 'border-emerald-500/30 hover:border-emerald-500/60' },
            { label: 'Monitoring runbook',   path: 'docs/monitoring-runbook.md',  color: 'border-sky-500/30 hover:border-sky-500/60'         },
            { label: 'Submission guide',     path: 'docs/submission.md',          color: 'border-amber-500/30 hover:border-amber-500/60'     },
          ].map(doc => (
            <div key={doc.label} className={clsx(
              'rounded-2xl border p-4 transition-all bg-surface/40 cursor-default',
              doc.color
            )}>
              <div className="font-semibold text-white text-sm">{doc.label}</div>
              <div className="text-xs text-slate-500 mt-1 font-mono">{doc.path}</div>
              <div className="text-xs text-slate-600 mt-2">Available in repo · Demo Day ready</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SMART CONTRACTS ──────────────────────────────────────────────────── */}
      <section className="card">
        <div className="flex items-center gap-2 mb-5">
          <Code2 className="w-5 h-5 text-brand-400" />
          <h2 className="text-xl font-bold text-white">Smart Contracts</h2>
          <span className="badge-info text-[11px]">Soroban · Stellar Testnet</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              label: 'Payment Contract',
              desc: 'Routes XLM payments on-chain with 0.20% platform fee deduction and immutable payment records.',
              info: paymentContractInfo,
              count: paymentCount,
              countLabel: 'on-chain payments',
              codeRef: 'contracts/payment_contract/src/lib.rs',
            },
            {
              label: 'Escrow Contract',
              desc: 'Time-locked escrow with create → release/refund lifecycle for trustless conditional payments.',
              info: escrowContractInfo,
              count: escrowCount,
              countLabel: 'active escrows',
              codeRef: 'contracts/escrow_contract/src/lib.rs',
            },
          ].map(({ label, desc, info, count, countLabel, codeRef }) => (
            <div
              key={label}
              className={clsx(
                'rounded-2xl border p-5 transition-colors',
                info?.deployed
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-surface-muted bg-surface/40',
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="font-bold text-white">{label}</div>
                <span className={clsx(
                  'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex-shrink-0',
                  info == null
                    ? 'border-slate-700 bg-slate-800 text-slate-500'
                    : info.deployed
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-500/15 text-amber-300',
                )}>
                  {info == null ? 'checking…' : info.deployed ? '✓ deployed' : 'not deployed'}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3">{desc}</p>

              {info?.deployed && count !== null && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-2xl font-bold text-brand-300">{count}</div>
                  <div className="text-xs text-slate-500">{countLabel}</div>
                </div>
              )}

              <div className="text-[11px] font-mono text-slate-600 mb-3">{codeRef}</div>

              {info?.id && (
                <div className="rounded-xl bg-slate-900/60 px-3 py-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-slate-400 truncate">{info.id}</span>
                  {info.deployed && (
                    <a
                      href={info.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-[11px] font-semibold flex-shrink-0 transition-colors"
                    >
                      Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {!info?.id && (
                <div className="text-[11px] text-slate-600">
                  Set <code className="text-slate-500">NEXT_PUBLIC_{label.toUpperCase().replace(/ /g, '_')}_ID</code> to link a deployed contract.
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 text-sm text-slate-300">
          <div className="font-semibold text-white mb-1">Frontend integration</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Contract calls are wired in <code className="text-brand-300">src/lib/soroban.ts</code> using
            the Stellar SDK v12 Soroban RPC client. Payments route through <code className="text-brand-300">simulateContractPayment()</code>,
            and escrow creation through <code className="text-brand-300">simulateCreateEscrow()</code>.
            Deploy the contracts, set the env vars, and the integration is live.
          </p>
        </div>
      </section>

    </div>
  );
}
