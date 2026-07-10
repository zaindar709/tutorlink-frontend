import type { PendingTutor } from '../../types/admin.types';

const styles = {
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  interview_scheduled: 'bg-blue-50 text-tl-blue border-blue-200',
  approved: 'bg-green-50 text-tl-green border-green-200',
  rejected: 'bg-red-50 text-tl-red border-red-200',
} as const;

const labels = {
  pending: 'Pending Review',
  interview_scheduled: 'Interview Scheduled',
  approved: 'Approved',
  rejected: 'Rejected',
} as const;

export default function StatusBadge({
  status,
}: {
  status: PendingTutor['status'];
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
