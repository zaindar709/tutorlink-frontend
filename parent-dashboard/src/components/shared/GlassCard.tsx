import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-tl-border bg-tl-surface/80 shadow-sm backdrop-blur-md dark:bg-tl-surface/90 ${className}`}
    >
      {children}
    </div>
  );
}
