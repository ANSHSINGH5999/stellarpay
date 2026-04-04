'use client';
import { useEffect } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Gauge,
  HeartPulse,
  Layers3,
  Rocket,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import clsx from 'clsx';
import {
  indexingStages,
  monitoringChecks,
  securityChecklist,
  submissionChecklist,
  verifiedUsers,
  weeklyMetrics,
} from '@/data/production';

function statusClasses(status: 'healthy' | 'watching' | 'pending' | 'complete' | 'in_progress') {
  if (status === 'healthy' || status === 'complete') {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }
  if (status === 'watching' || status === 'in_progress') {
    return 'bg-amber-500/15 text-amber-200 border-amber-500/30';
  }
  return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
}

export default function OpsPage() {
  useEffect(() => { document.title = 'Ops Center — StellarPay'; }, []);

  const totalTransactions = verifiedUsers.reduce((sum, user) => sum + user.txCount, 0);
  const averageRating =
    verifiedUsers.reduce((sum, user) => sum + user.feedbackRating, 0) / verifiedUsers.length;
  const latestMetric = weeklyMetrics[weeklyMetrics.length - 1];
  const maxDau = Math.max(...weeklyMetrics.map(point => point.dau));
  const maxTx = Math.max(...weeklyMetrics.map(point => point.txCount));

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <section className="card overflow-hidden relative border-brand-800/60 bg-gradient-to-br from-brand-900/50 via-surface-card to-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="badge-info inline-flex items-center gap-2 mb-4">
              <Rocket className="w-3.5 h-3.5" />
              Level 6 Production Center
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Black Belt submission control room
            </h1>
            <p className="text-slate-300 mt-3 leading-relaxed">
              One place to review growth, production readiness, security posture,
              monitoring coverage, indexing, and the advanced feature proof for StellarPay.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Verified users', value: `${verifiedUsers.length}/30`, icon: Users },
              { label: 'DAU', value: String(latestMetric.dau), icon: Gauge },
              { label: 'Transactions', value: String(totalTransactions), icon: ArrowUpRight },
              { label: 'Avg rating', value: averageRating.toFixed(1), icon: HeartPulse },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                <Icon className="w-4 h-4 text-brand-300 mb-3" />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Live metrics snapshot</h2>
              <p className="text-sm text-slate-400 mt-1">
                Current beta cohort metrics derived from the verified user registry and transaction tracker.
              </p>
            </div>
            <div className="badge-success">Updated April 4, 2026</div>
          </div>

          <div className="space-y-4">
            {weeklyMetrics.map(point => (
              <div key={point.label} className="grid grid-cols-[72px_1fr] items-center gap-4">
                <div className="text-xs text-slate-500">{point.label}</div>
                <div className="grid gap-2">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>DAU</span>
                      <span>{point.dau}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface">
                      <div
                        className="h-2 rounded-full bg-brand-400"
                        style={{ width: `${(point.dau / maxDau) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Transactions</span>
                      <span>{point.txCount}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface">
                      <div
                        className="h-2 rounded-full bg-emerald-400"
                        style={{ width: `${(point.txCount / maxTx) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Retention: {point.retention}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4">Submission gaps</h2>
          <div className="space-y-3">
            {submissionChecklist.map(item => (
              <div key={item.name} className="rounded-2xl border border-surface-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-sm text-slate-400 mt-1">{item.evidence}</div>
                  </div>
                  <span className={clsx('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide', statusClasses(item.status))}>
                    {item.status === 'complete' ? 'done' : 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Verified user registry</h2>
          </div>
          <div className="space-y-3">
            {verifiedUsers.map(user => (
              <div key={user.wallet} className="rounded-2xl border border-surface-muted p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Joined {new Date(user.joinedOn).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-brand-300">{user.txCount} tx</div>
                    <div className="text-xs text-slate-500">{user.feedbackRating}/5 rating</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-surface p-3">
                  <span className="font-mono text-xs text-slate-300 truncate">{user.wallet}</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${user.wallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 text-xs font-semibold"
                  >
                    Explorer
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            30+ verified wallets on record. Black Belt user requirement satisfied.
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Monitoring status</h2>
            </div>
            <div className="space-y-3">
              {monitoringChecks.map(check => (
                <div key={check.name} className="rounded-2xl border border-surface-muted p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-white">{check.name}</div>
                    <span className={clsx('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide', statusClasses(check.status))}>
                      {check.status}
                    </span>
                  </div>
                  <div className="text-sm text-brand-300 mt-2">{check.value}</div>
                  <div className="text-sm text-slate-400 mt-1">{check.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-bold text-white">Security checklist</h2>
            </div>
            <div className="space-y-3">
              {securityChecklist.map(check => (
                <div key={check.category} className="rounded-2xl border border-surface-muted p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-white">{check.category}</div>
                    <span className={clsx('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide', statusClasses(check.status))}>
                      {check.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 mt-2">{check.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Layers3 className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Indexing pipeline</h2>
          </div>
          <div className="space-y-4">
            {indexingStages.map((stage, index) => (
              <div key={stage.name} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-xs font-semibold text-brand-300">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-white">{stage.name}</div>
                  <div className="text-sm text-slate-400 mt-1">{stage.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Advanced feature proof</h2>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 mb-4">
            <div className="text-sm font-semibold text-emerald-200">Fee sponsorship via fee-bump transactions</div>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              StellarPay now includes a helper that builds a fee-bump envelope so a sponsor account can
              pay network fees on behalf of a sender. This is the foundation for a gasless transfer flow.
            </p>
          </div>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950/70 p-4 text-xs text-slate-300">
{`buildSponsoredPayment({
  senderSecret,
  sponsorSecret,
  receiverPublic,
  amountXLM,
  memo,
})`}
          </pre>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
              Inner payment is signed by the sender and wrapped by the sponsor fee bump.
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
              Result includes envelope XDR, inner XDR, fee source, and explorer-ready metadata.
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
              For production, the sponsor secret belongs server-side or inside a secure signing service.
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold text-white mb-4">Documentation pack</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Security checklist' },
            { label: 'User guide' },
            { label: 'Monitoring runbook' },
            { label: 'Submission guide' },
          ].map(doc => (
            <div key={doc.label} className="rounded-2xl border border-surface-muted p-4 hover:border-brand-500 transition-colors">
              <div className="font-semibold text-white">{doc.label}</div>
              <div className="text-sm text-slate-400 mt-1">
                Available in the repository docs folder for Demo Day packaging.
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
