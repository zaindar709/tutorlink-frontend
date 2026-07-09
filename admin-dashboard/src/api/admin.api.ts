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

const docUrl = (path?: string) =>
  path ? `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}` : undefined;

const mapOnboardingStatus = (
  status?: string
): TutorVerificationStatus => {
  if (status === 'interview_scheduled') return 'interview_scheduled';
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  return 'pending';
};

export const mapBackendTutor = (raw: Record<string, unknown>): PendingTutor => {
  const user = (raw.user || {}) as Record<string, unknown>;
  const documents = [
    raw.cnicFrontUrl
      ? {
          id: 'cnic-front',
          label: 'CNIC Front',
          type: 'cnic_front' as const,
          url: docUrl(String(raw.cnicFrontUrl)),
        }
      : null,
    raw.cnicBackUrl
      ? {
          id: 'cnic-back',
          label: 'CNIC Back',
          type: 'cnic_back' as const,
          url: docUrl(String(raw.cnicBackUrl)),
        }
      : null,
    raw.degreeCertificateUrl
      ? {
          id: 'degree',
          label: 'Degree PDF',
          type: 'degree' as const,
          url: docUrl(String(raw.degreeCertificateUrl)),
        }
      : null,
  ].filter(Boolean) as PendingTutor['documents'];

  return {
    id: String(raw._id || raw.id),
    userId: String(user._id || user.id || ''),
    name: String(user.name || 'Unknown Tutor'),
    email: String(user.email || ''),
    phone: user.phoneNumber ? String(user.phoneNumber) : undefined,
    expertise: ((raw.subjects as string[]) || [])[0] || 'General',
    grades: (raw.grades as string[]) || [],
    documents,
    status: mapOnboardingStatus(String(raw.onboardingStatus || '')),
    submittedAt: String(
      raw.documentsSubmittedAt || raw.createdAt || new Date().toISOString()
    ),
    interviewDate: raw.interviewScheduledAt
      ? String(raw.interviewScheduledAt)
      : undefined,
    rejectionReason: raw.rejectionReason
      ? String(raw.rejectionReason)
      : undefined,
  };
};

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
  tutors: PendingTutor[] = []
): AdminDashboardData => ({
  stats: {
    pendingTutors: tutors.filter(t => t.status === 'pending').length,
    escrowBalance: 0,
    linkedParents: 0,
    liveClassrooms: 0,
    approvedTutors: 0,
    totalStudents: 0,
  },
  pendingTutors: tutors,
  aiHealth: {
    summarySpeedMs: 0,
    tokenHealth: 100,
    uptime: 100,
    lastSync: new Date().toISOString(),
    notesGeneratedToday: 0,
    failedSummaries: 0,
    avgTokensPerSummary: 0,
  },
  disputes: [],
  parentLinks: [],
  escrowTransactions: [],
  aiNotes: [] as AiNoteLog[],
  settings: MOCK_SETTINGS,
});

