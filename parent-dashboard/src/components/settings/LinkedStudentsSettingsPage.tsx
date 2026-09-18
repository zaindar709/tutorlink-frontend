import { Unlink } from 'lucide-react';
import type { LinkedChild } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';
import AddChildCodeCard from '../shared/AddChildCodeCard';

interface LinkedStudentsSettingsPageProps {
  children: LinkedChild[];
  onUnlink?: (studentId: string) => Promise<boolean> | boolean | void;
  onLink?: (
    code: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export default function LinkedStudentsSettingsPage({
  children,
  onUnlink,
  onLink,
}: LinkedStudentsSettingsPageProps) {
  return (
    <div className="max-w-3xl space-y-6">
      {onLink ? <AddChildCodeCard onLink={onLink} /> : null}

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
              onClick={() => {
                if (
                  window.confirm(`Unlink ${child.name} from this parent account?`)
                ) {
                  void onUnlink?.(child.id);
                }
              }}
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
