import {
  Bell,
  ChevronRight,
  Globe,
  Lock,
  Palette,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { SETTINGS_ITEMS } from '../../constants/nav';
import type { SettingsViewId } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';

const iconMap = {
  user: User,
  shield: Shield,
  bell: Bell,
  lock: Lock,
  users: Users,
  palette: Palette,
  globe: Globe,
};

interface SettingsHubPageProps {
  onOpen: (view: Exclude<SettingsViewId, 'hub'>) => void;
}

export default function SettingsHubPage({ onOpen }: SettingsHubPageProps) {
  return (
    <div className="animate-slide-up grid grid-cols-1 gap-4 md:grid-cols-2">
      {SETTINGS_ITEMS.map(item => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            className="text-left"
          >
            <GlassCard className="flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-tl-primary dark:bg-violet-950/30">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-tl-text">{item.label}</p>
                <p className="text-sm text-tl-text-muted">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-tl-text-muted" />
            </GlassCard>
          </button>
        );
      })}
    </div>
  );
}
