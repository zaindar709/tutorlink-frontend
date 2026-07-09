import axios from 'axios';
import type {
  AdminDashboardData,
  AdminSettings,
  AiNoteLog,
  EscrowDispute,
  EscrowTransaction,
  ParentStudentLink,
  PendingTutor,
  TutorVerificationStatus,
} from '../types/admin.types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://tutorlink-backend-fxb9.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const setAdminAuthToken = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const MOCK_TUTORS: PendingTutor[] = [
  {
    id: 't1',
    userId: 'u1',
    name: 'Prof. Ali Ahmed',
    email: 'ali.ahmed@tutorlink.com',
    phone: '+92 300 1234567',
    expertise: 'Physics',
    grades: ['Grade 10', 'Grade 11'],
    documents: [
      { id: 'd1', label: 'CNIC Front', type: 'cnic_front', url: '/docs/cnic-front-1.pdf' },
      { id: 'd2', label: 'CNIC Back', type: 'cnic_back', url: '/docs/cnic-back-1.pdf' },
      { id: 'd3', label: 'Degree PDF', type: 'degree', url: '/docs/degree-1.pdf' },
    ],
    status: 'pending',
    submittedAt: '2026-06-25T10:30:00Z',
  },
  {
    id: 't2',
    userId: 'u2',
    name: 'Sara Khan',
    email: 'sara.khan@tutorlink.com',
    phone: '+92 301 9876543',
    expertise: 'Mathematics',
    grades: ['Grade 9', 'Grade 10'],
    documents: [
      { id: 'd4', label: 'CNIC Front', type: 'cnic_front' },
      { id: 'd5', label: 'CNIC Back', type: 'cnic_back' },
      { id: 'd6', label: 'Degree PDF', type: 'degree' },
    ],
    status: 'interview_scheduled',
    submittedAt: '2026-06-24T14:00:00Z',
    interviewDate: '2026-06-28T15:00:00Z',
  },
  {
    id: 't3',
    userId: 'u3',
    name: 'Hassan Raza',
    email: 'hassan.raza@tutorlink.com',
    expertise: 'Chemistry',
    grades: ['Grade 12'],
    documents: [
      { id: 'd7', label: 'CNIC Front', type: 'cnic_front' },
      { id: 'd8', label: 'CNIC Back', type: 'cnic_back' },
      { id: 'd9', label: 'Degree PDF', type: 'degree' },
    ],
    status: 'pending',
    submittedAt: '2026-06-26T09:15:00Z',
  },
  {
    id: 't4',
    userId: 'u4',
    name: 'Fatima Noor',
    email: 'fatima.noor@tutorlink.com',
    expertise: 'Biology',
    grades: ['Grade 11', 'Grade 12'],
    documents: [
      { id: 'd10', label: 'CNIC Front', type: 'cnic_front' },
      { id: 'd11', label: 'CNIC Back', type: 'cnic_back' },
      { id: 'd12', label: 'Degree PDF', type: 'degree' },
    ],
    status: 'pending',
    submittedAt: '2026-06-26T11:45:00Z',
  },
];

const MOCK_LINKS: ParentStudentLink[] = [
  {
    id: 'l1',
    parentName: 'Mr. Aslam',
    parentEmail: 'aslam@email.com',
    studentName: 'Ahmed Aslam',
    studentEmail: 'ahmed@student.com',
    studentGrade: 'Grade 10',
    linkedAt: '2026-06-20T08:00:00Z',
    status: 'active',
  },
  {
    id: 'l2',
    parentName: 'Mrs. Fatima',
    parentEmail: 'fatima@email.com',
    studentName: 'Zainab Fatima',
    studentEmail: 'zainab@student.com',
    studentGrade: 'Grade 11',
    linkedAt: '2026-06-22T12:00:00Z',
    status: 'active',
  },
  {
    id: 'l3',
    parentName: 'Mr. Khan',
    parentEmail: 'khan@email.com',
    studentName: 'Omar Khan',
    studentEmail: 'omar@student.com',
    studentGrade: 'Grade 9',
    linkedAt: '2026-06-26T10:00:00Z',
    status: 'pending',
    linkCode: 'TL-8X2K9P',
  },
];

const MOCK_TRANSACTIONS: EscrowTransaction[] = [
  {
    id: 'tx1',
    transactionId: 'TXN-2026-001',
    type: 'hold',
    amount: 3500,
    studentName: 'Ahmed Aslam',
    tutorName: 'Prof. Ali Ahmed',
    status: 'completed',
    createdAt: '2026-06-26T09:00:00Z',
  },
  {
    id: 'tx2',
    transactionId: 'TXN-2026-002',
    type: 'release',
    amount: 2800,
    studentName: 'Zainab Fatima',
    tutorName: 'Sara Khan',
    status: 'completed',
    createdAt: '2026-06-25T14:30:00Z',
  },
  {
    id: 'tx3',
    transactionId: 'TXN-2026-003',
    type: 'refund',
    amount: 1800,
    studentName: 'Omar Khan',
    tutorName: 'Hassan Raza',
    status: 'pending',
    createdAt: '2026-06-26T11:00:00Z',
  },
];

const MOCK_AI_NOTES: AiNoteLog[] = [
  {
    id: 'n1',
    sessionId: 'sess-101',
    tutorName: 'Prof. Ali Ahmed',
    studentName: 'Ahmed Aslam',
    subject: 'Physics',
    tokensUsed: 1240,
    durationMs: 980,
    status: 'completed',
    createdAt: '2026-06-26T10:00:00Z',
  },
  {
    id: 'n2',
    sessionId: 'sess-102',
    tutorName: 'Sara Khan',
    studentName: 'Zainab Fatima',
    subject: 'Mathematics',
    tokensUsed: 890,
    durationMs: 720,
    status: 'completed',
    createdAt: '2026-06-26T09:30:00Z',
  },
  {
    id: 'n3',
    sessionId: 'sess-103',
    tutorName: 'Hassan Raza',
    studentName: 'Omar Khan',
    subject: 'Chemistry',
    tokensUsed: 0,
    durationMs: 0,
    status: 'failed',
    createdAt: '2026-06-26T08:15:00Z',
  },
];

