/**
 * TransactionBadge.tsx
 * Reusable badge showing transaction status.
 */

import clsx from 'clsx';
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

type TxStatus = 'confirmed' | 'pending' | 'failed' | 'loading';

interface Props {
  status: TxStatus;
  className?: string;
}

const CONFIG: Record<TxStatus, { icon: React.ElementType; label: string; classes: string }> = {
  confirmed: { icon: CheckCircle2, label: 'Confirmed',  classes: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50' },
  pending:   { icon: Clock,        label: 'Pending',    classes: 'bg-amber-900/40  text-amber-400  border-amber-800/50'   },
  failed:    { icon: XCircle,      label: 'Failed',     classes: 'bg-red-900/40    text-red-400    border-red-800/50'     },
  loading:   { icon: Loader2,      label: 'Processing…',classes: 'bg-brand-900/40  text-brand-400  border-brand-800/50'   },
};

export default function TransactionBadge({ status, className = '' }: Props) {
  const { icon: Icon, label, classes } = CONFIG[status];
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      classes,
      className
    )}>
      <Icon className={clsx('w-3 h-3', status === 'loading' && 'animate-spin')} />
      {label}
    </span>
  );
}
