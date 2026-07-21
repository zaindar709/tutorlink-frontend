interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: 'bg-slate-100 text-slate-700 dark:bg-tl-surface-muted dark:text-tl-text-muted',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  info: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
};

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
