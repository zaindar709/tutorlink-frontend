import { ChevronRight, GraduationCap, HeartHandshake } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/nav';
import type { ParentNavId } from '../../types/parent.types';

interface SidebarProps {
  activeNav: ParentNavId;
  onNavigate: (id: ParentNavId) => void;
}

export default function Sidebar({ activeNav, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-tl-border bg-tl-surface/80 backdrop-blur-md lg:flex dark:bg-tl-surface/90">
      <div className="flex items-center gap-3 border-b border-tl-border px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-white shadow-md">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-tl-primary">
            TutorLink
          </p>
          <h1 className="text-lg font-extrabold text-tl-text">Parent</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Parent navigation">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-tl-primary-dark to-tl-primary-light text-white shadow-md'
                  : 'text-tl-text-muted hover:bg-tl-surface-muted hover:text-tl-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {active ? <ChevronRight className="ml-auto h-4 w-4 opacity-80" /> : null}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-tl-border p-4">
        <div className="rounded-xl bg-gradient-to-br from-violet-50 to-white p-3 dark:from-violet-950/30 dark:to-tl-surface-muted">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-tl-primary" />
            <p className="text-xs font-semibold text-tl-text">Family Learning</p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-tl-text-muted">
            Monitor sessions, progress, and payments for linked students.
          </p>
        </div>
      </div>
    </aside>
  );
}
