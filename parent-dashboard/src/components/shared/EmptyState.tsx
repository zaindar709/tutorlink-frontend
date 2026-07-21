import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

export default function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-tl-primary dark:bg-violet-950/30">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-tl-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-tl-text-muted">{message}</p>
    </div>
  );
}
