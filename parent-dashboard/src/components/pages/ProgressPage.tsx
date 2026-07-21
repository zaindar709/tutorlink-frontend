import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { ProgressSnapshot } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';

interface ProgressPageProps {
  progress: ProgressSnapshot[];
}

const trendIcon = {
  up: ArrowUp,
  down: ArrowDown,
  stable: Minus,
};

const trendColor = {
  up: 'text-emerald-600',
  down: 'text-red-500',
  stable: 'text-slate-400',
};

export default function ProgressPage({ progress }: ProgressPageProps) {
  return (
    <div className="animate-slide-up grid grid-cols-1 gap-4 lg:grid-cols-2">
      {progress.map(item => {
        const Icon = trendIcon[item.trend];
        return (
          <GlassCard key={`${item.childId}-${item.subject}`} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-tl-text-muted">
                  {item.childName}
                </p>
                <h3 className="mt-1 text-xl font-bold text-tl-text">{item.subject}</h3>
              </div>
              <div className={`flex items-center gap-1 rounded-lg bg-tl-surface-muted px-2 py-1 ${trendColor[item.trend]}`}>
                <Icon className="h-4 w-4" />
                <span className="text-xs font-bold capitalize">{item.trend}</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-end justify-between">
                <span
                  className="text-3xl font-extrabold"
                  style={{
                    color:
                      item.score >= 90
                        ? '#7548F5'
                        : item.score >= 80
                          ? '#059669'
                          : item.score >= 70
                            ? '#D97706'
                            : '#DC2626',
                  }}
                >
                  {item.score}%
                </span>
                <span className="text-xs text-tl-text-muted">{item.sessionsCompleted} sessions</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-tl-surface-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.score}%`,
                    background:
                      item.score >= 90
                        ? 'linear-gradient(to right, #5B2FD6, #8B6CF6)'
                        : item.score >= 80
                          ? 'linear-gradient(to right, #059669, #34D399)'
                          : item.score >= 70
                            ? 'linear-gradient(to right, #D97706, #FBBF24)'
                            : 'linear-gradient(to right, #DC2626, #F87171)',
                  }}
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-tl-text-muted">Updated {item.lastUpdated}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
