import type { ElementType } from 'react';
import {
  Activity,
  LayoutDashboard,
  Link2,
  Settings,
  Shield,
  Wallet,
} from 'lucide-react';
import type { NavSectionId } from '../types/admin.types';

export const NAV_ITEMS: {
  id: NavSectionId;
  label: string;
  icon: ElementType;
  description: string;
}[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Platform snapshot & quick actions',
  },
  {
    id: 'verification',
    label: 'Tutor Verification',
    icon: Shield,
    description: 'Review applications & approve tutors',
  },
  {
    id: 'links',
    label: 'Parent-Student Links',
    icon: Link2,
    description: 'Manage family account connections',
  },
  {
    id: 'escrow',
    label: 'Escrow Management',
    icon: Wallet,
    description: 'Funds, disputes & refunds',
  },
  {
    id: 'ai',
    label: 'AI System Health',
    icon: Activity,
    description: 'Summary engine & token monitoring',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Platform configuration',
  },
];

export const PAGE_TITLES: Record<NavSectionId, string> = {
  overview: 'Overview',
  verification: 'Tutor Verification',
  links: 'Parent-Student Links',
  escrow: 'Escrow Management',
  ai: 'AI System Health',
  settings: 'Settings',
};
