import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
}: GlassCardProps) {
  return (
    <section
      className={`rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-md ${
        hover
          ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md'
          : ''
      } ${className}`}
    >
      {children}
    </section>
  );
}
