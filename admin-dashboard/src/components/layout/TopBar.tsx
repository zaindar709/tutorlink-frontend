import { Bell } from 'lucide-react';
import { PAGE_TITLES } from '../../constants/nav';
import type { NavSectionId } from '../../types/admin.types';

interface TopBarProps {
  activeNav: NavSectionId;
  pendingCount?: number;
}

export default function TopBar({ activeNav, pendingCount = 0 }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-white/70 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-tl-primary">
            Dashboard
          </p>
          <h2 className="text-xl font-extrabold text-tl-navy sm:text-2xl">
            {PAGE_TITLES[activeNav]}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:text-tl-primary"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tl-red text-[9px] font-bold text-white">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-xs font-bold text-white">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-tl-navy">Admin</p>
              <p className="text-[10px] text-slate-500">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
