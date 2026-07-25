import { useMemo, useState } from 'react';
import type { ChildWeeklyProgress } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';

interface ChildProgressChartsProps {
  data: ChildWeeklyProgress[];
}

const VIEW_W = 640;
const VIEW_H = 220;
const PAD = { top: 28, right: 20, bottom: 36, left: 40 };

function pointCoords(
  weeks: { score: number }[],
  index: number
): { x: number; y: number } {
  const innerW = VIEW_W - PAD.left - PAD.right;
  const innerH = VIEW_H - PAD.top - PAD.bottom;
  const min = 55;
  const max = 100;
  const x =
    PAD.left + (index / Math.max(weeks.length - 1, 1)) * innerW;
  const y =
    PAD.top +
    innerH -
    ((weeks[index].score - min) / (max - min)) * innerH;
  return { x, y };
}

function buildSmoothPath(weeks: { score: number }[]): string {
  if (weeks.length === 0) return '';
  const pts = weeks.map((_, i) => pointCoords(weeks, i));
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function buildAreaPath(weeks: { score: number }[]): string {
  const line = buildSmoothPath(weeks);
  if (!line || weeks.length === 0) return '';
  const first = pointCoords(weeks, 0);
  const last = pointCoords(weeks, weeks.length - 1);
  const baseY = VIEW_H - PAD.bottom;
  return `${line} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
}

export default function ChildProgressCharts({ data }: ChildProgressChartsProps) {
  const [activeId, setActiveId] = useState(data[0]?.childId ?? '');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const active = data.find(c => c.childId === activeId) ?? data[0];
  if (!active) return null;

  const latest = active.weeks[active.weeks.length - 1];
  const previous = active.weeks[active.weeks.length - 2];
  const delta = previous ? latest.score - previous.score : 0;

  const linePath = useMemo(
    () => buildSmoothPath(active.weeks),
    [active.weeks]
  );
  const areaPath = useMemo(
    () => buildAreaPath(active.weeks),
    [active.weeks]
  );

  const ringR = 54;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC * (1 - latest.score / 100);

  const hoverPoint =
    hoverIdx != null ? pointCoords(active.weeks, hoverIdx) : null;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="relative isolate">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 10% 0%, rgba(117,72,245,0.14), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 100%, rgba(46,120,246,0.12), transparent 50%)',
          }}
        />

        <div className="relative p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-tl-primary">
                Learning pulse
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-tl-text sm:text-2xl">
                Weekly progress wave
              </h3>
              <p className="mt-1 text-sm text-tl-text-muted">
                Soft trend curve for the last 6 weeks — hover a point for details
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {data.map(child => {
                const selected = active.childId === child.childId;
                return (
                  <button
                    key={child.childId}
                    type="button"
                    onClick={() => {
                      setActiveId(child.childId);
                      setHoverIdx(null);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                      selected
                        ? 'bg-tl-navy text-white shadow-md dark:bg-white dark:text-slate-900'
                        : 'border border-tl-border bg-tl-surface/80 text-tl-text-muted hover:border-tl-primary/40 hover:text-tl-primary'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                        selected
                          ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900'
                          : 'bg-tl-surface-muted text-tl-primary'
                      }`}
                    >
                      {child.avatarInitials}
                    </span>
                    {child.childName.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
            {/* Score gauge */}
            <div className="flex flex-col items-center justify-center rounded-3xl border border-tl-border/80 bg-tl-surface/70 p-5 shadow-sm backdrop-blur-sm dark:bg-tl-surface/50">
              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r={ringR}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-tl-surface-muted"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r={ringR}
                    fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ringC}
                    strokeDashoffset={ringOffset}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2E78F6" />
                      <stop offset="55%" stopColor="#7548F5" />
                      <stop offset="100%" stopColor="#4AA570" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <p className="text-3xl font-black tracking-tight text-tl-text">
                    {latest.score}
                    <span className="text-lg font-bold text-tl-text-muted">%</span>
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-tl-text-muted">
                    Latest
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-tl-text">{active.childName}</p>
              <p className="text-xs text-tl-text-muted">{active.subject}</p>
              <div
                className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                  delta > 0
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                    : delta < 0
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                      : 'bg-tl-surface-muted text-tl-text-muted'
                }`}
              >
                {delta > 0 ? '+' : ''}
                {delta} pts vs last week
              </div>
            </div>

            {/* Area wave chart */}
            <div className="rounded-3xl border border-tl-border/80 bg-tl-surface/60 p-3 sm:p-4 dark:bg-tl-surface/40">
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="h-auto w-full"
                preserveAspectRatio="xMidYMid meet"
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7548F5" stopOpacity="0.35" />
                    <stop offset="55%" stopColor="#2E78F6" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#2E78F6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="waveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2E78F6" />
                    <stop offset="50%" stopColor="#7548F5" />
                    <stop offset="100%" stopColor="#4AA570" />
                  </linearGradient>
                  <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {[70, 80, 90].map(level => {
                  const y =
                    PAD.top +
                    (VIEW_H - PAD.top - PAD.bottom) * (1 - (level - 55) / 45);
                  return (
                    <g key={level}>
                      <line
                        x1={PAD.left}
                        y1={y}
                        x2={VIEW_W - PAD.right}
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray="3 8"
                        className="text-tl-border"
                      />
                      <text
                        x={PAD.left - 10}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-tl-text-muted"
                        style={{ fontSize: 10, fontWeight: 600 }}
                      >
                        {level}
                      </text>
                    </g>
                  );
                })}

                <path d={areaPath} fill="url(#waveFill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#waveStroke)"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#softGlow)"
                />

                {active.weeks.map((week, i) => {
                  const { x, y } = pointCoords(active.weeks, i);
                  const activeDot = hoverIdx === i || i === active.weeks.length - 1;
                  return (
                    <g
                      key={week.label}
                      onMouseEnter={() => setHoverIdx(i)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx={x} cy={y} r={14} fill="transparent" />
                      <circle
                        cx={x}
                        cy={y}
                        r={activeDot ? 6.5 : 4.5}
                        fill={activeDot ? '#7548F5' : '#fff'}
                        stroke="#7548F5"
                        strokeWidth={2.5}
                        className="transition-all"
                      />
                      <text
                        x={x}
                        y={VIEW_H - 12}
                        textAnchor="middle"
                        className="fill-tl-text-muted"
                        style={{ fontSize: 11, fontWeight: 600 }}
                      >
                        {week.label.replace(/ .*/, '')}
                      </text>
                    </g>
                  );
                })}

                {hoverIdx != null && hoverPoint ? (
                  <g>
                    <line
                      x1={hoverPoint.x}
                      y1={PAD.top}
                      x2={hoverPoint.x}
                      y2={VIEW_H - PAD.bottom}
                      stroke="#7548F5"
                      strokeOpacity={0.25}
                      strokeDasharray="4 4"
                    />
                    <rect
                      x={Math.min(hoverPoint.x - 42, VIEW_W - 100)}
                      y={hoverPoint.y - 42}
                      width={84}
                      height={32}
                      rx={10}
                      fill="#0F172A"
                    />
                    <text
                      x={Math.min(hoverPoint.x - 42, VIEW_W - 100) + 42}
                      y={hoverPoint.y - 22}
                      textAnchor="middle"
                      fill="#fff"
                      style={{ fontSize: 12, fontWeight: 700 }}
                    >
                      {active.weeks[hoverIdx].score}% · {active.weeks[hoverIdx].label}
                    </text>
                  </g>
                ) : null}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
