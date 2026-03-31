/**
 * loading.tsx — Next.js loading skeleton
 * Shown automatically while dashboard data loads.
 */

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 w-32 bg-surface-muted rounded-lg" />
          <div className="h-4 w-48 bg-surface-muted rounded-lg mt-2" />
        </div>
        <div className="h-9 w-24 bg-surface-muted rounded-xl" />
      </div>

      {/* Balance card skeleton */}
      <div className="card h-44 bg-surface-card" />

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card h-32 bg-surface-card" />
        <div className="card h-32 bg-surface-card" />
      </div>

      {/* Transactions skeleton */}
      <div className="card">
        <div className="h-6 w-40 bg-surface-muted rounded-lg mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-surface-muted last:border-0">
            <div className="w-10 h-10 rounded-xl bg-surface-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-surface-muted rounded" />
              <div className="h-3 w-40 bg-surface-muted rounded" />
            </div>
            <div className="h-5 w-20 bg-surface-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
