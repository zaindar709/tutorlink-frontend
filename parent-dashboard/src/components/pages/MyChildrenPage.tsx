import { BookOpen, Calendar, TrendingUp } from 'lucide-react';
import type { LinkedChild } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import AddChildCodeCard from '../shared/AddChildCodeCard';

interface MyChildrenPageProps {
  children: LinkedChild[];
  selectedId?: string;
  onSelectChild?: (studentId: string) => void;
  onLink?: (
    code: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export default function MyChildrenPage({
  children,
  selectedId,
  onSelectChild,
  onLink,
}: MyChildrenPageProps) {
  return (
    <div className="animate-slide-up space-y-6">
      {onLink ? <AddChildCodeCard onLink={onLink} /> : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {children.map(child => {
          const selected = child.id === selectedId;
          return (
            <GlassCard
              key={child.id}
              className={`overflow-hidden ${
                selected ? 'ring-2 ring-tl-primary' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectChild?.(child.id)}
                className="w-full bg-gradient-to-r from-tl-primary-dark to-tl-primary-light p-5 text-left text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold">
                    {child.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{child.name}</h3>
                    <p className="text-sm text-white/85">
                      {child.grade} · {child.board}
                    </p>
                    {selected ? (
                      <p className="mt-1 text-xs font-semibold text-white/90">
                        Viewing this child’s dashboard
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-white/75">
                        Tap to view this child’s progress
                      </p>
                    )}
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-3 gap-3 p-5">
                <div className="rounded-xl bg-tl-surface-muted p-3 text-center dark:bg-tl-surface-muted/80">
                  <TrendingUp className="mx-auto h-4 w-4 text-tl-primary" />
                  <p className="mt-2 text-lg font-bold text-tl-text">
                    {child.avgScore}%
                  </p>
                  <p className="text-[10px] text-tl-text-muted">Avg Score</p>
                </div>
                <div className="rounded-xl bg-tl-surface-muted p-3 text-center dark:bg-tl-surface-muted/80">
                  <Calendar className="mx-auto h-4 w-4 text-tl-blue" />
                  <p className="mt-2 text-lg font-bold text-tl-text">
                    {child.sessionsThisMonth}
                  </p>
                  <p className="text-[10px] text-tl-text-muted">Sessions</p>
                </div>
                <div className="rounded-xl bg-tl-surface-muted p-3 text-center dark:bg-tl-surface-muted/80">
                  <BookOpen className="mx-auto h-4 w-4 text-tl-green" />
                  <p className="mt-2 text-lg font-bold text-tl-text">
                    {child.attendanceRate}%
                  </p>
                  <p className="text-[10px] text-tl-text-muted">Attendance</p>
                </div>
              </div>

              <div className="border-t border-tl-border px-5 pb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tl-text-muted">
                  Subjects
                </p>
                <div className="flex flex-wrap gap-2">
                  {child.subjects.map(subject => (
                    <Badge key={subject} variant="info">
                      {subject}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 text-xs text-tl-text-muted">
                  Linked since {child.linkedAt}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
