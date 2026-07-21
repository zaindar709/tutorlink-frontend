import { Globe, Clock, Coins } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import { useState } from 'react';

export default function LanguageSettingsPage() {
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('Asia/Karachi (PKT)');
  const [currency, setCurrency] = useState('PKR — Pakistani Rupee');

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
          {['English', 'Urdu'].map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                language === lang
                  ? 'bg-gradient-to-r from-tl-primary-dark to-tl-primary-light text-white'
                  : 'border border-tl-border text-tl-text-muted'
              }`}
            >
              {lang}
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
          onChange={e => setTimezone(e.target.value)}
          className="w-full rounded-xl border border-tl-border bg-tl-surface px-3 py-2.5 text-sm text-tl-text outline-none focus:border-tl-primary dark:bg-tl-surface-muted"
        >
          <option>Asia/Karachi (PKT)</option>
          <option>Asia/Dubai (GST)</option>
          <option>UTC</option>
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
          onChange={e => setCurrency(e.target.value)}
          className="w-full rounded-xl border border-tl-border bg-tl-surface px-3 py-2.5 text-sm text-tl-text outline-none focus:border-tl-primary dark:bg-tl-surface-muted"
        >
          <option>PKR — Pakistani Rupee</option>
          <option>USD — US Dollar</option>
        </select>
      </GlassCard>
    </div>
  );
}
