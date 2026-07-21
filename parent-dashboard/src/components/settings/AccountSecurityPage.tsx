import { KeyRound, Shield, Smartphone } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import Toggle from '../shared/Toggle';
import { useState } from 'react';

export default function AccountSecurityPage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const sessions = [
    { device: 'Chrome on Windows', location: 'Islamabad, PK', current: true },
    { device: 'TutorLink Android', location: 'Rawalpindi, PK', current: false },
  ];

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
      <GlassCard className="p-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-tl-green dark:bg-emerald-950/30">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-tl-text">Security Features</h4>
            <p className="text-sm text-tl-text-muted">Protect your parent account</p>
          </div>
        </header>
        <Toggle
          label="Two-factor authentication"
          description="Require a code when signing in on new devices"
          checked={twoFactor}
          onChange={setTwoFactor}
        />
        <div className="border-t border-tl-border" />
        <Toggle
          label="Login alerts"
          description="Email when a new device accesses your account"
          checked={loginAlerts}
          onChange={setLoginAlerts}
        />
        <button
          type="button"
          className="mt-4 flex w-full items-center gap-3 rounded-xl border border-tl-border p-3 text-left transition hover:border-violet-300"
        >
          <KeyRound className="h-5 w-5 text-tl-primary" />
          <div>
            <p className="text-sm font-semibold text-tl-text">Change password</p>
            <p className="text-xs text-tl-text-muted">Last changed 3 months ago</p>
          </div>
        </button>
      </GlassCard>

      <GlassCard className="p-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-tl-blue dark:bg-blue-950/30">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-tl-text">Active Sessions</h4>
            <p className="text-sm text-tl-text-muted">Devices currently signed in</p>
          </div>
        </header>
        <div className="space-y-3">
          {sessions.map(session => (
            <div
              key={session.device}
              className="rounded-xl border border-tl-border p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-tl-text">{session.device}</p>
                {session.current ? (
                  <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Current
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-tl-text-muted">{session.location}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-tl-red transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20"
        >
          Sign out all other devices
        </button>
      </GlassCard>
    </div>
  );
}
