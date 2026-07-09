import { useState } from 'react';
import { Link2, Search, Unlink, UserCheck, Clock } from 'lucide-react';
import type { ParentStudentLink } from '../../types/admin.types';
import { formatDate } from '../../utils/format';
import GlassCard from '../shared/GlassCard';
import StatCard from '../shared/StatCard';

interface ParentStudentLinksPageProps {
  links: ParentStudentLink[];
  actionLoading: string | null;
  onRevoke: (id: string) => void;
}

const statusStyles = {
  active: 'bg-green-50 text-tl-green border-green-200',
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  revoked: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function ParentStudentLinksPage({
  links,
  actionLoading,
  onRevoke,
}: ParentStudentLinksPageProps) {
  const [search, setSearch] = useState('');

  const filtered = links.filter(
    l =>
      l.parentName.toLowerCase().includes(search.toLowerCase()) ||
      l.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const active = links.filter(l => l.status === 'active').length;
  const pending = links.filter(l => l.status === 'pending').length;

  return (
    <>
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Active Links"
          value={String(active)}
          icon={Link2}
          accent="#7548F5"
        />
        <StatCard
          title="Pending Codes"
          value={String(pending)}
          icon={Clock}
          accent="#FFBA49"
          alert={pending > 0}
        />
        <StatCard
          title="Total Families"
          value={String(links.length)}
          icon={UserCheck}
          accent="#4AA570"
        />
      </section>

      <GlassCard>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-tl-navy">
              Parent-Student Connections
            </h2>
            <p className="text-sm text-slate-500">
              Monitor linked family accounts and redeem codes
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search families..."
              className="rounded-xl border border-slate-200 bg-white/80 py-2 pl-9 pr-4 text-sm outline-none focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Parent</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Linked</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(link => (
                <tr
                  key={link.id}
                  className="border-b border-slate-50 hover:bg-violet-50/20"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-tl-navy">{link.parentName}</p>
                    <p className="text-xs text-slate-500">{link.parentEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-tl-navy">{link.studentName}</p>
                    <p className="text-xs text-slate-500">{link.studentEmail}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {link.studentGrade}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[link.status]}`}
                    >
                      {link.status}
                    </span>
                    {link.linkCode && (
                      <p className="mt-1 font-mono text-xs text-tl-primary">
                        {link.linkCode}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {formatDate(link.linkedAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {link.status === 'active' && (
                      <button
                        type="button"
                        disabled={actionLoading === link.id}
                        onClick={() => onRevoke(link.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-tl-red transition-all hover:bg-red-100 disabled:opacity-50"
                      >
                        <Unlink className="h-3.5 w-3.5" />
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );
}
