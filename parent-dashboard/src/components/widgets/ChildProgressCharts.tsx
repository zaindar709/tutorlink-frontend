import { useState } from 'react';
import type { ChildWeeklyProgress } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';

interface ChildProgressChartsProps {
  data: ChildWeeklyProgress[];
}

const CHART_H = 160;
const CHART_W = 520;

/** Color shifts with score: red → amber → green → primary. */
function scoreColor(score: number): { from: string; to: string; text: string } {
  if (score >= 90) return { from: '#5B2FD6', to: '#8B6CF6', text: 'text-[#7548F5]' };
  if (score >= 80) return { from: '#059669', to: '#34D399', text: 'text-emerald-600' };
  if (score >= 70) return { from: '#D97706', to: '#FBBF24', text: 'text-amber-600' };
  return { from: '#DC2626', to: '#F87171', text: 'text-red-500' };
}

function buildLinePath(
  weeks: { score: number }[],
  width: number,
  height: number
): string {
  if (weeks.length === 0) return '';
  const padX = 24;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const max = 100;
  const min = 60;

  return weeks
    .map((point, i) => {
      const x = padX + (i / Math.max(weeks.length - 1, 1)) * innerW;
      const y =
        padY + innerH - ((point.score - min) / (max - min)) * innerH;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export default function ChildProgressCharts({ data }: ChildProgressChartsProps) {
  const [activeId, setActiveId] = useState(data[0]?.childId ?? '');

  const active = data.find(c => c.childId === activeId) ?? data[0];
  if (!active) return null;

  const maxScore = Math.max(...active.weeks.map(w => w.score), 100);

  return (
    <GlassCard className="p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-tl-text">Child Progress</h3>
          <p className="text-sm text-tl-text-muted">
            Weekly score trend — last 6 weeks
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.map(child => (
            <button
              key={child.childId}
              type="button"
              onClick={() => setActiveId(child.childId)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active.childId === child.childId
                  ? 'bg-gradient-to-r from-tl-primary-dark to-tl-primary-light text-white shadow'
                  : 'border border-tl-border bg-tl-surface text-tl-text-muted hover:text-tl-primary'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${
                  active.childId === child.childId
                    ? 'bg-white/20 text-white'
                    : 'bg-violet-50 text-tl-primary dark:bg-violet-950/40'
                }`}
              >
                {child.avatarInitials}
              </span>
              {child.childName.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-tl-text">{active.childName}</span>
        <span className="text-tl-text-muted">{active.subject}</span>
      </div>

      {/* Bar chart */}
      <div className="mb-6 flex items-end justify-center gap-4 sm:gap-6">
        {active.weeks.map(week => {
          const colors = scoreColor(week.score);
          return (
            <div key={week.label} className="flex flex-col items-center gap-2">
              <span className={`text-xs font-bold ${colors.text}`}>{week.score}%</span>
              <div
                className="w-5 overflow-hidden rounded-t-lg bg-tl-surface-muted sm:w-6"
                style={{ height: CHART_H }}
              >
                <div className="mt-auto flex h-full w-full flex-col justify-end">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${(week.score / maxScore) * 100}%`,
                      background: `linear-gradient(to top, ${colors.from}, ${colors.to})`,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-medium text-tl-text-muted">
                {week.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Line chart */}
      <div className="rounded-xl border border-tl-border bg-tl-surface-muted/40 p-4 dark:bg-tl-surface-muted/60">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-tl-text-muted">
          Progress trend
        </p>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {[70, 80, 90].map(level => {
            const y = 16 + (CHART_H - 32) * (1 - (level - 60) / 40);
            return (
              <g key={level}>
                <line
                  x1={24}
                  y1={y}
                  x2={CHART_W - 24}
                  y2={y}
                  stroke="currentColor"
                  className="text-tl-border"
                  strokeDasharray="4 4"
                />
                <text
                  x={8}
                  y={y + 4}
                  className="fill-tl-text-muted text-[10px]"
                >
                  {level}
                </text>
              </g>
            );
          })}
          <path
            d={buildLinePath(active.weeks, CHART_W, CHART_H)}
            fill="none"
            stroke="#7548F5"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {active.weeks.map((week, i) => {
            const padX = 24;
            const innerW = CHART_W - 48;
            const x = padX + (i / Math.max(active.weeks.length - 1, 1)) * innerW;
            const y = 16 + (CHART_H - 32) * (1 - (week.score - 60) / 40);
            const colors = scoreColor(week.score);
            return (
              <circle
                key={week.label}
                cx={x}
                cy={y}
                r={5}
                fill={colors.to}
                stroke="#fff"
                strokeWidth={2}
              />
            );
          })}
        </svg>
      </div>
    </GlassCard>
  );
}
