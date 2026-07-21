import { Bell, Mail, MessageSquare } from 'lucide-react';
import type { ParentSettings } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';
import Toggle from '../shared/Toggle';
import { useState } from 'react';

interface NotificationPreferencesPageProps {
  settings: ParentSettings;
  onSave: (patch: Partial<ParentSettings>) => void;
}

export default function NotificationPreferencesPage({
  settings,
  onSave,
}: NotificationPreferencesPageProps) {
  const [local, setLocal] = useState(settings);

  const update = (patch: Partial<ParentSettings>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onSave(patch);
  };

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
      <GlassCard className="p-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-tl-primary dark:bg-violet-950/30">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-tl-text">Alert Channels</h4>
            <p className="text-sm text-tl-text-muted">How we reach you</p>
          </div>
        </header>
        <Toggle
          label="Email alerts"
          description="Receive notifications via email"
          checked={local.emailAlerts}
          onChange={v => update({ emailAlerts: v })}
        />
        <div className="border-t border-tl-border" />
        <Toggle
          label="SMS alerts"
          description="Text messages for urgent session updates"
          checked={local.smsAlerts}
          onChange={v => update({ smsAlerts: v })}
        />
      </GlassCard>

      <GlassCard className="p-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-tl-blue dark:bg-blue-950/30">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-tl-text">Activity Alerts</h4>
            <p className="text-sm text-tl-text-muted">What you want to know about</p>
          </div>
        </header>
        <Toggle
          label="Session reminders"
          description="Before your child's tutoring sessions"
          checked={local.sessionReminders}
          onChange={v => update({ sessionReminders: v })}
        />
        <div className="border-t border-tl-border" />
        <Toggle
          label="Payment alerts"
          description="When a payment is processed or refunded"
          checked={local.paymentAlerts}
          onChange={v => update({ paymentAlerts: v })}
        />
        <div className="border-t border-tl-border" />
        <Toggle
          label="Progress reports"
          description="When weekly learning reports are ready"
          checked={local.progressReports}
          onChange={v => update({ progressReports: v })}
        />
        <div className="border-t border-tl-border" />
        <Toggle
          label="Weekly digest"
          description="Summary email every Sunday"
          checked={local.weeklyDigest}
          onChange={v => update({ weeklyDigest: v })}
        />
      </GlassCard>

      <GlassCard className="p-6 lg:col-span-2">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 text-tl-primary" />
          <p className="text-sm text-tl-text-muted">
            Notification preferences are saved locally. Backend push and email delivery will connect when parent APIs are ready.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
