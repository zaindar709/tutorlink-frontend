import { Bell, Mail, Save, Shield } from 'lucide-react';
import { useState } from 'react';
import type { AdminSettings } from '../../types/admin.types';
import GlassCard from '../shared/GlassCard';
import { API_BASE_URL } from '../../api/admin.api';

interface SettingsPageProps {
  settings: AdminSettings;
  onUpdate: (settings: Partial<AdminSettings>) => void;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-tl-navy">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
          checked ? 'bg-tl-primary' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage({ settings, onUpdate }: SettingsPageProps) {
  const [local, setLocal] = useState(settings);

  const handleSave = () => {
    onUpdate(local);
  };

  const update = (patch: Partial<AdminSettings>) => {
    setLocal(prev => ({ ...prev, ...patch }));
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <GlassCard className="p-5">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-tl-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-tl-navy">
              Tutor Verification Policy
            </h2>
            <p className="text-sm text-slate-500">
              Controls how new tutors appear in the student app
            </p>
          </div>
        </header>

        <Toggle
          label="Require Interview Before Listing"
          description="When enabled, tutors stay hidden until manually approved after interview."
          checked={local.interviewRequired}
          onChange={v => update({ interviewRequired: v })}
        />
        <div className="border-t border-slate-100" />
        <Toggle
          label="Auto-Approve Tutors"
          description="Skip manual review — not recommended for production."
          checked={local.autoApproveTutors}
          onChange={v => update({ autoApproveTutors: v })}
        />

        <div className="mt-4 rounded-xl bg-violet-50 p-3 text-xs text-slate-600">
          <strong className="text-tl-primary">How it works:</strong> When a tutor
          signs up on mobile, their profile is created with{' '}
          <code>isVerified: false</code>. Admin must approve via dashboard to set{' '}
          <code>isVerified: true</code> — only then does{' '}
          <code>POST /api/tutors/search</code> return them to students.
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-tl-blue">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-tl-navy">Notifications</h2>
            <p className="text-sm text-slate-500">Admin alert preferences</p>
          </div>
        </header>

        <Toggle
          label="New Tutor Application"
          description="Notify when a tutor submits documents for review."
          checked={local.notifyOnNewTutor}
          onChange={v => update({ notifyOnNewTutor: v })}
        />
        <div className="border-t border-slate-100" />
        <Toggle
          label="Escrow Dispute"
          description="Notify when a parent flags a session or requests refund."
          checked={local.notifyOnDispute}
          onChange={v => update({ notifyOnDispute: v })}
        />
      </GlassCard>

      <GlassCard className="p-5">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-tl-green">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-tl-navy">Platform Info</h2>
            <p className="text-sm text-slate-500">General configuration</p>
          </div>
        </header>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Platform Name
            </label>
            <input
              type="text"
              value={local.platformName}
              onChange={e => update({ platformName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Support Email
            </label>
            <input
              type="email"
              value={local.supportEmail}
              onChange={e => update({ supportEmail: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Escrow Hold Period (days)
            </label>
            <input
              type="number"
              min={1}
              max={14}
              value={local.escrowHoldDays}
              onChange={e =>
                update({ escrowHoldDays: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <header className="mb-4">
          <h2 className="text-lg font-bold text-tl-navy">API Connection</h2>
          <p className="text-sm text-slate-500">
            Backend endpoint used by this dashboard
          </p>
        </header>
        <div className="rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-600">
          <p>
            <span className="text-slate-400">BASE_URL:</span> {API_BASE_URL}
          </p>
          <p className="mt-2">
            <span className="text-slate-400">AUTH:</span> Bearer {'{firebaseIdToken}'}
          </p>
          <p className="mt-2">
            <span className="text-slate-400">ROLE:</span> admin (required)
          </p>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          See <code className="text-tl-primary">docs/BACKEND_API.md</code> for
          full API specification.
        </p>

        <button
          type="button"
          onClick={handleSave}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </GlassCard>
    </div>
  );
}
