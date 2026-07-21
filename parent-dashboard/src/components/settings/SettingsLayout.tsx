import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { SETTINGS_VIEW_TITLES } from '../../constants/nav';
import type { SettingsViewId } from '../../types/parent.types';

interface SettingsLayoutProps {
  view: SettingsViewId;
  onBack: () => void;
  children: ReactNode;
}

export default function SettingsLayout({
  view,
  onBack,
  children,
}: SettingsLayoutProps) {
  if (view === 'hub') return <>{children}</>;

  return (
    <div className="animate-slide-up space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-tl-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </button>
      <div>
        <h3 className="text-2xl font-extrabold text-tl-text">
          {SETTINGS_VIEW_TITLES[view]}
        </h3>
      </div>
      {children}
    </div>
  );
}
