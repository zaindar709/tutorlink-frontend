import { BookOpen, TrendingDown, TrendingUp } from 'lucide-react';
import type { ProgressSnapshot } from '../../types/parent.types';

interface ProgressPageProps {
  progress: ProgressSnapshot[];
}

const SUBJECT_THEME: Record<
  string,
  { accent: string; soft: string; bar: string }
> = {
  Mathematics: {
    accent: '#3B82F6',
    soft: 'rgba(59,130,246,0.18)',
    bar: 'rgba(59,130,246,0.35)',
  },
  Physics: {
    accent: '#8B5CF6',
    soft: 'rgba(139,92,246,0.18)',
    bar: 'rgba(139,92,246,0.35)',
  },
  English: {
    accent: '#14B8A6',
    soft: 'rgba(20,184,166,0.18)',
    bar: 'rgba(20,184,166,0.35)',
  },
  Science: {
    accent: '#F59E0B',
    soft: 'rgba(245,158,11,0.18)',
    bar: 'rgba(245,158,11,0.35)',
  },
};

const FALLBACK_THEME = {
  accent: '#7548F5',
  soft: 'rgba(117,72,245,0.18)',
  bar: 'rgba(117,72,245,0.35)',
};

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'C+';
  return 'C';
}

function defaultBars(score: number): number[] {
  const base = Math.max(25, score - 30);
  return [base, base + 8, base + 14, base + 20, score - 5].map(v =>
    Math.max(18, Math.min(95, v))
  );
}

export default function ProgressPage({ progress }: ProgressPageProps) {
  return (
    <div className="animate-slide-up space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-tl-text sm:text-2xl">
          Subject Progress
        </h2>
        <p className="mt-1 text-sm text-tl-text-muted">
          Syllabus coverage and weekly momentum for each subject
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {progress.map(item => {
          const theme = SUBJECT_THEME[item.subject] ?? FALLBACK_THEME;
          const grade = item.grade || scoreToGrade(item.score);
          const covered = item.syllabusCovered ?? item.score;
          const bars = item.weeklyBars?.length
            ? item.weeklyBars
            : defaultBars(item.score);
          const delta =
            item.trendDelta ??
            (item.trend === 'up' ? 5 : item.trend === 'down' ? -3 : 0);
          const isUp = delta >= 0;

          return (
            <article
              key={`${item.childId}-${item.subject}`}
              className="rounded-[22px] border border-tl-border bg-tl-surface p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)] dark:shadow-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-tl-text">
                    {item.subject}
                  </h3>
                  <p className="mt-0.5 text-sm text-tl-text-muted">
                    Grade: {grade}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-tl-text-muted/80">
                    {item.childName}
                  </p>
                </div>
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: theme.accent }}
                >
                  <BookOpen className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-tl-text-muted">
                    Syllabus Covered
                  </span>
                  <span className="text-sm font-extrabold text-tl-text">
                    {covered}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-tl-surface-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${covered}%`,
                      backgroundColor: theme.accent,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-3">
                <div className="flex h-10 items-end gap-1.5">
                  {bars.slice(0, 5).map((h, i) => (
                    <span
                      key={`${item.subject}-bar-${i}`}
                      className="w-2 rounded-full"
                      style={{
                        height: `${Math.max(8, Math.round((h / 100) * 40))}px`,
                        backgroundColor:
                          i === 4 ? theme.accent : theme.bar,
                      }}
                    />
                  ))}
                </div>

                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                    isUp
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {isUp ? '+' : ''}
                  {delta}%
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
