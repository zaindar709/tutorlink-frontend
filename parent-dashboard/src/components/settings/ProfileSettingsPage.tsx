import { useState } from 'react';
import { Save, User } from 'lucide-react';
import type { ParentProfile } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';

interface ProfileSettingsPageProps {
  profile: ParentProfile;
  onSave: (patch: Partial<ParentProfile>) => void;
}

export default function ProfileSettingsPage({
  profile,
  onSave,
}: ProfileSettingsPageProps) {
  const [local, setLocal] = useState(profile);

  return (
    <GlassCard className="max-w-2xl p-6">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-tl-primary dark:bg-violet-950/30">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-tl-text">Personal Information</h4>
          <p className="text-sm text-tl-text-muted">Update your parent profile details</p>
        </div>
      </header>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-lg font-bold text-white">
          {local.avatarInitials}
        </div>
        <button
          type="button"
          className="rounded-xl border border-tl-border px-4 py-2 text-sm font-semibold text-tl-primary"
        >
          Change photo
        </button>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Full Name', key: 'name' as const },
          { label: 'Email', key: 'email' as const },
          { label: 'Phone', key: 'phone' as const },
        ].map(field => (
          <div key={field.key}>
            <label className="text-xs font-semibold text-tl-text-muted">{field.label}</label>
            <input
              type="text"
              value={local[field.key]}
              onChange={e => setLocal(prev => ({ ...prev, [field.key]: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-tl-border bg-tl-surface px-3 py-2.5 text-sm text-tl-text outline-none focus:border-tl-primary focus:ring-2 focus:ring-violet-100 dark:bg-tl-surface-muted dark:focus:ring-violet-900"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onSave(local)}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
      >
        <Save className="h-4 w-4" />
        Save Profile
      </button>
    </GlassCard>
  );
}
