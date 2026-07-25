import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { signInAdminWithPassword } from '../../services/adminAuth';
import { ADMIN_EMAIL } from '../../config/adminCredentials';
import { ADMIN_TOKEN_KEY } from '../../config/firebase';
import { setAdminAuthToken } from '../../api/admin.api';

interface AdminLoginPageProps {
  onLoggedIn: () => void;
}

export default function AdminLoginPage({ onLoggedIn }: AdminLoginPageProps) {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await signInAdminWithPassword(email.trim(), password);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, session.idToken);
      setAdminAuthToken(session.idToken);
      onLoggedIn();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not sign in. Contact your backend administrator.'
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
              Sign in to review tutor registration requests
            </p>
          </div>
        </div>

        <p className="mb-5 rounded-xl bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-900">
          Admin accounts are created by your backend team via seed script only.
          Use the credentials provided in <strong>.env.local</strong> — no
          sign-up from this dashboard.
        </p>

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
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
              placeholder="admin@tutorlink.com"
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
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-tl-primary focus:ring-2 focus:ring-violet-100"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-4 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
