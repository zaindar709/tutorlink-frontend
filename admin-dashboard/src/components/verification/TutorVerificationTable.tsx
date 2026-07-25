import { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Search,
  XCircle,
} from 'lucide-react';
import type { PendingTutor } from '../../types/admin.types';
import { formatDate } from '../../utils/format';
import DocumentPill from '../shared/DocumentPill';
import StatusBadge from '../shared/StatusBadge';
import GlassCard from '../shared/GlassCard';

type VerificationTab = 'pending' | 'interview_scheduled' | 'approved';

interface TutorVerificationTableProps {
  tutors: PendingTutor[];
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onScheduleInterview: (id: string) => void;
  showReject?: boolean;
  defaultTab?: VerificationTab;
}

const TAB_LABELS: Record<VerificationTab, string> = {
  pending: 'Pending',
  interview_scheduled: 'Interview',
  approved: 'Approved',
};

export default function TutorVerificationTable({
  tutors,
  actionLoading,
  onApprove,
  onReject,
  onScheduleInterview,
  showReject = true,
  defaultTab = 'pending',
}: TutorVerificationTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<VerificationTab>(defaultTab);

  const tabCounts = {
    pending: tutors.filter(t => t.status === 'pending').length,
    interview_scheduled: tutors.filter(t => t.status === 'interview_scheduled')
      .length,
    approved: tutors.filter(t => t.status === 'approved').length,
  };

  const filtered = tutors.filter(tutor => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(search.toLowerCase()) ||
      tutor.email.toLowerCase().includes(search.toLowerCase()) ||
      tutor.expertise.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = tutor.status === filter;
    return matchesSearch && matchesFilter;
  });

  const isApprovedTab = filter === 'approved';

  return (
    <GlassCard>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-tl-navy">
            Tutor Verification Queue
          </h2>
          <p className="text-sm text-slate-500">
            {isApprovedTab
              ? 'Approved tutors visible to students in search'
              : 'Approve tutors to make them visible on the student app'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white/80 p-0.5">
            {(['pending', 'interview_scheduled', 'approved'] as const).map(
              key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    filter === key
                      ? 'bg-gradient-to-r from-tl-primary-dark to-tl-primary-light text-white'
                      : 'text-slate-500 hover:text-tl-primary'
                  }`}
                >
                  {TAB_LABELS[key]}
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                      filter === key ? 'bg-white/20' : 'bg-slate-100'
                    }`}
                  >
                    {tabCounts[key]}
                  </span>
                </button>
              )
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tutors..."
              className="rounded-xl border border-slate-200 bg-white/80 py-2 pl-9 pr-4 text-sm outline-none transition-all duration-300 focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Tutor</th>
              <th className="px-5 py-3">Expertise</th>
              <th className="px-5 py-3">Documents</th>
              <th className="px-5 py-3">Status</th>
              {!isApprovedTab ? (
                <th className="px-5 py-3 text-right">Actions</th>
              ) : (
                <th className="px-5 py-3 text-right">Approved</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-tl-green" />
                  {filter === 'approved'
                    ? 'No approved tutors yet.'
                    : filter === 'interview_scheduled'
                      ? 'No interviews scheduled.'
                      : 'No pending tutor requests.'}
                </td>
              </tr>
            ) : (
              filtered.map(tutor => (
                <tr
                  key={tutor.id}
                  className="border-b border-slate-50 transition-colors duration-200 hover:bg-violet-50/30"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-tl-navy">{tutor.name}</p>
                    <p className="text-xs text-slate-500">{tutor.email}</p>
                    {tutor.phone && (
                      <p className="text-xs text-slate-400">{tutor.phone}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      Submitted {formatDate(tutor.submittedAt)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-tl-navy">{tutor.expertise}</p>
                    <p className="text-xs text-slate-500">
                      {tutor.grades.join(' · ')}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {tutor.documents.map(doc => (
                        <DocumentPill
                          key={doc.id}
                          label={doc.label}
                          url={doc.url}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={tutor.status} />
                    {tutor.interviewDate && tutor.status === 'interview_scheduled' && (
                      <p className="mt-1 text-xs text-tl-blue">
                        {formatDate(tutor.interviewDate)}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {isApprovedTab ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-semibold text-tl-green">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Live in search
                        </span>
                        {tutor.approvedAt && (
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(tutor.approvedAt)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => onApprove(tutor.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-tl-green to-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                        >
                          {actionLoading === tutor.id ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={
                            !!actionLoading ||
                            tutor.status === 'interview_scheduled'
                          }
                          onClick={() => onScheduleInterview(tutor.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-tl-blue/30 bg-white px-3.5 py-2 text-xs font-semibold text-tl-blue transition-all duration-300 hover:-translate-y-0.5 hover:border-tl-blue hover:bg-blue-50 disabled:opacity-50"
                        >
                          <CalendarClock className="h-3.5 w-3.5" />
                          Schedule Interview
                        </button>
                        {showReject && (
                          <button
                            type="button"
                            disabled={!!actionLoading}
                            onClick={() =>
                              onReject(tutor.id, 'Documents incomplete or invalid')
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-tl-red transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-100 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
