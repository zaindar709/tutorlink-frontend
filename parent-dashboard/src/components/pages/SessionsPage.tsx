import { useMemo, useState } from 'react';
import type { ParentSession } from '../../types/parent.types';
import { formatPkr } from '../../utils/format';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import EmptyState from '../shared/EmptyState';
import { CalendarDays } from 'lucide-react';

const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'] as const;

interface SessionsPageProps {
  sessions: ParentSession[];
}

const statusVariant = {
  upcoming: 'warning' as const,
  live: 'success' as const,
  completed: 'default' as const,
  cancelled: 'danger' as const,
};

export default function SessionsPage({ sessions }: SessionsPageProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>('All');

  const filtered = useMemo(() => {
    if (tab === 'All') return sessions;
    return sessions.filter(s => s.status === tab.toLowerCase());
  }, [sessions, tab]);

  return (
    <div className="animate-slide-up space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item
                ? 'bg-gradient-to-r from-tl-primary-dark to-tl-primary-light text-white shadow'
                : 'border border-tl-border bg-tl-surface text-tl-text-muted hover:text-tl-primary'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={CalendarDays}
            title="No sessions found"
            message="Sessions for your linked children will appear here."
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map(session => (
            <GlassCard key={session.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-tl-text">{session.subject}</h3>
                  <p className="text-sm text-tl-text-muted">{session.childName}</p>
                  <p className="mt-1 text-sm text-tl-text-muted">Tutor: {session.tutorName}</p>
                </div>
                <Badge variant={statusVariant[session.status]}>{session.status}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-tl-border pt-4 text-sm">
                <span className="text-tl-text-muted">{session.date} · {session.time}</span>
                <span className="font-bold text-tl-primary">{formatPkr(session.amount)}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
