import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  pulse?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  pulse,
}: StatCardProps) {
  return (
    <div className="animate-slide-up rounded-2xl border border-tl-border bg-tl-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-tl-surface">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-tl-text-muted">
            {title}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-tl-text">{value}</p>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {pulse ? (
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-tl-green">
          <span className="h-2 w-2 rounded-full bg-tl-green animate-pulse-dot" />
          Live now
        </div>
      ) : null}
    </div>
  );
}
