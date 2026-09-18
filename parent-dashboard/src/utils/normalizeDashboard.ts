import type {
  AiRecommendation,
  LinkedChild,
  ParentDashboardData,
  ParentNotification,
  ParentProfile,
  ParentSession,
  ParentSettings,
  ProgressSnapshot,
  ChildWeeklyProgress,
} from '../types/parent.types';

export const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  emailAlerts: true,
  smsAlerts: false,
  sessionReminders: true,
  paymentAlerts: true,
  progressReports: true,
  weeklyDigest: false,
  profileVisible: true,
  shareProgressWithTutors: true,
  language: 'en',
  theme: 'system',
  timezone: 'Asia/Karachi',
  currency: 'PKR',
  twoFactorEnabled: false,
  loginAlerts: true,
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const str = (value: unknown, fallback = '') =>
  value === undefined || value === null ? fallback : String(value);

const num = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const initialsFrom = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'P';

export const emptyDashboard = (
  profile?: Partial<ParentProfile>
): ParentDashboardData => {
  const name = profile?.name || 'Parent';
  return {
    profile: {
      name,
      email: profile?.email || '',
      phone: profile?.phone || '',
      avatarInitials: profile?.avatarInitials || initialsFrom(name),
      avatarUrl: profile?.avatarUrl,
    },
    stats: {
      linkedChildren: 0,
      upcomingSessions: 0,
      avgAttendance: 0,
      overallProgress: 0,
    },
    children: [],
    sessions: [],
    notifications: [],
    progress: [],
    weeklyProgress: [],
    aiRecommendation: {
      summary: 'No linked student yet. Enter a parent link code to get started.',
      tips: [
        'Ask your child to generate a code on their Profile tab.',
        'Paste the code here to link their account.',
        'Progress stays at 0% until they complete a class.',
      ],
      forecasts: [],
    },
    settings: { ...DEFAULT_PARENT_SETTINGS },
  };
};

export const mapChild = (raw: unknown): LinkedChild => {
  const item = asRecord(raw);
  const name = str(item.name, 'Student');
  return {
    id: str(item.id || item._id || item.studentId),
    name,
    grade: str(item.grade, '—'),
    board: str(item.board, '—'),
    avatarUrl: str(item.avatarUrl) || undefined,
    avatarInitials: str(item.avatarInitials) || initialsFrom(name),
    subjects: Array.isArray(item.subjects)
      ? item.subjects.map(s => String(s))
      : [],
    attendanceRate: num(item.attendanceRate),
    sessionsThisMonth: num(item.sessionsThisMonth),
    avgScore: num(item.avgScore),
    linkedAt: str(item.linkedAt).slice(0, 10),
  };
};

const mapSession = (raw: unknown): ParentSession => {
  const item = asRecord(raw);
  const statusRaw = str(item.status, 'upcoming');
  const status =
    statusRaw === 'live' ||
    statusRaw === 'completed' ||
    statusRaw === 'cancelled'
      ? statusRaw
      : 'upcoming';
  return {
    id: str(item.id || item._id),
    childId: str(item.childId) || undefined,
    childName: str(item.childName, 'Student'),
    tutorId: str(item.tutorId) || undefined,
    tutorName: str(item.tutorName, 'Tutor'),
    subject: str(item.subject, 'Session'),
    date: str(item.date),
    time: str(item.time),
    status,
    amount: num(item.amount),
    startsAt: str(item.startsAt) || undefined,
    endsAt: str(item.endsAt) || undefined,
  };
};

const mapNotification = (raw: unknown): ParentNotification => {
  const item = asRecord(raw);
  const typeRaw = str(item.type, 'system');
  const type =
    typeRaw === 'session' ||
    typeRaw === 'payment' ||
    typeRaw === 'progress' ||
    typeRaw === 'alert'
      ? typeRaw
      : 'system';
  return {
    id: str(item.id || item._id),
    title: str(item.title, 'Notification'),
    message: str(item.message || item.body),
    type,
    read: Boolean(item.read),
    createdAt: str(item.createdAt, new Date().toISOString()),
    studentId: str(item.studentId) || undefined,
    bookingId: str(item.bookingId) || undefined,
  };
};

const mapProgress = (raw: unknown): ProgressSnapshot => {
  const item = asRecord(raw);
  const trendRaw = str(item.trend, 'stable');
  const trend =
    trendRaw === 'up' || trendRaw === 'down' ? trendRaw : 'stable';
  const bars = Array.isArray(item.weeklyBars)
    ? item.weeklyBars.map(v => num(v)).slice(0, 5)
    : [0, 0, 0, 0, 0];
  while (bars.length < 5) bars.push(0);
  return {
    childId: str(item.childId),
    childName: str(item.childName),
    subject: str(item.subject),
    score: num(item.score),
    trend,
    sessionsCompleted: num(item.sessionsCompleted),
    lastUpdated: str(item.lastUpdated),
    grade: str(item.grade) || undefined,
    syllabusCovered: num(item.syllabusCovered, num(item.score)),
    trendDelta: num(item.trendDelta),
    weeklyBars: bars,
  };
};

const mapWeekPoint = (raw: unknown) => {
  const w = asRecord(raw);
  return { label: str(w.label), score: num(w.score) };
};

const mapWeekly = (raw: unknown): ChildWeeklyProgress => {
  const item = asRecord(raw);
  const name = str(item.childName, 'Student');
  const weeks = Array.isArray(item.weeks)
    ? item.weeks.map(mapWeekPoint).slice(0, 5)
    : [];
  return {
    childId: str(item.childId),
    childName: name,
    avatarInitials: str(item.avatarInitials) || initialsFrom(name),
    subject: str(item.subject),
    weeks,
  };
};

