import { Wallet } from 'lucide-react';
import type { EscrowDispute } from '../../types/admin.types';
import { formatDate, formatPkr } from '../../utils/format';
import GlassCard from '../shared/GlassCard';

interface DisputeFeedProps {
  disputes: EscrowDispute[];
  actionLoading?: string | null;
  onResolve?: (id: string) => void;
  compact?: boolean;
}

const statusStyles = {
  flagged: 'text-orange-600 bg-orange-50',
  refund_pending: 'text-tl-red bg-red-50',
  resolved: 'text-tl-green bg-green-50',
};

export default function DisputeFeed({
  disputes,
  actionLoading,
  onResolve,
  compact = false,
}: DisputeFeedProps) {
  const items = compact ? disputes.slice(0, 2) : disputes;

  return (
    <GlassCard className="p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-tl-navy">
            Escrow Dispute Manager
          </h3>
          <p className="text-sm text-slate-500">Parent flags & pending refunds</p>
        </div>
        <Wallet className="h-5 w-5 text-tl-primary" />
      </header>

      <ul className="space-y-3">
        {items.map(dispute => (
          <li
            key={dispute.id}
            className="rounded-xl border border-slate-100 bg-white/80 p-3 transition-all duration-300 hover:border-violet-100 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-tl-navy">
                  {dispute.parentName} → {dispute.studentName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Tutor: {dispute.tutorName}
                </p>
                <p className="mt-1 text-xs text-slate-600">{dispute.reason}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyles[dispute.status]}`}
              >
                {dispute.status.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {formatPkr(dispute.amount)} · {formatDate(dispute.createdAt)}
              </span>
              {dispute.status !== 'resolved' && onResolve && (
                <button
                  type="button"
                  disabled={actionLoading === dispute.id}
                  onClick={() => onResolve(dispute.id)}
                  className="rounded-lg bg-tl-green/10 px-2.5 py-1 text-xs font-semibold text-tl-green transition-all hover:bg-tl-green/20 disabled:opacity-50"
                >
                  Resolve
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
