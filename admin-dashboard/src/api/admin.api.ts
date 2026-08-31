import axios from 'axios';
import type {
  AdminDashboardData,
  AdminSettings,
  AiNoteLog,
  EscrowDispute,
  EscrowTransaction,
  ParentStudentLink,
  PendingTutor,
  TutorRatingDecision,
  TutorRatingRow,
  TutorReviewItem,
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
  const normalized = (status || '').toLowerCase();
  if (normalized === 'interview_scheduled') return 'interview_scheduled';
  if (normalized === 'approved') return 'approved';
  if (normalized === 'rejected') return 'rejected';
  if (
    normalized === 'pending' ||
    normalized === 'under_review' ||
    normalized === 'documents_uploaded' ||
    normalized === 'basic_info'
  ) {
    return 'pending';
  }
  return 'pending';
};

const extractTutorList = (payload: unknown): Record<string, unknown>[] => {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;

  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.tutors)) {
      return nested.tutors as Record<string, unknown>[];
    }
    if (Array.isArray(nested.items)) {
      return nested.items as Record<string, unknown>[];
    }
  }
  if (Array.isArray(root.tutors)) return root.tutors as Record<string, unknown>[];
  return [];
};

export const mapBackendTutor = (raw: Record<string, unknown>): PendingTutor => {
  if (raw.name && raw.email && Array.isArray(raw.documents)) {
    return {
      id: String(raw.id || raw._id),
      userId: String(raw.userId || ''),
      name: String(raw.name),
      email: String(raw.email),
      phone: raw.phone ? String(raw.phone) : undefined,
      expertise: String(raw.expertise || 'General'),
      grades: (raw.grades as string[]) || [],
      documents: raw.documents as PendingTutor['documents'],
      status: mapOnboardingStatus(
        String(raw.status || raw.onboardingStatus || raw.verificationStatus || '')
      ),
      submittedAt: String(
        raw.submittedAt || raw.documentsSubmittedAt || new Date().toISOString()
      ),
      approvedAt: raw.verifiedAt
        ? String(raw.verifiedAt)
        : raw.approvedAt
          ? String(raw.approvedAt)
          : undefined,
      interviewDate: raw.interviewDate
        ? String(raw.interviewDate)
        : raw.interviewScheduledAt
          ? String(raw.interviewScheduledAt)
          : undefined,
      rejectionReason: raw.rejectionReason
        ? String(raw.rejectionReason)
        : undefined,
    };
  }

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
    status: mapOnboardingStatus(
      String(raw.onboardingStatus || raw.verificationStatus || raw.status || '')
    ),
    submittedAt: String(
      raw.documentsSubmittedAt || raw.createdAt || new Date().toISOString()
    ),
    approvedAt: raw.verifiedAt ? String(raw.verifiedAt) : undefined,
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
  tutorRatings: [],
  settings: MOCK_SETTINGS,
});

export const mergeTutorLists = (
  pending: PendingTutor[],
  approved: PendingTutor[]
): PendingTutor[] => {
  const byId = new Map<string, PendingTutor>();
  for (const tutor of [...pending, ...approved]) {
    byId.set(tutor.id, tutor);
  }
  return Array.from(byId.values());
};

export const fetchApprovedTutors = async (): Promise<PendingTutor[]> => {
  const endpoints = [
    '/api/admin/tutors/approved',
    '/api/admin/tutors/verified',
  ];

  for (const path of endpoints) {
    try {
      const { data } = await api.get(path, {
        params: { page: 1, limit: 50 },
      });
      return extractTutorList(data).map((t: Record<string, unknown>) => ({
        ...mapBackendTutor(t),
        status: 'approved' as const,
      }));
    } catch {
      // Try next endpoint
    }
  }

  try {
    const { data } = await api.get('/api/admin/tutors/pending', {
      params: { page: 1, limit: 50, status: 'approved' },
    });
    return extractTutorList(data).map((t: Record<string, unknown>) => ({
      ...mapBackendTutor(t),
      status: 'approved' as const,
    }));
  } catch {
    return [];
  }
};

