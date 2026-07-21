import { Download, Eye, Share2 } from 'lucide-react';
import type { ParentSettings } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';
import Toggle from '../shared/Toggle';
import { useState } from 'react';

interface PrivacySettingsPageProps {
  settings: ParentSettings;
  onSave: (patch: Partial<ParentSettings>) => void;
}

export default function PrivacySettingsPage({
  settings,
  onSave,
}: PrivacySettingsPageProps) {
  const [local, setLocal] = useState(settings);

  const update = (patch: Partial<ParentSettings>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onSave(patch);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <GlassCard className="p-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-tl-primary dark:bg-violet-950/30">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-tl-text">Visibility</h4>
            <p className="text-sm text-tl-text-muted">Control what others can see</p>
          </div>
        </header>
        <Toggle
          label="Profile visible to tutors"
          description="Allow session tutors to see parent contact info"
          checked={local.profileVisible}
          onChange={v => update({ profileVisible: v })}
        />
        <div className="border-t border-tl-border" />
        <Toggle
          label="Share progress with tutors"
          description="Let tutors view linked child's learning stats"
          checked={local.shareProgressWithTutors}
          onChange={v => update({ shareProgressWithTutors: v })}
        />
      </GlassCard>

      <GlassCard className="p-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-tl-blue dark:bg-blue-950/30">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-tl-text">Your Data</h4>
            <p className="text-sm text-tl-text-muted">Export or manage stored information</p>
          </div>
        </header>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-tl-border p-3 text-left transition hover:border-violet-300"
        >
          <Download className="h-5 w-5 text-tl-primary" />
          <div>
            <p className="text-sm font-semibold text-tl-text">Download my data</p>
            <p className="text-xs text-tl-text-muted">Get a copy of your account information</p>
          </div>
        </button>
      </GlassCard>
    </div>
  );
}
