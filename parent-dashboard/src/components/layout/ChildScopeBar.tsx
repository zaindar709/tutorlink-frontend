import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { LinkedChild } from '../../types/parent.types';
import AddChildCodeCard from '../shared/AddChildCodeCard';

interface ChildScopeBarProps {
  children: LinkedChild[];
  selectedId: string;
  onSelect: (studentId: string) => void;
  onLink: (
    code: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export default function ChildScopeBar({
  children,
  selectedId,
  onSelect,
  onLink,
}: ChildScopeBarProps) {
  const [adding, setAdding] = useState(false);

  if (children.length === 0) return null;

  return (
    <div className="border-b border-tl-border bg-tl-surface/70 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2 overflow-x-auto">
        {children.map(child => {
          const active = child.id === selectedId;
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelect(child.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                active
                  ? 'border-transparent bg-gradient-to-r from-tl-primary-dark to-tl-primary-light text-white'
                  : 'border-tl-border bg-tl-surface text-tl-text-muted hover:border-violet-300 hover:text-tl-primary'
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {child.avatarInitials}
              </span>
              {child.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setAdding(open => !open)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-tl-border px-3 py-1.5 text-sm font-semibold text-tl-primary hover:border-violet-300"
        >
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {adding ? 'Cancel' : 'Add child'}
        </button>
      </div>
      {adding ? (
        <div className="mt-3 max-w-xl">
          <p className="mb-2 text-xs text-tl-text-muted">
            Paste another student’s parent-link code to show their data too.
          </p>
          <AddChildCodeCard
            compact
            onLink={async code => {
              const result = await onLink(code);
              if (result.ok) setAdding(false);
              return result;
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
