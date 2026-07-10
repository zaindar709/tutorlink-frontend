import { Activity, TrendingUp } from 'lucide-react';
import type { AiHealthMetrics } from '../../types/admin.types';
import GlassCard from '../shared/GlassCard';

interface AiHealthWidgetProps {
  health: AiHealthMetrics;
  compact?: boolean;
}

export default function AiHealthWidget({
  health,
  compact = false,
}: AiHealthWidgetProps) {
  const bars = [72, 85, 68, 92, 78, 88, 94, 82, 90, 96, 88, 91];

  return (
    <GlassCard className="p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-tl-navy">
            AI System Health & Notes Tracker
          </h3>
          <p className="text-sm text-slate-500">
            Summary generation speed & token health
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-white">
          <TrendingUp className="h-5 w-5" />
        </div>
      </header>

      <div className={`mb-5 grid gap-3 ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">Summary Speed</p>
          <p className="mt-1 text-lg font-bold text-tl-primary">
            {health.summarySpeedMs}ms
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">Token Health</p>
          <p className="mt-1 text-lg font-bold text-tl-green">
            {health.tokenHealth}%
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">Uptime</p>
          <p className="mt-1 text-lg font-bold text-tl-blue">{health.uptime}%</p>
        </div>
        {!compact && (
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-500">Notes Today</p>
            <p className="mt-1 text-lg font-bold text-tl-navy">
              {health.notesGeneratedToday ?? 0}
            </p>
          </div>
        )}
      </div>

      <div className="flex h-28 items-end gap-1.5 rounded-xl bg-gradient-to-t from-violet-50/80 to-transparent px-2 pb-2 pt-4">
        {bars.map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-gradient-to-t from-tl-primary to-tl-primary-light opacity-80 transition-all duration-300 hover:opacity-100"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      {!compact && (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Activity className="h-3.5 w-3.5 text-tl-green" />
          Last sync: {new Date(health.lastSync).toLocaleString('en-PK')}
        </div>
      )}
    </GlassCard>
  );
}
