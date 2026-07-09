import { Shield, UserCheck, Clock, XCircle } from 'lucide-react';
import type { AdminDashboardData } from '../../types/admin.types';
import GlassCard from '../shared/GlassCard';
import StatCard from '../shared/StatCard';
import TutorVerificationTable from '../verification/TutorVerificationTable';

interface TutorVerificationPageProps {
  dashboard: AdminDashboardData;
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onScheduleInterview: (id: string) => void;
}

export default function TutorVerificationPage({
  dashboard,
  actionLoading,
  onApprove,
  onReject,
  onScheduleInterview,
}: TutorVerificationPageProps) {
  const pending = dashboard.pendingTutors.filter(t => t.status === 'pending').length;
  const interview = dashboard.pendingTutors.filter(
    t => t.status === 'interview_scheduled'
  ).length;

  return (
    <>
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Awaiting Review"
          value={String(pending)}
          icon={Clock}
          accent="#FFBA49"
          alert={pending > 0}
        />
        <StatCard
          title="Interview Scheduled"
          value={String(interview)}
          icon={Shield}
          accent="#2E78F6"
        />
        <StatCard
          title="Total Approved"
          value={String(dashboard.stats.approvedTutors ?? 0)}
          icon={UserCheck}
          accent="#4AA570"
        />
      </section>

      <TutorVerificationTable
        tutors={dashboard.pendingTutors}
        actionLoading={actionLoading}
        onApprove={onApprove}
        onReject={onReject}
        onScheduleInterview={onScheduleInterview}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassCard className="p-4" hover>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-tl-green">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-tl-navy">Direct Approve</p>
              <p className="mt-1 text-xs text-slate-500">
                Sets <code className="text-tl-primary">isVerified: true</code>.
                Tutor appears immediately in student search.
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4" hover>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-tl-blue">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-tl-navy">Schedule Interview</p>
              <p className="mt-1 text-xs text-slate-500">
                Keeps tutor hidden from students until you approve after the
                interview.
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4" hover>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-tl-red">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-tl-navy">Reject</p>
              <p className="mt-1 text-xs text-slate-500">
                Removes application from queue. Tutor cannot appear in student
                search.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
