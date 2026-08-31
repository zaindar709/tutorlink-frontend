import { useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';

interface LinkStudentGateProps {
  onLink: (code: string) => { ok: true } | { ok: false; error: string };
  prefillCode?: string;
}

export default function LinkStudentGate({
  onLink,
  prefillCode = '',
}: LinkStudentGateProps) {
  const [code, setCode] = useState(prefillCode);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setError(null);
    setBusy(true);
    const result = onLink(code);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-tl-bg p-6 text-tl-text">
      <div className="w-full max-w-md rounded-3xl border border-tl-border bg-tl-surface p-8 shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-white">
          <Link2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-extrabold tracking-tight">
          Link your student
        </h1>
        <p className="mt-2 text-center text-sm text-tl-text-muted">
          Paste the full code from your child’s Profile (e.g.{' '}
          <span className="font-mono font-semibold text-tl-text">TL7K2M~Afifa</span>
          ). The name in the code is the student you’ll see.
        </p>

        <label className="mt-8 block text-xs font-bold uppercase tracking-wide text-tl-text-muted">
          Parent link code
        </label>
        <input
          value={code}
          onChange={e => {
            setError(null);
            // Keep name casing after ~ ; only normalize spaces
            setCode(e.target.value.replace(/\s+/g, ' ').slice(0, 64));
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="TL7K2M~Afifa"
          autoCorrect="off"
          spellCheck={false}
          className="mt-2 w-full rounded-2xl border border-tl-border bg-tl-surface-muted px-4 py-3 text-center text-lg font-extrabold tracking-wide text-tl-text outline-none focus:border-tl-primary"
        />

        {error ? (
          <p className="mt-3 text-center text-sm font-semibold text-tl-red">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={busy || code.trim().length < 4}
          onClick={submit}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light py-3.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Open parent dashboard
        </button>

        <div className="mt-8 rounded-2xl border border-dashed border-tl-border bg-tl-surface-muted/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-tl-text-muted">
            Demo tip
          </p>
          <p className="mt-2 text-xs leading-5 text-tl-text-muted">
            Always paste the <span className="font-semibold">full</span> code
            shown after Generate — it includes the student name so the dashboard
            opens for that child at 0% progress.
          </p>
        </div>
      </div>
    </div>
  );
}