const MOCK_SETTINGS: AdminSettings = {
  platformName: 'TutorLink',
  supportEmail: 'admin@tutorlink.com',
  autoApproveTutors: false,
  interviewRequired: true,
  escrowHoldDays: 3,
  notifyOnNewTutor: true,
  notifyOnDispute: true,
};

export const getMockDashboardData = (
  tutors: PendingTutor[] = MOCK_TUTORS
): AdminDashboardData => ({
  stats: {
    pendingTutors: tutors.filter(t => t.status === 'pending').length,
    escrowBalance: 145000,
    linkedParents: 312,
    liveClassrooms: 42,
    approvedTutors: 128,
    totalStudents: 1840,
  },
  pendingTutors: tutors.filter(
    t => t.status === 'pending' || t.status === 'interview_scheduled'
  ),
  aiHealth: {
    summarySpeedMs: 1240,
    tokenHealth: 94,
    uptime: 99.8,
    lastSync: new Date().toISOString(),
    notesGeneratedToday: 156,
    failedSummaries: 3,
    avgTokensPerSummary: 1050,
  },
  disputes: [
    {
      id: 'dis1',
      parentName: 'Mr. Aslam',
      studentName: 'Ahmed Aslam',
      tutorName: 'Prof. Ali Ahmed',
      amount: 2500,
      reason: 'Session quality flagged by parent',
      status: 'flagged',
      createdAt: '2026-06-26T08:00:00Z',
      bookingId: 'bk-001',
    },
    {
      id: 'dis2',
      parentName: 'Mrs. Fatima',
      studentName: 'Zainab Fatima',
      tutorName: 'Sara Khan',
      amount: 1800,
      reason: 'Refund pending — tutor no-show',
      status: 'refund_pending',
      createdAt: '2026-06-25T16:30:00Z',
      bookingId: 'bk-002',
    },
  ],
  parentLinks: MOCK_LINKS,
  escrowTransactions: MOCK_TRANSACTIONS,
  aiNotes: MOCK_AI_NOTES,
  settings: MOCK_SETTINGS,
});

export const fetchDashboardData = async (): Promise<AdminDashboardData> => {
  try {
    const { data } = await api.get<{ success: boolean; data: AdminDashboardData }>(
      '/api/admin/dashboard'
    );
    if (data?.data) return data.data;
  } catch {
    // Fall back to mock data when admin API is unavailable.
  }
  return getMockDashboardData();
};

export const fetchPendingTutors = async (): Promise<PendingTutor[]> => {
  try {
    const { data } = await api.get<{ data: PendingTutor[] }>(
      '/api/admin/tutors/pending'
    );
    if (data?.data) return data.data;
  } catch {
    // mock fallback
  }
  return getMockDashboardData().pendingTutors;
};

export const approveTutor = async (
  tutorId: string,
  notes?: string
): Promise<void> => {
  await api.patch(`/api/admin/tutors/${tutorId}/verify`, {
    isVerified: true,
    verificationStatus: 'approved',
    adminNotes: notes,
  });
};

export const rejectTutor = async (
  tutorId: string,
  reason: string
): Promise<void> => {
  await api.patch(`/api/admin/tutors/${tutorId}/reject`, {
    isVerified: false,
    verificationStatus: 'rejected',
    rejectionReason: reason,
  });
};

export const scheduleTutorInterview = async (
  tutorId: string,
  interviewDate: string,
  notes?: string
): Promise<void> => {
  await api.patch(`/api/admin/tutors/${tutorId}/interview`, {
    verificationStatus: 'interview_scheduled',
    interviewDate,
    adminNotes: notes,
  });
};

export const resolveDispute = async (
  disputeId: string,
  resolution: 'refund' | 'release' | 'dismiss'
): Promise<void> => {
  await api.patch(`/api/admin/escrow/disputes/${disputeId}/resolve`, {
    resolution,
  });
};

export const revokeParentLink = async (linkId: string): Promise<void> => {
  await api.patch(`/api/admin/parent-links/${linkId}/revoke`);
};

export const updateAdminSettings = async (
  settings: Partial<AdminSettings>
): Promise<AdminSettings> => {
  const { data } = await api.patch<{ data: AdminSettings }>(
    '/api/admin/settings',
    settings
  );
  return data.data;
};

export const updateTutorStatus = (
  tutors: PendingTutor[],
  tutorId: string,
  status: TutorVerificationStatus,
  interviewDate?: string
): PendingTutor[] =>
  tutors.map(tutor =>
    tutor.id === tutorId
      ? { ...tutor, status, interviewDate: interviewDate ?? tutor.interviewDate }
      : tutor
  );

export const removeApprovedTutor = (
  tutors: PendingTutor[],
  tutorId: string
): PendingTutor[] => tutors.filter(t => t.id !== tutorId);

export const updateDisputeStatus = (
  disputes: EscrowDispute[],
  disputeId: string
): EscrowDispute[] =>
  disputes.map(d =>
    d.id === disputeId ? { ...d, status: 'resolved' as const } : d
  );

export const updateLinkStatus = (
  links: ParentStudentLink[],
  linkId: string
): ParentStudentLink[] =>
  links.map(l =>
    l.id === linkId ? { ...l, status: 'revoked' as const } : l
  );
