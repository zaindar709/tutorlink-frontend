import {
  Bell,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { ParentNavId, SettingsViewId } from '../types/parent.types';

export const NAV_ITEMS: {
  id: ParentNavId;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'children', label: 'My Children', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: CalendarDays },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const PAGE_TITLES: Record<ParentNavId, string> = {
  overview: 'Overview',
  children: 'My Children',
  sessions: 'Sessions',
  progress: 'Learning Progress',
  notifications: 'Notifications',
  settings: 'Settings',
};

export const SETTINGS_ITEMS: {
  id: Exclude<SettingsViewId, 'hub'>;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Name, email, and contact details',
    icon: 'user',
  },
  {
    id: 'account',
    label: 'Account & Security',
    description: 'Password, 2FA, and login activity',
    icon: 'shield',
  },
  {
    id: 'notifications-prefs',
    label: 'Notification Preferences',
    description: 'Email, SMS, and alert settings',
    icon: 'bell',
  },
  {
    id: 'privacy',
    label: 'Privacy',
    description: 'Data sharing and visibility controls',
    icon: 'lock',
  },
  {
    id: 'linked-students',
    label: 'Linked Students',
    description: 'Manage connected child accounts',
    icon: 'users',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Theme, display, and accessibility',
    icon: 'palette',
  },
  {
    id: 'language',
    label: 'Language & Region',
    description: 'Language, timezone, and currency',
    icon: 'globe',
  },
];

export const SETTINGS_VIEW_TITLES: Record<SettingsViewId, string> = {
  hub: 'Settings',
  profile: 'Profile',
  account: 'Account & Security',
  'notifications-prefs': 'Notification Preferences',
  privacy: 'Privacy',
  'linked-students': 'Linked Students',
  appearance: 'Appearance',
  language: 'Language & Region',
};

export const GRADUATION_ICON = GraduationCap;
