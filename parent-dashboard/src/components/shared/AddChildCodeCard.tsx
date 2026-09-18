import { useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';

interface AddChildCodeCardProps {
  onLink: (
    code: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  compact?: boolean;
}

export default function AddChildCodeCard({
  onLink,
  compact = false,
}: AddChildCodeCardProps) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setBusy(true);
    const result = await onLink(code);
    setBusy(false);
    if (result.ok) setCode('');
    else setError(result.error);
  };

  const form = (
    <>
      <div className={`flex flex-col gap-3 ${compact ? '' : 'sm:flex-row'}`}>
        <input
          type="text"
          value={code}
          onChange={e => {
            setError(null);
            setCode(e.target.value.replace(/\s+/g, ' ').slice(0, 64));
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') void submit();
          }}
          placeholder="TL7K2M"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 rounded-xl border border-tl-border bg-tl-surface px-4 py-2.5 text-sm outline-none focus:border-tl-primary dark:bg-tl-surface-muted"
        />
        <button
          type="button"
          disabled={busy || code.trim().length < 4}
          onClick={() => void submit()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {busy ? 'Linking…' : 'Link student'}
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-sm font-semibold text-tl-red">{error}</p>
      ) : null}
    </>
  );

  if (compact) return form;

  return (
    <GlassCard className="p-6">
      <h4 className="font-bold text-tl-text">Link another student</h4>
      <p className="mt-1 text-sm text-tl-text-muted">
        Ask the other child to generate a code in the student app (Profile →
        Link Parent), then paste it here. Their progress appears under their
        name.
      </p>
      <div className="mt-4">{form}</div>
    </GlassCard>
  );
}
