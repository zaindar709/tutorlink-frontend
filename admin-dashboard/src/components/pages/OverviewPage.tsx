import { BookOpen, Link2, Users, Video, Wallet } from 'lucide-react';
import type { AdminDashboardData } from '../../types/admin.types';
import { formatPkr } from '../../utils/format';
import StatCard from '../shared/StatCard';
import TutorVerificationTable from '../verification/TutorVerificationTable';
import AiHealthWidget from '../widgets/AiHealthWidget';
import DisputeFeed from '../widgets/DisputeFeed';

interface OverviewPageProps {
  dashboard: AdminDashboardData;
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onScheduleInterview: (id: string) => void;
}

export default function OverviewPage({
  dashboard,
  actionLoading,
  onApprove,
  onReject,
  onScheduleInterview,
}: OverviewPageProps) {
  const stats = [
    {
      title: 'Pending Tutors',
      value: String(dashboard.stats.pendingTutors),
      icon: Users,
      accent: '#FFBA49',
      alert: dashboard.stats.pendingTutors > 0,
    },
    {
      title: 'Active Escrow Balance',
      value: formatPkr(dashboard.stats.escrowBalance),
      icon: Wallet,
      accent: '#4AA570',
    },
    {
      title: 'Total Linked Parents',
      value: String(dashboard.stats.linkedParents),
      icon: Link2,
      accent: '#7548F5',
    },
    {
      title: "Today's Live Classrooms",
      value: String(dashboard.stats.liveClassrooms),
      icon: Video,
      accent: '#2E78F6',
      pulse: true,
    },
  ];

  return (
    <>
      <section
        className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Dashboard statistics"
      >
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TutorVerificationTable
            tutors={dashboard.pendingTutors}
            actionLoading={actionLoading}
            onApprove={onApprove}
            onReject={onReject}
            onScheduleInterview={onScheduleInterview}
            showReject={false}
          />
        </div>
        <div className="space-y-6">
          <AiHealthWidget health={dashboard.aiHealth} compact />
          <DisputeFeed
            disputes={dashboard.disputes}
            actionLoading={actionLoading}
            onResolve={() => {}}
            compact
          />
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/80 via-white/70 to-blue-50/80 p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <BookOpen className="h-5 w-5 text-tl-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-tl-navy">
                Student visibility rule
              </p>
              <p className="text-xs text-slate-500">
                Only tutors with{' '}
                <span className="font-semibold text-tl-green">isVerified: true</span>{' '}
                appear in student search results.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="rounded-full bg-tl-green/10 px-3 py-1 text-tl-green">
              Approve = Instant listing
            </span>
            <span className="rounded-full bg-tl-blue/10 px-3 py-1 text-tl-blue">
              Interview = Hold listing
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
