import { useState } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import {
  getApiErrorMessage,
  registerParent,
  signInParent,
} from '../../services/parentAuth';

interface ParentAuthGateProps {
  onAuthenticated: () => Promise<void> | void;
}

export default function ParentAuthGate({ onAuthenticated }: ParentAuthGateProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'register') {
        await registerParent({ name, email, password, phone });
      } else {
        await signInParent(email, password);
      }
      await onAuthenticated();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not sign in'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-tl-bg p-6 text-tl-text">
      <div className="w-full max-w-md rounded-3xl border border-tl-border bg-tl-surface p-8 shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-white">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-extrabold tracking-tight">
          {mode === 'login' ? 'Parent sign in' : 'Create parent account'}
        </h1>
        <p className="mt-2 text-center text-sm text-tl-text-muted">
          Use the same TutorLink email you registered as a parent. Then link
          your child with a code from the student app.
        </p>

        <form onSubmit={e => void submit(e)} className="mt-6 space-y-4">
          {mode === 'register' ? (
            <>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-tl-text-muted">
                  Full name
                </span>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-tl-border bg-tl-surface-muted px-4 py-3 text-sm outline-none focus:border-tl-primary"
                  placeholder="Aslam Khan"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-tl-text-muted">
                  Phone
                </span>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-tl-border bg-tl-surface-muted px-4 py-3 text-sm outline-none focus:border-tl-primary"
                  placeholder="+92 300 0000000"
                />
              </label>
            </>
          ) : null}

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-tl-text-muted">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-2xl border border-tl-border bg-tl-surface-muted px-4 py-3 text-sm outline-none focus:border-tl-primary"
              placeholder="parent@email.com"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-tl-text-muted">
              Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              minLength={6}
              className="mt-1 w-full rounded-2xl border border-tl-border bg-tl-surface-muted px-4 py-3 text-sm outline-none focus:border-tl-primary"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-tl-red dark:border-red-900 dark:bg-red-950/30">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode(mode === 'login' ? 'register' : 'login');
          }}
          className="mt-5 w-full text-center text-sm font-semibold text-tl-primary"
        >
          {mode === 'login'
            ? 'New parent? Create an account'
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
