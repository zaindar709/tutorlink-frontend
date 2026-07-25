export type ParentNavId =
  | 'overview'
  | 'children'
  | 'sessions'
  | 'progress'
  | 'notifications'
  | 'settings';

export type SettingsViewId =
  | 'hub'
  | 'profile'
  | 'account'
  | 'notifications-prefs'
  | 'privacy'
  | 'linked-students'
  | 'appearance'
  | 'language';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface LinkedChild {
  id: string;
  name: string;
  grade: string;
  board: string;
  avatarInitials: string;
  subjects: string[];
  attendanceRate: number;
  sessionsThisMonth: number;
  avgScore: number;
  linkedAt: string;
}

export interface ParentSession {
  id: string;
  childName: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  amount: number;
}

export interface ParentNotification {
  id: string;
  title: string;
  message: string;
  type: 'session' | 'payment' | 'progress' | 'system' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  childName: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  date: string;
}

export interface ProgressSnapshot {
  childId: string;
  childName: string;
  subject: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  sessionsCompleted: number;
  lastUpdated: string;
  /** Letter grade shown on subject cards */
  grade?: string;
  /** Syllabus completion % (0–100) */
  syllabusCovered?: number;
  /** e.g. +5 or -3 for trend pill */
  trendDelta?: number;
  /** Mini spark bars (typically 5 values 0–100) */
  weeklyBars?: number[];
}

export interface WeeklyProgressPoint {
  label: string;
  score: number;
}

export interface ChildWeeklyProgress {
  childId: string;
  childName: string;
  avatarInitials: string;
  subject: string;
  weeks: WeeklyProgressPoint[];
}

export interface AiWeekForecast {
  week: string;
  childName: string;
  projectedScore: number;
  focus: string;
  confidence: number;
}

export interface AiRecommendation {
  summary: string;
  tips: string[];
  forecasts: AiWeekForecast[];
}

export interface ParentProfile {
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
}

export interface ParentSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  sessionReminders: boolean;
  paymentAlerts: boolean;
  progressReports: boolean;
  weeklyDigest: boolean;
  profileVisible: boolean;
  shareProgressWithTutors: boolean;
  language: string;
  theme: ThemeMode;
}

export interface ParentDashboardData {
  profile: ParentProfile;
  stats: {
    linkedChildren: number;
    upcomingSessions: number;
    avgAttendance: number;
    overallProgress: number;
  };
  children: LinkedChild[];
  sessions: ParentSession[];
  notifications: ParentNotification[];
  progress: ProgressSnapshot[];
  weeklyProgress: ChildWeeklyProgress[];
  aiRecommendation: AiRecommendation;
  settings: ParentSettings;
}
