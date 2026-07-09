import type { ElementType } from 'react';
import { ArrowDownLeft, ArrowUpRight, Lock, Wallet } from 'lucide-react';
import type {
  AdminDashboardData,
  EscrowTransaction,
} from '../../types/admin.types';
import { formatDate, formatPkr } from '../../utils/format';
import GlassCard from '../shared/GlassCard';
import StatCard from '../shared/StatCard';
import DisputeFeed from '../widgets/DisputeFeed';

interface EscrowManagementPageProps {
  dashboard: AdminDashboardData;
  actionLoading: string | null;
  onResolveDispute: (id: string) => void;
}

const typeStyles: Record<EscrowTransaction['type'], string> = {
  deposit: 'text-tl-green bg-green-50',
  release: 'text-tl-blue bg-blue-50',
  refund: 'text-tl-red bg-red-50',
  hold: 'text-orange-700 bg-orange-50',
};

const typeIcons: Record<EscrowTransaction['type'], ElementType> = {
  deposit: ArrowDownLeft,
  release: ArrowUpRight,
  refund: ArrowDownLeft,
  hold: Lock,
};

export default function EscrowManagementPage({
  dashboard,
  actionLoading,
  onResolveDispute,
}: EscrowManagementPageProps) {
  const transactions = dashboard.escrowTransactions ?? [];
  const pendingRefunds = dashboard.disputes.filter(
    d => d.status === 'refund_pending'
  ).length;

  return (
    <>
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Escrow Balance"
          value={formatPkr(dashboard.stats.escrowBalance)}
          icon={Wallet}
          accent="#4AA570"
        />
        <StatCard
          title="Open Disputes"
          value={String(
            dashboard.disputes.filter(d => d.status !== 'resolved').length
          )}
          icon={Lock}
          accent="#FFBA49"
          alert={dashboard.disputes.some(d => d.status !== 'resolved')}
        />
        <StatCard
          title="Pending Refunds"
          value={String(pendingRefunds)}
          icon={ArrowDownLeft}
          accent="#EE6464"
          alert={pendingRefunds > 0}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <GlassCard>
            <header className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-tl-navy">
                Escrow Transactions
              </h2>
              <p className="text-sm text-slate-500">
                Deposits, holds, releases & refunds
              </p>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Parties</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => {
                    const Icon = typeIcons[tx.type];
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-slate-50 hover:bg-violet-50/20"
                      >
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs font-semibold text-tl-navy">
                            {tx.transactionId}
                          </p>
                          <span
                            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              tx.status === 'completed'
                                ? 'bg-green-50 text-tl-green'
                                : tx.status === 'pending'
                                  ? 'bg-orange-50 text-orange-700'
                                  : 'bg-red-50 text-tl-red'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${typeStyles[tx.type]}`}
                          >
                            <Icon className="h-3 w-3" />
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600">
                          <p>{tx.studentName}</p>
                          <p className="text-slate-400">→ {tx.tutorName}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-tl-navy">
                          {formatPkr(tx.amount)}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <DisputeFeed
          disputes={dashboard.disputes}
          actionLoading={actionLoading}
          onResolve={onResolveDispute}
        />
      </div>
    </>
  );
}