const looksLikeFlatWeeks = (items: unknown[]) =>
  items.length > 0 &&
  items.every(item => {
    const rec = asRecord(item);
    return rec.label !== undefined && !Array.isArray(rec.weeks) && !rec.childId;
  });

export const normalizeDashboard = (
  raw: unknown,
  fallback?: Partial<ParentProfile>
): ParentDashboardData => {
  const data = asRecord(raw);
  const profileRaw = asRecord(data.profile);
  const statsRaw = asRecord(data.stats);
  const settingsRaw = asRecord(data.settings);
  const aiRaw = asRecord(data.aiRecommendation);
  const name = str(profileRaw.name, fallback?.name || 'Parent');

  const children = Array.isArray(data.children)
    ? data.children.map(mapChild)
    : [];
  const sessions = Array.isArray(data.sessions)
    ? data.sessions.map(mapSession)
    : [];
  const notifications = Array.isArray(data.notifications)
    ? data.notifications.map(mapNotification)
    : [];
  const progress = Array.isArray(data.progress)
    ? data.progress.map(mapProgress)
    : [];
  const weeklyRaw = Array.isArray(data.weeklyProgress) ? data.weeklyProgress : [];
  const weeklyProgress = looksLikeFlatWeeks(weeklyRaw)
    ? [
        mapWeekly({
          childName: children[0]?.name || progress[0]?.childName || 'Student',
          childId: children[0]?.id || progress[0]?.childId,
          weeks: weeklyRaw,
        }),
      ]
    : weeklyRaw.map(mapWeekly);

  return {
    profile: {
      name,
      email: str(profileRaw.email, fallback?.email || ''),
      phone: str(profileRaw.phone, fallback?.phone || ''),
      avatarInitials:
        str(profileRaw.avatarInitials) || initialsFrom(name),
      avatarUrl: str(profileRaw.avatarUrl) || fallback?.avatarUrl,
    },
    stats: {
      linkedChildren: num(statsRaw.linkedChildren, children.length),
      upcomingSessions: num(statsRaw.upcomingSessions),
      avgAttendance: num(statsRaw.avgAttendance),
      overallProgress: num(statsRaw.overallProgress),
    },
    children,
    sessions,
    notifications,
    progress,
    weeklyProgress,
    aiRecommendation: {
      summary: str(
        aiRaw.summary,
        children.length
          ? 'Progress will fill in after completed classes.'
          : 'Link a student to see AI learning insights.'
      ),
      tips: Array.isArray(aiRaw.tips) ? aiRaw.tips.map(t => String(t)) : [],
      forecasts: Array.isArray(aiRaw.forecasts)
        ? aiRaw.forecasts.map(item => {
            const f = asRecord(item);
            return {
              week: str(f.week),
              childName: str(f.childName),
              projectedScore: num(f.projectedScore),
              focus: str(f.focus),
              confidence: num(f.confidence),
            };
          })
        : [],
    },
    settings: {
      ...DEFAULT_PARENT_SETTINGS,
      ...settingsRaw,
      language: str(settingsRaw.language, DEFAULT_PARENT_SETTINGS.language),
      theme:
        settingsRaw.theme === 'dark' ||
        settingsRaw.theme === 'light' ||
        settingsRaw.theme === 'system'
          ? settingsRaw.theme
          : DEFAULT_PARENT_SETTINGS.theme,
    } as ParentSettings,
  };
};

export const normalizeAi = (raw: unknown): AiRecommendation => {
  const item = asRecord(raw);
  return {
    summary: str(item.summary),
    tips: Array.isArray(item.tips) ? item.tips.map(t => String(t)) : [],
    forecasts: Array.isArray(item.forecasts)
      ? item.forecasts.map(row => {
          const f = asRecord(row);
          return {
            week: str(f.week),
            childName: str(f.childName),
            projectedScore: num(f.projectedScore),
            focus: str(f.focus),
            confidence: num(f.confidence),
          };
        })
      : [],
  };
};

export const extractItems = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  const data = asRecord(payload);
  if (Array.isArray(data.items)) return data.items as T[];
  return [];
};

export const normalizeChildren = (payload: unknown): LinkedChild[] => {
  if (Array.isArray(payload)) return payload.map(mapChild).filter(c => c.id);
  const data = asRecord(payload);
  const list = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.children)
      ? data.children
      : [];
  return list.map(mapChild).filter(c => c.id);
};

const belongsToChild = (recordId: string | undefined, childId: string) =>
  !recordId || recordId === childId;

/** Scope sessions/progress/alerts to one child without dropping the full roster. */
export const filterDashboardByChild = (
  data: ParentDashboardData,
  childId: string | null
): ParentDashboardData => {
  if (!childId) return data;
  const child = data.children.find(item => item.id === childId);
  if (!child) return data;

  const sessions = data.sessions.filter(item =>
    belongsToChild(item.childId, childId)
  );
  const progress = data.progress.filter(item =>
    belongsToChild(item.childId, childId)
  );
  const weeklyProgress = data.weeklyProgress.filter(item =>
    belongsToChild(item.childId, childId)
  );
  const notifications = data.notifications.filter(item =>
    belongsToChild(item.studentId, childId)
  );

  return {
    ...data,
    stats: {
      linkedChildren: data.children.length,
      upcomingSessions: sessions.filter(
        item => item.status === 'upcoming' || item.status === 'live'
      ).length,
      avgAttendance: child.attendanceRate,
      overallProgress: child.avgScore,
    },
    sessions,
    progress,
    weeklyProgress,
    notifications,
  };
};

export const resolveChildId = (
  children: LinkedChild[],
  preferred?: string | null
) => {
  if (preferred && children.some(child => child.id === preferred)) {
    return preferred;
  }
  return children[0]?.id || '';
};
