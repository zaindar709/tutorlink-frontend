import type { PaymentRecord } from '../../types/parent.types';
import { formatPkr } from '../../utils/format';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import StatCard from '../shared/StatCard';
import { CreditCard, Receipt, Wallet } from 'lucide-react';

interface PaymentsPageProps {
  payments: PaymentRecord[];
  monthlySpend: number;
}

const statusVariant = {
  completed: 'success' as const,
  pending: 'warning' as const,
  refunded: 'danger' as const,
};

export default function PaymentsPage({ payments, monthlySpend }: PaymentsPageProps) {
  const completedTotal = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="animate-slide-up space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="This Month" value={formatPkr(monthlySpend)} icon={Wallet} accent="#7548F5" />
        <StatCard title="Paid Sessions" value={formatPkr(completedTotal)} icon={CreditCard} accent="#4AA570" />
        <StatCard title="Transactions" value={String(payments.length)} icon={Receipt} accent="#2E78F6" />
      </section>

      <GlassCard className="overflow-hidden">
        <div className="border-b border-tl-border px-5 py-4">
          <h3 className="text-lg font-bold text-tl-text">Payment History</h3>
          <p className="text-sm text-tl-text-muted">All tutoring payments for linked children</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-tl-surface-muted text-xs uppercase tracking-wide text-tl-text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Child</th>
                <th className="px-5 py-3 font-semibold">Description</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="border-t border-tl-border">
                  <td className="px-5 py-4 font-medium text-tl-text">{payment.childName}</td>
                  <td className="px-5 py-4 text-tl-text-muted">{payment.description}</td>
                  <td className="px-5 py-4 text-tl-text-muted">{payment.date}</td>
                  <td className="px-5 py-4 font-bold text-tl-primary">{formatPkr(payment.amount)}</td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant[payment.status]}>{payment.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
