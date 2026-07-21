import { useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import {
  registerAdminAccount,
  signInAdminWithPassword,
} from '../../services/adminAuth';
import { ADMIN_TOKEN_KEY } from '../../config/firebase';
import { setAdminAuthToken } from '../../api/admin.api';

interface AdminLoginPageProps {
  onLoggedIn: () => void;
  onPreview: () => void;
}

type Mode = 'signin' | 'create';

export default function AdminLoginPage({
  onLoggedIn,
  onPreview,
}: AdminLoginPageProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('TutorLink Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const session = await signInAdminWithPassword(email.trim(), password);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, session.idToken);
      setAdminAuthToken(session.idToken);
      onLoggedIn();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not sign in. Create an admin account first.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await registerAdminAccount(
        email.trim(),
        password,
        name.trim() || 'TutorLink Admin'
      );

      if (result.backendRegistered) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, result.idToken);
        setAdminAuthToken(result.idToken);
        setSuccess(result.backendMessage);
        setTimeout(() => onLoggedIn(), 1200);
        return;
      }

      setSuccess(
        `${result.backendMessage}\n\nMongoDB (if needed):\ndb.users.updateOne({ email: "${email.trim()}" }, { $set: { role: "admin" } })`
      );
      setMode('signin');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create admin account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-tl-bg px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl backdrop-blur-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-tl-primary-dark to-tl-primary-light text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-tl-navy">
              TutorLink Admin
            </h1>
            <p className="text-sm text-slate-500">
              Approve tutors from the mobile app
            </p>
          </div>
        </div>

        <div className="mb-5 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === 'signin'
                ? 'bg-white text-tl-primary shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === 'create'
                ? 'bg-white text-tl-primary shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Create admin (first time)
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <p className="rounded-xl bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-900">
              No credentials yet? Pick any email and password here — this creates
              your admin login for Firebase project{' '}
              <strong>tutor-link-62ed9</strong>.
            </p>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full name
              </span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
                placeholder="TutorLink Admin"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Admin email
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password (min 6 characters)
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
                placeholder="Choose a password"
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {success ? (
              <pre className="whitespace-pre-wrap rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-900">
                {success}
              </pre>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-4 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creating…' : 'Create admin account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Admin email
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
                placeholder="••••••••"
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {success ? (
              <pre className="whitespace-pre-wrap rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-900">
                {success}
              </pre>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-4 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in to Dashboard'}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={onPreview}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-violet-200 hover:text-tl-primary"
        >
          Preview UI only (no real tutor data)
        </button>
      </div>
    </div>
  );
}
