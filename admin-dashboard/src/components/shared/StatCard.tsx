import type { ElementType } from 'react';
import { AlertTriangle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ElementType;
  accent: string;
  pulse?: boolean;
  alert?: boolean;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  pulse,
  alert,
  subtitle,
}: StatCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-transform duration-300 group-hover:scale-110"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-tl-navy">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(pulse || alert) && (
        <div className="mt-3 flex items-center gap-2">
          {pulse && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tl-green opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 animate-pulse-dot rounded-full bg-tl-green" />
            </span>
          )}
          {alert && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
              <AlertTriangle className="h-3 w-3" />
              Needs attention
            </span>
          )}
          {pulse && (
            <span className="text-xs font-medium text-tl-green">Live now</span>
          )}
        </div>
      )}
    </article>
  );
}
