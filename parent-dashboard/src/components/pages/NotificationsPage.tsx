import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CreditCard,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import type { ParentNotification } from '../../types/parent.types';
import { formatRelativeTime } from '../../utils/format';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import EmptyState from '../shared/EmptyState';

const filters = ['All', 'Unread', 'Sessions', 'Payments', 'Progress'] as const;

interface NotificationsPageProps {
  notifications: ParentNotification[];
}

const typeIcon = {
  session: GraduationCap,
  payment: CreditCard,
  progress: TrendingUp,
  system: Bell,
  alert: AlertCircle,
};

const typeColor = {
  session: '#2E78F6',
  payment: '#4AA570',
  progress: '#7548F5',
  system: '#64748B',
  alert: '#EE6464',
};

export default function NotificationsPage({
  notifications,
}: NotificationsPageProps) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return notifications;
    if (filter === 'Unread') return notifications.filter(n => !n.read);
    if (filter === 'Sessions') return notifications.filter(n => n.type === 'session');
    if (filter === 'Payments') return notifications.filter(n => n.type === 'payment');
    return notifications.filter(n => n.type === 'progress');
  }, [notifications, filter]);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="animate-slide-up space-y-4">
      <GlassCard className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-tl-text">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up'}
          </h3>
          <p className="text-sm text-tl-text-muted">
            Alerts for this student. Notifications are read-only on the parent portal.
          </p>
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2">
        {filters.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === item
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
            icon={Bell}
            title="No notifications"
            message="You're all caught up. New alerts will appear here."
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const Icon = typeIcon[item.type];
            const color = typeColor[item.type];
            return (
              <GlassCard
                key={item.id}
                className={`p-4 transition ${!item.read ? 'ring-2 ring-violet-200 dark:ring-violet-900' : ''}`}
              >
                <div className="flex gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-tl-text">{item.title}</p>
                        <p className="mt-1 text-sm text-tl-text-muted">{item.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!item.read ? <Badge variant="info">New</Badge> : null}
                        <Badge variant="default">{item.type}</Badge>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-xs text-tl-text-muted">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
