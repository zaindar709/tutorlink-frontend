import { useEffect, useRef, useState } from 'react';
import { Save, User } from 'lucide-react';
import type { ParentProfile } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';

interface ProfileSettingsPageProps {
  profile: ParentProfile;
  onSave: (patch: Partial<ParentProfile>) => Promise<boolean> | boolean | void;
  onUploadAvatar?: (file: File) => Promise<boolean> | boolean | void;
}

export default function ProfileSettingsPage({
  profile,
  onSave,
  onUploadAvatar,
}: ProfileSettingsPageProps) {
  const [local, setLocal] = useState(profile);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal(profile);
  }, [profile]);

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
        {local.avatarUrl ? (
          <img
            src={local.avatarUrl}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-lg font-bold text-white">
            {local.avatarInitials}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) void onUploadAvatar?.(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-tl-border px-4 py-2 text-sm font-semibold text-tl-primary"
        >
          Change photo
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-tl-text-muted">Full Name</label>
          <input
            type="text"
            value={local.name}
            onChange={e => setLocal(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-tl-border bg-tl-surface px-3 py-2.5 text-sm text-tl-text outline-none focus:border-tl-primary focus:ring-2 focus:ring-violet-100 dark:bg-tl-surface-muted dark:focus:ring-violet-900"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-tl-text-muted">Email</label>
          <input
            type="text"
            value={local.email}
            disabled
            className="mt-1 w-full rounded-xl border border-tl-border bg-tl-surface-muted px-3 py-2.5 text-sm text-tl-text-muted outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-tl-text-muted">Phone</label>
          <input
            type="text"
            value={local.phone}
            onChange={e => setLocal(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-tl-border bg-tl-surface px-3 py-2.5 text-sm text-tl-text outline-none focus:border-tl-primary focus:ring-2 focus:ring-violet-100 dark:bg-tl-surface-muted dark:focus:ring-violet-900"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => {
          void (async () => {
            setSaving(true);
            await onSave({ name: local.name, phone: local.phone });
            setSaving(false);
          })();
        }}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </GlassCard>
  );
}
