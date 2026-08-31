import { ApiUser } from './api.types';

/** Canonical summary lifecycle — matches backend contract. */
export type SummaryStatus =
  | 'not_started'
  | 'processing'
  | 'generated'
  | 'under_review'
  | 'published'
  | 'failed';

export interface SummaryTopic {
  title: string;
  detail?: string;
}

export interface SummaryConcept {
  name: string;
  explanation?: string;
}

export interface SummaryHomework {
  title: string;
  description?: string;
  dueHint?: string;
}

export interface TutorReviewPublic {
  reviewed: boolean;
  reviewedAt?: string;
  note?: string;
  reviewedByName?: string;
}

export interface SummaryParticipant {
  _id: string;
  name: string;
  avatarUrl?: string;
}

export interface AiClassSummary {
  _id: string;
  sessionId: string;
  bookingId?: string;
  packageId?: string;
  subject: string;
  title: string;
  overview: string;
  topicsCovered: SummaryTopic[];
  keyPoints: string[];
  importantConcepts: SummaryConcept[];
  questionsDiscussed: string[];
  homework: SummaryHomework[];
  studentStrengths: string[];
  areasToImprove: string[];
  nextSteps: string[];
  status: SummaryStatus;
  durationMinutes?: number;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  tutor?: SummaryParticipant;
  student?: SummaryParticipant;
  tutorReview?: TutorReviewPublic;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SummaryStatusPayload {
  sessionId: string;
  summaryId?: string;
  status: SummaryStatus;
  updatedAt?: string;
  message?: string;
}

export interface SummaryListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface SummaryPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface SummaryListResult {
  items: AiClassSummary[];
  pagination: SummaryPagination;
}

/** Tutor editable payload — immutable ids excluded. */
export interface ReviewSummaryPayload {
  title?: string;
  overview?: string;
  topicsCovered?: SummaryTopic[];
  keyPoints?: string[];
  importantConcepts?: SummaryConcept[];
  questionsDiscussed?: string[];
  homework?: SummaryHomework[];
  studentStrengths?: string[];
  areasToImprove?: string[];
  nextSteps?: string[];
  tutorNote?: string;
  privateNotes?: string;
}

export interface TranscriptChunk {
  text: string;
  at?: string;
  speaker?: string;
}

export interface EndSessionSummaryPayload {
  reason?: string;
  endedBy?: 'tutor' | 'student';
  /** Live caption chunks collected during class (preferred FYP path without STT). */
  chunks?: TranscriptChunk[];
  /** Remote audio URL for backend STT (optional). */
  audioUrl?: string;
  /** Tutor-pasted transcript text at end time (optional). */
  transcriptText?: string;
}

export type SummarySocketEvent =
  | 'summary-processing'
  | 'summary-generated'
  | 'summary-under-review'
  | 'summary-published'
  | 'summary-failed';

export interface SummarySocketPayload {
  sessionId: string;
  summaryId?: string;
  status: SummaryStatus;
  title?: string;
  subject?: string;
  code?: string;
  message?: string;
}

/** Map legacy dashboard card → list-friendly shape when needed. */
export type DashboardSummaryBridge = {
  _id: string;
  title: string;
  subject: string;
  excerpt: string;
  createdAt: string;
};

export type SummaryRoleViewer = 'student' | 'tutor' | 'parent';

export type { ApiUser };
