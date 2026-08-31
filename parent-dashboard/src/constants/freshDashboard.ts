import type { DemoParentLinkEntry } from './linkCodes';
import type { ParentDashboardData } from '../types/parent.types';

/** Fresh linked-student dashboard: name from code (or override), all progress at zero. */
export function buildFreshParentDashboard(
  entry: DemoParentLinkEntry,
  opts?: { studentNameOverride?: string }
): ParentDashboardData {
  const studentName =
    String(opts?.studentNameOverride || '').trim() || entry.studentName;
  const initials = studentName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() || '')
    .join('');

  const today = new Date().toISOString().slice(0, 10);

  return {
    profile: {
      name: 'Parent User',
      email: 'parent@tutorlink.demo',
      phone: '+92 300 0000000',
      avatarInitials: 'PU',
    },
    stats: {
      linkedChildren: 1,
      upcomingSessions: 0,
      avgAttendance: 0,
      overallProgress: 0,
    },
    children: [
      {
        id: `child-${entry.code}`,
        name: studentName,
        grade: entry.grade,
        board: entry.board,
        avatarInitials: initials || 'ST',
        subjects: entry.subjects,
        attendanceRate: 0,
        sessionsThisMonth: 0,
        avgScore: 0,
        linkedAt: today,
      },
    ],
    sessions: [],
    notifications: [
      {
        id: 'welcome-link',
        title: 'Student linked successfully',
        message: `${studentName} is now linked. Progress starts at 0% and will grow with sessions.`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
    progress: entry.subjects.map(subject => ({
      childId: `child-${entry.code}`,
      childName: studentName,
      subject,
      score: 0,
      grade: '—',
      syllabusCovered: 0,
      trend: 'stable' as const,
      trendDelta: 0,
      weeklyBars: [0, 0, 0, 0, 0],
      sessionsCompleted: 0,
      lastUpdated: 'Just linked',
    })),
    weeklyProgress: [
      {
        childId: `child-${entry.code}`,
        childName: studentName,
        avatarInitials: initials || 'ST',
        subject: entry.subjects[0] || 'General',
        weeks: [
          { label: 'W1', score: 0 },
          { label: 'W2', score: 0 },
          { label: 'W3', score: 0 },
          { label: 'W4', score: 0 },
        ],
      },
    ],
    aiRecommendation: {
      summary: `${studentName} was just linked. No session history yet — progress is at 0%. Book a class to start tracking.`,
      tips: [
        'Encourage your child to complete their first tutoring session.',
        'Progress charts will fill in after classes are completed.',
        'You will get alerts when sessions are booked or finished.',
      ],
      forecasts: [],
    },
    settings: {
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
    },
  };
}
