import { useEffect } from 'react';
import { Star, ThumbsUp, UserCheck, UserX } from 'lucide-react';
import type { TutorRatingRow } from '../../types/admin.types';
import GlassCard from '../shared/GlassCard';
import StatCard from '../shared/StatCard';

interface TutorRatingsPageProps {
  rows: TutorRatingRow[];
  actionLoading: string | null;
  onKeep: (tutorId: string) => void;
  onRemove: (tutorId: string) => void;
  onRefresh?: () => void;
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < full ? 'fill-amber-400' : 'opacity-30'}`}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-tl-text">
        {value.toFixed(1)}
      </span>
    </span>
  );
}

function DecisionPill({
  decision,
}: {
  decision: TutorRatingRow['decision'];
}) {
  const map = {
    active: 'bg-green-50 text-tl-green border-green-200',
    flagged: 'bg-amber-50 text-amber-700 border-amber-200',
    removed: 'bg-red-50 text-tl-red border-red-200',
  } as const;
  const label =
    decision === 'removed'
      ? 'Removed'
      : decision === 'flagged'
        ? 'Flagged'
        : 'Active';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[decision]}`}
    >
      {label}
    </span>
  );
}

export default function TutorRatingsPage({
  rows,
  actionLoading,
  onKeep,
  onRemove,
  onRefresh,
}: TutorRatingsPageProps) {
  useEffect(() => {
    if (!onRefresh) return;
    const t = setInterval(() => onRefresh(), 5000);
    return () => clearInterval(t);
  }, [onRefresh]);

  const low = rows.filter(r => r.avgRating > 0 && r.avgRating < 3.5).length;
  const removed = rows.filter(r => r.decision === 'removed').length;
  const avgAll =
    rows.length === 0
      ? 0
      : rows.reduce((a, r) => a + r.avgRating, 0) / Math.max(rows.length, 1);

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-tl-text">Tutor Ratings</h2>
          <p className="mt-1 text-sm text-tl-text-muted">
            Live ratings from students after class (synced from the mobile app).
          </p>
        </div>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-xl border border-tl-border bg-white px-4 py-2 text-sm font-bold text-tl-primary shadow-sm hover:bg-tl-surface-muted"
          >
            Refresh ratings
          </button>
        ) : null}
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Rated tutors"
          value={String(rows.length)}
          icon={Star}
          accent="#7548F5"
        />
        <StatCard
          title="Platform avg"
          value={avgAll ? avgAll.toFixed(1) : '—'}
          icon={ThumbsUp}
          accent="#FFBA49"
        />
        <StatCard
          title="Low ratings"
          value={String(low)}
          icon={UserX}
          accent="#EE6464"
          alert={low > 0}
        />
        <StatCard
          title="Removed"
          value={String(removed)}
          icon={UserCheck}
          accent="#4AA570"
        />
      </section>

      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-tl-border px-5 py-4">
          <h3 className="text-lg font-extrabold text-tl-text">
            Student ratings by tutor
          </h3>
          <p className="mt-1 text-sm text-tl-text-muted">
            Review stars & likes from students after class. Keep the tutor
            active or remove them from the platform.
          </p>
        </div>

        <div className="divide-y divide-tl-border">
          {rows.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-tl-text-muted">
            No live student ratings yet. End a class in the student app, submit
            Rate Your Tutor, then tap Refresh here (admin must be running on
            port 5174).
            </p>
          ) : (
            rows.map(row => (
              <div
                key={row.tutorId}
                className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-start"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-sm font-bold text-white">
                    {row.tutorName
                      .split(/\s+/)
                      .slice(0, 2)
                      .map(p => p[0]?.toUpperCase() || '')
                      .join('') || 'T'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-tl-text">{row.tutorName}</p>
                      <DecisionPill decision={row.decision} />
                    </div>
                    <p className="truncate text-sm text-tl-text-muted">
                      {row.expertise} · {row.email}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <Stars value={row.avgRating} />
                      <span className="text-xs text-tl-text-muted">
                        {row.reviewCount} review
                        {row.reviewCount === 1 ? '' : 's'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-tl-primary">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {row.likeCount} likes
                      </span>
                    </div>

                    {row.recentReviews.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {row.recentReviews.slice(0, 2).map(rev => (
                          <div
                            key={rev.id}
                            className="rounded-xl border border-tl-border bg-tl-surface-muted/50 px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-tl-text">
                                {rev.studentName}
                                {rev.liked ? ' · 👍' : ''}
                              </p>
                              <Stars value={rev.rating} />
                            </div>
                            {rev.review ? (
                              <p className="mt-1 text-xs text-tl-text-muted">
                                “{rev.review}”
                              </p>
                            ) : null}
                            <p className="mt-1 text-[10px] text-tl-text-muted">
                              {rev.subject} ·{' '}
                              {new Date(rev.ratedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-row gap-2 lg:flex-col">
                  <button
                    type="button"
                    disabled={
                      actionLoading === row.tutorId || row.decision === 'active'
                    }
                    onClick={() => onKeep(row.tutorId)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tl-green to-emerald-500 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Keep tutor
                  </button>
                  <button
                    type="button"
                    disabled={
                      actionLoading === row.tutorId ||
                      row.decision === 'removed'
                    }
                    onClick={() => onRemove(row.tutorId)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-tl-red disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Remove tutor
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