export const fetchDashboardData = async (): Promise<AdminDashboardData> => {
  try {
    const [statsRes, tutorsRes, escrowRes, linksRes] = await Promise.all([
      api.get('/api/admin/dashboard/stats'),
      api.get('/api/admin/tutors/pending', {
        params: { page: 1, limit: 50 },
      }),
      api.get('/api/admin/billing/escrow', {
        params: { page: 1, limit: 20 },
      }),
      api.get('/api/admin/links', { params: { page: 1, limit: 20 } }),
    ]);

    const statsData = statsRes.data?.data || {};
    const tutorsRaw = tutorsRes.data?.data || [];
    const escrowRaw = escrowRes.data?.data || [];
    const linksRaw = linksRes.data?.data || [];

    const pendingTutors: PendingTutor[] = tutorsRaw.map(
      (t: Record<string, unknown>) => mapBackendTutor(t)
    );

    const disputes: EscrowDispute[] = escrowRaw
      .filter((tx: Record<string, unknown>) => tx.escrowStatus === 'disputed')
      .map((tx: Record<string, unknown>) => ({
        id: String(tx.transactionId || tx._id),
        parentName: String(
          (tx.student as Record<string, unknown>)?.name || 'Parent'
        ),
        studentName: String(
          (tx.student as Record<string, unknown>)?.name || 'Student'
        ),
        tutorName: String(
          (tx.tutor as Record<string, unknown>)?.name || 'Tutor'
        ),
        amount: Number(tx.amount || 0),
        reason: String(tx.disputeReason || 'Dispute raised'),
        status:
          tx.escrowStatus === 'disputed' ? 'flagged' : 'refund_pending',
        createdAt: String(tx.createdAt || new Date().toISOString()),
        bookingId: tx.bookingId ? String(tx.bookingId) : undefined,
      }));

    const escrowTransactions: EscrowTransaction[] = escrowRaw.map(
      (tx: Record<string, unknown>) => ({
        id: String(tx._id || tx.transactionId),
        transactionId: String(tx.transactionId || tx._id),
        type:
          tx.type === 'escrow_release'
            ? 'release'
            : tx.type === 'escrow_refund'
              ? 'refund'
              : tx.type === 'escrow_hold'
                ? 'hold'
                : 'deposit',
        amount: Number(tx.amount || 0),
        studentName: String(
          (tx.student as Record<string, unknown>)?.name || 'Student'
        ),
        tutorName: String(
          (tx.tutor as Record<string, unknown>)?.name || 'Tutor'
        ),
        status: (tx.status as EscrowTransaction['status']) || 'completed',
        createdAt: String(tx.createdAt || new Date().toISOString()),
      })
    );

    const parentLinks: ParentStudentLink[] = linksRaw.map(
      (link: Record<string, unknown>) => ({
        id: String(link.linkId || link._id),
        parentName: String(
          (link.parent as Record<string, unknown>)?.name || 'Parent'
        ),
        parentEmail: String(
          (link.parent as Record<string, unknown>)?.email || ''
        ),
        studentName: String(
          (link.student as Record<string, unknown>)?.name || 'Student'
        ),
        studentEmail: String(
          (link.student as Record<string, unknown>)?.email || ''
        ),
        studentGrade: String(
          (link.student as Record<string, unknown>)?.grade || 'N/A'
        ),
        linkedAt: String(link.linkedAt || link.createdAt || ''),
        status: 'active',
      })
    );

    return {
      stats: {
        pendingTutors: pendingTutors.filter(t => t.status === 'pending').length,
        escrowBalance: Number(statsData.totalEscrowBalance || 0),
        linkedParents: parentLinks.length,
        liveClassrooms: 0,
        approvedTutors: Number(statsData.verifiedTutors || 0),
        totalStudents: Number(statsData.totalStudents || 0),
      },
      pendingTutors,
      aiHealth: {
        summarySpeedMs: 0,
        tokenHealth: 100,
        uptime: 100,
        lastSync: new Date().toISOString(),
      },
      disputes,
      parentLinks,
      escrowTransactions,
      settings: MOCK_SETTINGS,
    };
  } catch {
    return getMockDashboardData();
  }
};

export const fetchPendingTutors = async (): Promise<PendingTutor[]> => {
  try {
    const { data } = await api.get('/api/admin/tutors/pending', {
      params: { page: 1, limit: 50 },
    });
    return (data?.data || []).map((t: Record<string, unknown>) =>
      mapBackendTutor(t)
    );
  } catch {
    return [];
  }
};

export const approveTutor = async (
  tutorId: string,
  notes?: string
): Promise<void> => {
  await api.patch(`/api/admin/tutors/${tutorId}/verify`, {
    adminNotes: notes || 'Verified by admin',
  });
};

export const rejectTutor = async (
  tutorId: string,
  reason: string
): Promise<void> => {
  await api.patch(`/api/admin/tutors/${tutorId}/reject`, {
    rejectionReason: reason,
  });
};

export const scheduleTutorInterview = async (
  tutorId: string,
  interviewDate: string,
  notes?: string
): Promise<void> => {
  await api.patch(`/api/admin/tutors/${tutorId}/interview`, {
    interviewScheduledAt: interviewDate,
    adminNotes: notes || 'Interview scheduled by admin',
  });
};

export const resolveDispute = async (
  transactionId: string,
  resolution: 'refund' | 'release'
): Promise<void> => {
  await api.patch(`/api/admin/billing/disputes/${transactionId}/resolve`, {
    action: resolution,
    notes: 'Resolved from admin dashboard',
  });
};

export const revokeParentLink = async (linkId: string): Promise<void> => {
  await api.delete(`/api/admin/links/${linkId}/revoke`);
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
