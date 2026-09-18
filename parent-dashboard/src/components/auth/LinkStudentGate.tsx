import { useEffect, useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';

interface LinkStudentGateProps {
  onLink: (
    code: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  prefillCode?: string;
  initialError?: string | null;
}

export default function LinkStudentGate({
  onLink,
  prefillCode = '',
  initialError = null,
}: LinkStudentGateProps) {
  const [code, setCode] = useState(prefillCode);
  const [error, setError] = useState<string | null>(initialError);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (prefillCode) setCode(prefillCode);
  }, [prefillCode]);

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  const submit = async () => {
    setError(null);
    setBusy(true);
    const result = await onLink(code);
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
          Enter student code
        </h1>
        <p className="mt-2 text-center text-sm text-tl-text-muted">
          Paste the code from your child’s Profile. No parent sign in is
          needed — this code opens that student’s dashboard. You can add more
          children later with another code. The first load can take up to a
          minute if the server is waking up.
        </p>

        <label className="mt-8 block text-xs font-bold uppercase tracking-wide text-tl-text-muted">
          Parent link code
        </label>
        <input
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
          onClick={() => void submit()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light py-3.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'Opening dashboard…' : 'Open dashboard'}
        </button>

        <div className="mt-8 rounded-2xl border border-dashed border-tl-border bg-tl-surface-muted/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-tl-text-muted">
            How to get a code
          </p>
          <p className="mt-2 text-xs leading-5 text-tl-text-muted">
            In the student app: Profile → Link Parent Account → Generate code,
            then share it here.
          </p>
        </div>
      </div>
    </div>
  );
}
