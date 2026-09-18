import { KeyRound, Shield, Smartphone } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import Toggle from '../shared/Toggle';
import { useState } from 'react';
import type { ParentSettings } from '../../types/parent.types';
import type { DeviceSession } from '../../api/parent.api';

interface AccountSecurityPageProps {
  settings: ParentSettings;
  sessions: DeviceSession[];
  onSave: (patch: Partial<ParentSettings>) => Promise<boolean> | boolean | void;
  onSignOutOthers: () => Promise<boolean> | boolean | void;
  onChangePassword: (password: string) => Promise<boolean>;
}

const deviceLabel = (session: DeviceSession) => {
  const ua = session.userAgent || '';
  if (/android/i.test(ua)) return 'TutorLink Android';
  if (/iphone|ipad|ios/i.test(ua)) return 'TutorLink iOS';
  if (/edg/i.test(ua)) return 'Edge on desktop';
  if (/chrome/i.test(ua)) return 'Chrome on desktop';
  if (/safari/i.test(ua)) return 'Safari';
  if (/firefox/i.test(ua)) return 'Firefox';
  return session.platform === 'web' ? 'This browser' : session.platform || 'Device';
};

export default function AccountSecurityPage({
  settings,
  sessions,
  onSave,
  onSignOutOthers,
  onChangePassword,
}: AccountSecurityPageProps) {
  const [twoFactor, setTwoFactor] = useState(Boolean(settings.twoFactorEnabled));
  const [loginAlerts, setLoginAlerts] = useState(
    settings.loginAlerts !== false
  );
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [twoFactorNote, setTwoFactorNote] = useState<string | null>(null);

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
          description="Not available yet — enabling will stay off until TOTP ships"
          checked={twoFactor}
          onChange={v => {
            void (async () => {
              setTwoFactor(v);
              const ok = await onSave({ twoFactorEnabled: v });
              if (!ok && v) {
                setTwoFactor(false);
                setTwoFactorNote(
                  'Two-factor authentication is not available yet.'
                );
              }
            })();
          }}
        />
        {twoFactorNote ? (
          <p className="mb-3 text-xs font-semibold text-tl-red">{twoFactorNote}</p>
        ) : null}
        <div className="border-t border-tl-border" />
        <Toggle
          label="Login alerts"
          description="Email when a new device accesses your account"
          checked={loginAlerts}
          onChange={v => {
            setLoginAlerts(v);
            void onSave({ loginAlerts: v });
          }}
        />
        <div className="mt-4 rounded-xl border border-tl-border p-3">
          <div className="mb-2 flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-tl-primary" />
            <div>
              <p className="text-sm font-semibold text-tl-text">Change password</p>
              <p className="text-xs text-tl-text-muted">Updates your Firebase login</p>
            </div>
          </div>
          {showPassword ? (
            <div className="space-y-2">
              <input
                type="password"
                value={newPassword}
                minLength={6}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                className="w-full rounded-xl border border-tl-border bg-tl-surface px-3 py-2 text-sm outline-none focus:border-tl-primary dark:bg-tl-surface-muted"
              />
              <button
                type="button"
                disabled={savingPassword || newPassword.length < 6}
                onClick={() => {
                  void (async () => {
                    setSavingPassword(true);
                    const ok = await onChangePassword(newPassword);
                    setSavingPassword(false);
                    if (ok) {
                      setNewPassword('');
                      setShowPassword(false);
                    }
                  })();
                }}
                className="rounded-xl bg-gradient-to-r from-tl-primary-dark to-tl-primary-light px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingPassword ? 'Saving…' : 'Update password'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="text-sm font-semibold text-tl-primary"
            >
              Change password
            </button>
          )}
        </div>
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
          {sessions.length === 0 ? (
            <p className="text-sm text-tl-text-muted">This device only.</p>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                className="rounded-xl border border-tl-border p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-tl-text">
                    {deviceLabel(session)}
                  </p>
                  {session.current ? (
                    <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-tl-text-muted">
                  {session.ip || 'Unknown location'}
                </p>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={() => void onSignOutOthers()}
          className="mt-4 w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-tl-red transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20"
        >
          Sign out all other devices
        </button>
      </GlassCard>
    </div>
  );
}
