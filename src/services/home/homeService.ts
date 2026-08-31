import { getDashboardAPI } from '../../api/home.api';
import {
  DashboardAiSummary,
  DashboardData,
  DashboardLesson,
} from '../../types/api.types';

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : null;

const normalizeLesson = (raw: unknown, index: number): DashboardLesson | null => {
  const b = asRecord(raw);
  if (!b) return null;
  const id = String(b._id || b.id || '').trim();
  if (!id) return null;
  const tutor = asRecord(b.tutor);
  return {
    _id: id,
    subject: String(b.subject || 'Lesson'),
    startTime: String(b.startTime || ''),
    endTime: String(b.endTime || ''),
    date: String(b.date || ''),
    status: String(b.status || 'accepted'),
    tutor: tutor
      ? {
          _id: String(tutor._id || tutor.id || ''),
          name: String(tutor.name || 'Tutor'),
          avatarUrl: tutor.avatarUrl ? String(tutor.avatarUrl) : undefined,
        }
      : undefined,
    meetingLink: b.meetingLink != null ? String(b.meetingLink) : undefined,
    canJoinRoom: b.canJoinRoom !== false,
    isNextSession: Boolean(b.isNextSession),
    packageId: b.packageId != null ? String(b.packageId) : undefined,
    mode: b.mode != null ? String(b.mode) : undefined,
  };
};

const normalizeSummary = (
  raw: unknown,
  index: number
): DashboardAiSummary | null => {
  const b = asRecord(raw);
  if (!b) return null;
  const id = String(b._id || b.id || `summary-${index}`).trim();
  const title = String(
    b.title || b.heading || b.subject || 'Learning summary'
  ).trim();
  if (!title) return null;
  const tutor = asRecord(b.tutor);
  const tutorName = String(
    b.tutorName || tutor?.name || ''
  ).trim();
  const sessionDate = String(
    b.sessionDate || b.date || ''
  ).trim();
  return {
    _id: id,
    title,
    subject: String(b.subject || b.category || 'General'),
    excerpt: String(
      b.excerpt || b.overview || b.summary || b.description || ''
    ),
    createdAt: String(b.createdAt || b.updatedAt || new Date().toISOString()),
    tutorName: tutorName || undefined,
    sessionDate: sessionDate || undefined,
    icon: b.icon != null ? String(b.icon) : undefined,
    bookingId: b.bookingId != null ? String(b.bookingId) : undefined,
    sessionId: b.sessionId != null ? String(b.sessionId) : undefined,
  };
};

const normalizeDashboard = (raw: DashboardData): DashboardData => {
  const lessons = Array.isArray(raw.todaySchedule?.currentLessons)
    ? raw.todaySchedule.currentLessons
        .map((item, i) => normalizeLesson(item, i))
        .filter((x): x is DashboardLesson => Boolean(x))
    : [];

  // Deduplicate lessons by their id. Backends or transforms sometimes
  // return duplicate entries; keep the first occurrence only so the
  // dashboard shows each session once.
  const uniqueLessonsMap = new Map<string, DashboardLesson>();
  lessons.forEach(l => {
    if (l && l._id && !uniqueLessonsMap.has(l._id)) {
      uniqueLessonsMap.set(l._id, l);
    }
  });
  const uniqueLessons = Array.from(uniqueLessonsMap.values());

  const summaries = Array.isArray(raw.aiSummaries)
    ? raw.aiSummaries
        .map((item, i) => normalizeSummary(item, i))
        .filter((x): x is DashboardAiSummary => Boolean(x))
    : [];

  const qa = raw.quickAccess || {
    assignments: { count: 0, label: '0 new' },
    quizzes: { count: 0, label: '0 pending' },
    tests: { count: 0, label: '0 upcoming' },
  };

  return {
    ...raw,
    todaySchedule: {
      title: raw.todaySchedule?.title || "Today's Schedule",
      sectionTitle: raw.todaySchedule?.sectionTitle || 'Current Lessons',
      date: raw.todaySchedule?.date || '',
      results: uniqueLessons.length,
      currentLessons: uniqueLessons,
    },
    quickAccess: {
      assignments: {
        count: Number(qa.assignments?.count || 0),
        label: String(qa.assignments?.label || `${qa.assignments?.count || 0} new`),
      },
      quizzes: {
        count: Number(qa.quizzes?.count || 0),
        label: String(qa.quizzes?.label || `${qa.quizzes?.count || 0} pending`),
      },
      tests: {
        count: Number(qa.tests?.count || 0),
        label: String(qa.tests?.label || `${qa.tests?.count || 0} upcoming`),
      },
    },
    aiSummaries: summaries,
    notifications: {
      unreadCount: Number(raw.notifications?.unreadCount || 0),
      hasUnread: Boolean(
        raw.notifications?.hasUnread || (raw.notifications?.unreadCount || 0) > 0
      ),
    },
    hasActiveTutor: Boolean(
      raw.hasActiveTutor ||
        lessons.length > 0 ||
        (raw.upcomingSessionCount || 0) > 0
    ),
    upcomingSessionCount: Number(raw.upcomingSessionCount || lessons.length || 0),
  };
};

export const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await getDashboardAPI();
  if (!response.data.data) {
    throw new Error('Dashboard data is unavailable');
  }
  return normalizeDashboard(response.data.data);
};
