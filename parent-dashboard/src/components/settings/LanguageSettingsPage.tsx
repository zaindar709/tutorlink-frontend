import { Globe, Clock, Coins } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import type { ParentSettings } from '../../types/parent.types';

interface LanguageSettingsPageProps {
  settings: ParentSettings;
  onSave: (patch: Partial<ParentSettings>) => void;
}

const TIMEZONES = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'UTC', label: 'UTC' },
];

export default function LanguageSettingsPage({
  settings,
  onSave,
}: LanguageSettingsPageProps) {
  const language = settings.language === 'ur' ? 'ur' : 'en';
  const timezone = settings.timezone || 'Asia/Karachi';
  const currency = settings.currency === 'USD' ? 'USD' : 'PKR';

  return (
    <div className="max-w-2xl space-y-4">
      <GlassCard className="p-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-tl-primary dark:bg-violet-950/30">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-tl-text">Language</h4>
            <p className="text-sm text-tl-text-muted">Display language for the dashboard</p>
          </div>
        </header>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'en', label: 'English' },
            { id: 'ur', label: 'Urdu' },
          ].map(lang => (
            <button
              key={lang.id}
              type="button"
              onClick={() => onSave({ language: lang.id })}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                language === lang.id
                  ? 'bg-gradient-to-r from-tl-primary-dark to-tl-primary-light text-white'
                  : 'border border-tl-border text-tl-text-muted'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-tl-blue dark:bg-blue-950/30">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-tl-text">Timezone</h4>
            <p className="text-sm text-tl-text-muted">Used for session reminders</p>
          </div>
        </header>
        <select
          value={timezone}
          onChange={e => onSave({ timezone: e.target.value })}
          className="w-full rounded-xl border border-tl-border bg-tl-surface px-3 py-2.5 text-sm text-tl-text outline-none focus:border-tl-primary dark:bg-tl-surface-muted"
        >
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </GlassCard>

      <GlassCard className="p-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-tl-green dark:bg-emerald-950/30">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-tl-text">Currency</h4>
            <p className="text-sm text-tl-text-muted">How amounts are displayed</p>
          </div>
        </header>
        <select
          value={currency}
          onChange={e => onSave({ currency: e.target.value })}
          className="w-full rounded-xl border border-tl-border bg-tl-surface px-3 py-2.5 text-sm text-tl-text outline-none focus:border-tl-primary dark:bg-tl-surface-muted"
        >
          <option value="PKR">PKR — Pakistani Rupee</option>
          <option value="USD">USD — US Dollar</option>
        </select>
      </GlassCard>
    </div>
  );
}
