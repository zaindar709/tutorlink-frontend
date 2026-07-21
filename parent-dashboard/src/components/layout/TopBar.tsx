import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { PAGE_TITLES } from '../../constants/nav';
import type { ParentNavId } from '../../types/parent.types';

interface TopBarProps {
  activeNav: ParentNavId;
  pageTitle?: string;
  unreadCount?: number;
  profileName: string;
  profileInitials: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onNotifications: () => void;
  onLogout?: () => void;
}

export default function TopBar({
  activeNav,
  pageTitle,
  unreadCount = 0,
  profileName,
  profileInitials,
  isDark,
  onToggleTheme,
  onNotifications,
  onLogout,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-tl-border bg-tl-surface/80 px-4 py-4 backdrop-blur-md sm:px-6 dark:bg-tl-surface/90">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-tl-primary">
            Parent Dashboard
          </p>
          <h2 className="text-xl font-extrabold text-tl-text sm:text-2xl">
            {pageTitle ?? PAGE_TITLES[activeNav]}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-tl-border bg-tl-surface text-tl-text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:text-tl-primary dark:bg-tl-surface-muted"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-tl-border bg-tl-surface text-tl-text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:text-tl-primary dark:bg-tl-surface-muted"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tl-red px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>

          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-tl-border bg-tl-surface text-tl-text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:text-tl-red dark:bg-tl-surface-muted"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : null}

          <div className="hidden items-center gap-2 rounded-xl border border-tl-border bg-tl-surface px-3 py-2 sm:flex dark:bg-tl-surface-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-xs font-bold text-white">
              {profileInitials}
            </div>
            <div>
              <p className="text-xs font-semibold text-tl-text">{profileName}</p>
              <p className="text-[10px] text-tl-text-muted">Parent account</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
