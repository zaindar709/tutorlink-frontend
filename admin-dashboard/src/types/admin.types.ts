export type TutorVerificationStatus =
  | 'pending'
  | 'interview_scheduled'
  | 'approved'
  | 'rejected';

export interface TutorDocument {
  id: string;
  label: string;
  type: 'cnic_front' | 'cnic_back' | 'degree';
  url?: string;
}

export interface PendingTutor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  expertise: string;
  grades: string[];
  documents: TutorDocument[];
  status: TutorVerificationStatus;
  submittedAt: string;
  approvedAt?: string;
  interviewDate?: string;
  rejectionReason?: string;
}

export interface DashboardStats {
  pendingTutors: number;
  escrowBalance: number;
  linkedParents: number;
  liveClassrooms: number;
  approvedTutors?: number;
  totalStudents?: number;
}

export interface AiHealthMetrics {
  summarySpeedMs: number;
  tokenHealth: number;
  uptime: number;
  lastSync: string;
  notesGeneratedToday?: number;
  failedSummaries?: number;
  avgTokensPerSummary?: number;
}

export interface AiNoteLog {
  id: string;
  sessionId: string;
  tutorName: string;
  studentName: string;
  subject: string;
  tokensUsed: number;
  durationMs: number;
  status: 'completed' | 'failed' | 'processing';
  createdAt: string;
}

export interface EscrowDispute {
  id: string;
  parentName: string;
  studentName: string;
  tutorName: string;
  amount: number;
  reason: string;
  status: 'flagged' | 'refund_pending' | 'resolved';
  createdAt: string;
  bookingId?: string;
}

export interface EscrowTransaction {
  id: string;
  transactionId: string;
  type: 'deposit' | 'release' | 'refund' | 'hold';
  amount: number;
  studentName: string;
  tutorName: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface ParentStudentLink {
  id: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentEmail: string;
  studentGrade: string;
  linkedAt: string;
  status: 'active' | 'pending' | 'revoked';
  linkCode?: string;
}

export interface AdminSettings {
  platformName: string;
  supportEmail: string;
  autoApproveTutors: boolean;
  interviewRequired: boolean;
  escrowHoldDays: number;
  notifyOnNewTutor: boolean;
  notifyOnDispute: boolean;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  pendingTutors: PendingTutor[];
  aiHealth: AiHealthMetrics;
  disputes: EscrowDispute[];
  parentLinks?: ParentStudentLink[];
  escrowTransactions?: EscrowTransaction[];
  aiNotes?: AiNoteLog[];
  settings?: AdminSettings;
}

export type NavSectionId =
  | 'overview'
  | 'verification'
  | 'links'
  | 'escrow'
  | 'ai'
  | 'settings';
