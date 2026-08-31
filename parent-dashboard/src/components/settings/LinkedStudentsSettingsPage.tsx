import { Link2, Unlink } from 'lucide-react';
import type { LinkedChild } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import { useState } from 'react';

interface LinkedStudentsSettingsPageProps {
  children: LinkedChild[];
  onUnlink?: () => void;
}

export default function LinkedStudentsSettingsPage({
  children,
  onUnlink,
}: LinkedStudentsSettingsPageProps) {
  const [code, setCode] = useState('');

  return (
    <div className="max-w-3xl space-y-6">
      <GlassCard className="p-6">
        <h4 className="font-bold text-tl-text">Linked from student app</h4>
        <p className="mt-1 text-sm text-tl-text-muted">
          Codes are generated on the student Profile tab. To switch students,
          unlink below and enter a new code on the home gate.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Already linked — use Unlink to change"
            disabled
            className="flex-1 rounded-xl border border-tl-border bg-tl-surface px-4 py-2.5 text-sm outline-none opacity-60 dark:bg-tl-surface-muted"
          />
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-5 py-2.5 text-sm font-semibold text-white opacity-50"
          >
            <Link2 className="h-4 w-4" />
            Link Student
          </button>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {children.map(child => (
          <GlassCard key={child.id} className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-sm font-bold text-white">
              {child.avatarInitials}
            </div>
            <div className="flex-1">
              <p className="font-bold text-tl-text">{child.name}</p>
              <p className="text-sm text-tl-text-muted">
                {child.grade} · Progress {child.avgScore}% · Linked {child.linkedAt}
              </p>
            </div>
            <Badge variant="success">Active</Badge>
            <button
              type="button"
              onClick={onUnlink}
              className="rounded-xl border border-red-200 p-2 text-tl-red transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20"
              aria-label={`Unlink ${child.name}`}
            >
              <Unlink className="h-4 w-4" />
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
