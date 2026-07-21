import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';

interface AppearanceSettingsPageProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const options: { id: ThemeMode; label: string; description: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', description: 'Bright and clean interface', icon: Sun },
  { id: 'dark', label: 'Dark', description: 'Easy on the eyes at night', icon: Moon },
  { id: 'system', label: 'System', description: 'Match your device settings', icon: Monitor },
];

export default function AppearanceSettingsPage({
  theme,
  onThemeChange,
}: AppearanceSettingsPageProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <GlassCard className="p-6">
        <h4 className="font-bold text-tl-text">Theme</h4>
        <p className="mt-1 text-sm text-tl-text-muted">
          Choose how TutorLink Parent looks on your screen.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {options.map(option => {
            const Icon = option.icon;
            const active = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onThemeChange(option.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-tl-primary bg-violet-50 ring-2 ring-violet-200 dark:bg-violet-950/30 dark:ring-violet-900'
                    : 'border-tl-border hover:border-violet-300'
                }`}
              >
                <Icon className={`h-6 w-6 ${active ? 'text-tl-primary' : 'text-tl-text-muted'}`} />
                <p className="mt-3 font-bold text-tl-text">{option.label}</p>
                <p className="mt-1 text-xs text-tl-text-muted">{option.description}</p>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h4 className="font-bold text-tl-text">Display density</h4>
        <p className="mt-1 text-sm text-tl-text-muted">Comfortable spacing is enabled by default.</p>
        <div className="mt-4 flex gap-2">
          {['Comfortable', 'Compact'].map(label => (
            <button
              key={label}
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                label === 'Comfortable'
                  ? 'bg-gradient-to-r from-tl-primary-dark to-tl-primary-light text-white'
                  : 'border border-tl-border text-tl-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