export const fetchDashboardData = async (): Promise<AdminDashboardData> => {
  const [statsRes, tutorsRes, approvedRes, escrowRes, linksRes] =
    await Promise.allSettled([
    api.get('/api/admin/dashboard/stats'),
    api.get('/api/admin/tutors/pending', {
      params: { page: 1, limit: 50 },
    }),
    fetchApprovedTutors(),
    api.get('/api/admin/billing/escrow', {
      params: { page: 1, limit: 20 },
    }),
    api.get('/api/admin/links', { params: { page: 1, limit: 20 } }),
  ]);

  if (tutorsRes.status === 'rejected') {
    const reason = tutorsRes.reason as { response?: { status?: number; data?: { message?: string } }; message?: string };
    const status = reason?.response?.status;
    const message =
      reason?.response?.data?.message ||
      reason?.message ||
      'Failed to load pending tutors';
    throw new Error(
      status === 401 || status === 403
        ? `${message} — sign in with an admin Firebase account (role: admin).`
        : message
    );
  }

  const statsData =
    statsRes.status === 'fulfilled' ? statsRes.value.data?.data || {} : {};
  const tutorsRaw = extractTutorList(tutorsRes.value.data);
  const approvedFromApi =
    approvedRes.status === 'fulfilled' ? approvedRes.value : [];
  const escrowRaw =
    escrowRes.status === 'fulfilled'
      ? ((escrowRes.value.data?.data as Record<string, unknown>[]) || [])
      : [];
  const linksRaw =
    linksRes.status === 'fulfilled'
      ? ((linksRes.value.data?.data as Record<string, unknown>[]) || [])
      : [];

    const pendingTutors: PendingTutor[] = mergeTutorLists(
      tutorsRaw.map((t: Record<string, unknown>) => mapBackendTutor(t)),
      approvedFromApi
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

    const tutorRatings = await fetchTutorRatings(pendingTutors);

    return {
      stats: {
        pendingTutors: pendingTutors.filter(t => t.status === 'pending').length,
        escrowBalance: Number(statsData.totalEscrowBalance || 0),
        linkedParents: parentLinks.length,
        liveClassrooms: 0,
        approvedTutors: Math.max(
          Number(statsData.verifiedTutors || 0),
          pendingTutors.filter(t => t.status === 'approved').length
        ),
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
      tutorRatings,
      settings: MOCK_SETTINGS,
    };
};

export const fetchPendingTutors = async (): Promise<PendingTutor[]> => {
  const { data } = await api.get('/api/admin/tutors/pending', {
    params: { page: 1, limit: 50 },
  });
  return extractTutorList(data).map((t: Record<string, unknown>) =>
    mapBackendTutor(t)
  );
};

export const approveTutor = async (
  tutorId: string,
  notes?: string
): Promise<void> => {
  await api.patch(`/api/admin/tutors/${tutorId}/verify`, {
    isVerified: true,
    verificationStatus: 'approved',
    adminNotes: notes || 'Verified by admin',
  });
};

export const rejectTutor = async (
  tutorId: string,
  reason: string
): Promise<void> => {
  await api.patch(`/api/admin/tutors/${tutorId}/reject`, {
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

const RATING_DECISIONS_KEY = 'tl-admin-tutor-rating-decisions';
const LIVE_RATINGS_CACHE_KEY = 'tl-admin-live-tutor-ratings';

export type LiveTutorRatingEntry = {
  id: string;
  bookingId: string;
  tutorId: string;
  tutorName: string;
  studentId?: string;
  studentName?: string;
  subject?: string;
  rating: number;
  liked: boolean;
  review?: string;
  ratedAt: string;
};

const readRatingDecisions = (): Record<string, TutorRatingDecision> => {
  try {
    const raw = localStorage.getItem(RATING_DECISIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, TutorRatingDecision>;
  } catch {
    return {};
  }
};

export const saveRatingDecision = (
  tutorId: string,
  decision: TutorRatingDecision
) => {
  const next = { ...readRatingDecisions(), [tutorId]: decision };
  try {
    localStorage.setItem(RATING_DECISIONS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
};

const cacheLiveRatings = (entries: LiveTutorRatingEntry[]) => {
  try {
    localStorage.setItem(LIVE_RATINGS_CACHE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
};

const readCachedLiveRatings = (): LiveTutorRatingEntry[] => {
  try {
    const raw = localStorage.getItem(LIVE_RATINGS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LiveTutorRatingEntry[]) : [];
  } catch {
    return [];
  }
};

/** Fetch ratings posted by the student app (Vite /api/live-ratings). */
export const fetchLiveStudentRatings = async (): Promise<
  LiveTutorRatingEntry[]
> => {
  const endpoints = ['/api/live-ratings', '/live-ratings.json'];
  for (const path of endpoints) {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length >= 0) {
        const entries = data as LiveTutorRatingEntry[];
        cacheLiveRatings(entries);
        return entries;
      }
    } catch {
      // try next
    }
  }
  return readCachedLiveRatings();
};

const groupLiveRatings = (
  entries: LiveTutorRatingEntry[],
  tutors: PendingTutor[]
): TutorRatingRow[] => {
  const decisions = readRatingDecisions();
  const byKey = new Map<string, LiveTutorRatingEntry[]>();

  for (const entry of entries) {
    const key =
      String(entry.tutorId || '').trim() ||
      String(entry.tutorName || '')
        .trim()
        .toLowerCase() ||
      'unknown';
    const list = byKey.get(key) || [];
    list.push(entry);
    byKey.set(key, list);
  }

  const rows: TutorRatingRow[] = [];
  for (const [key, reviews] of byKey.entries()) {
    const sorted = [...reviews].sort(
      (a, b) =>
        new Date(b.ratedAt).getTime() - new Date(a.ratedAt).getTime()
    );
    const first = sorted[0];
    const tutor =
      tutors.find(t => t.id === first.tutorId || t.userId === first.tutorId) ||
      tutors.find(
        t =>
          t.name.trim().toLowerCase() ===
          String(first.tutorName || '')
            .trim()
            .toLowerCase()
      );

    const reviewCount = sorted.length;
    const likeCount = sorted.filter(r => r.liked).length;
    const avgRating =
      Math.round(
        (sorted.reduce((a, r) => a + Number(r.rating || 0), 0) / reviewCount) *
          10
      ) / 10;

    const tutorId = tutor?.id || first.tutorId || key;
    rows.push({
      tutorId,
      tutorName: first.tutorName || tutor?.name || 'Tutor',
      email: tutor?.email || '—',
      expertise: tutor?.expertise || first.subject || 'General',
      avgRating,
      reviewCount,
      likeCount,
      decision:
        decisions[tutorId] || (avgRating < 3.5 ? 'flagged' : 'active'),
      recentReviews: sorted.map(r => ({
        id: r.id || `${r.bookingId}-${r.ratedAt}`,
        studentName: r.studentName || 'Student',
        subject: r.subject || 'Session',
        rating: Number(r.rating) || 0,
        liked: Boolean(r.liked),
        review: r.review,
        ratedAt: r.ratedAt || new Date().toISOString(),
      })),
    });
  }

  return rows.sort((a, b) => b.reviewCount - a.reviewCount);
};

const demoReviewsFor = (
  _tutor: PendingTutor,
  _index: number
): TutorReviewItem[] => [];

/** Prefer live student ratings from the app; otherwise API rows. */
export const buildTutorRatingRows = (
  tutors: PendingTutor[],
  apiRows?: TutorRatingRow[],
  liveEntries?: LiveTutorRatingEntry[]
): TutorRatingRow[] => {
  const decisions = readRatingDecisions();

  if (liveEntries && liveEntries.length > 0) {
    return groupLiveRatings(liveEntries, tutors);
  }

  if (apiRows && apiRows.length > 0) {
    return apiRows.map(row => ({
      ...row,
      decision: decisions[row.tutorId] || row.decision || 'active',
    }));
  }

  // No live ratings yet — empty list (panel should show real student ratings only).
  return [];
};

export const fetchTutorRatings = async (
  tutors: PendingTutor[] = []
): Promise<TutorRatingRow[]> => {
  const live = await fetchLiveStudentRatings();
  if (live.length > 0) {
    return buildTutorRatingRows(tutors, undefined, live);
  }

  try {
    const { data } = await api.get('/api/admin/tutors/ratings', {
      params: { page: 1, limit: 50 },
    });
    const raw =
      (data?.data as TutorRatingRow[]) ||
      (Array.isArray(data) ? (data as TutorRatingRow[]) : []);
    if (!Array.isArray(raw) || raw.length === 0) {
      return buildTutorRatingRows(tutors, undefined, live);
    }
    return buildTutorRatingRows(tutors, raw, live);
  } catch {
    return buildTutorRatingRows(tutors, undefined, live);
  }
};
