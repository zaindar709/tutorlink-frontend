import { CalendarDays, TrendingUp, Users } from 'lucide-react';
import type { ParentDashboardData } from '../../types/parent.types';
import StatCard from '../shared/StatCard';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import ChildProgressCharts from '../widgets/ChildProgressCharts';
import AiRecommendationCard from '../widgets/AiRecommendationCard';

interface OverviewPageProps {
  data: ParentDashboardData;
  onNavigate: (section: 'sessions' | 'children' | 'progress') => void;
}

export default function OverviewPage({ data, onNavigate }: OverviewPageProps) {
  const stats = [
    {
      title: 'Linked Children',
      value: String(data.stats.linkedChildren),
      icon: Users,
      accent: '#7548F5',
    },
    {
      title: 'Upcoming Sessions',
      value: String(data.stats.upcomingSessions),
      icon: CalendarDays,
      accent: '#2E78F6',
      pulse: data.stats.upcomingSessions > 0,
    },
    {
      title: 'Overall Progress',
      value: `${data.stats.overallProgress}%`,
      icon: TrendingUp,
      accent: '#4AA570',
    },
    {
      title: 'Avg Attendance',
      value: `${data.stats.avgAttendance}%`,
      icon: TrendingUp,
      accent: '#FFBA49',
    },
  ];

  const upcoming = data.sessions.filter(s => s.status === 'upcoming').slice(0, 3);

  return (
    <div className="animate-slide-up space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <ChildProgressCharts data={data.weeklyProgress} />

      <AiRecommendationCard recommendation={data.aiRecommendation} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <GlassCard className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-tl-text">Upcoming Sessions</h3>
              <p className="text-sm text-tl-text-muted">Next tutoring sessions for your children</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sessions')}
              className="text-sm font-semibold text-tl-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {upcoming.map(session => (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-xl border border-tl-border bg-tl-surface-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-tl-surface-muted/60"
              >
                <div>
                  <p className="font-semibold text-tl-text">{session.subject}</p>
                  <p className="text-sm text-tl-text-muted">
                    {session.childName} · {session.tutorName}
                  </p>
                  <p className="mt-1 text-xs text-tl-text-muted">
                    {session.date} at {session.time}
                  </p>
                </div>
                <Badge variant="warning">Upcoming</Badge>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-tl-text">Children at a glance</h3>
            <button
              type="button"
              onClick={() => onNavigate('children')}
              className="text-sm font-semibold text-tl-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {data.children.map(child => (
              <button
                key={child.id}
                type="button"
                onClick={() => onNavigate('children')}
                className="flex w-full items-center gap-3 rounded-xl border border-tl-border p-3 text-left transition hover:border-violet-300 dark:hover:border-violet-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-xs font-bold text-white">
                  {child.avatarInitials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-tl-text">{child.name}</p>
                  <p className="text-xs text-tl-text-muted">
                    {child.grade} · {child.avgScore}% avg
                  </p>
                </div>
                <Badge variant="success">{child.attendanceRate}%</Badge>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
