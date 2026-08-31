import {
  appendTranscriptChunksAPI,
  endSessionForSummaryAPI,
  getSessionSummaryAPI,
  getStudentSummariesAPI,
  getSummaryByIdAPI,
  getSummaryStatusAPI,
  getTutorSummariesAPI,
  publishSummaryAPI,
  retrySummaryAPI,
  reviewSummaryAPI,
  setManualTranscriptAPI,
  setTranscriptAudioAPI,
} from '../../api/summaries.api';
import {
  AiClassSummary,
  EndSessionSummaryPayload,
  ReviewSummaryPayload,
  SummaryListParams,
  SummaryListResult,
  SummaryStatus,
  SummaryStatusPayload,
  TranscriptChunk,
} from '../../types/summary.types';
import { AxiosError } from 'axios';

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : null;

const normalizeParticipant = (raw: unknown) => {
  const p = asRecord(raw);
  if (!p) return undefined;
  const id = String(p._id || p.id || '').trim();
  if (!id) return undefined;
  return {
    _id: id,
    name: String(p.name || 'User'),
    avatarUrl: p.avatarUrl ? String(p.avatarUrl) : undefined,
  };
};

export const normalizeSummary = (raw: unknown): AiClassSummary | null => {
  const b = asRecord(raw);
  if (!b) return null;
  const id = String(b._id || b.id || '').trim();
  if (!id) return null;

  const status = String(b.status || 'not_started') as SummaryStatus;
  const topics = Array.isArray(b.topicsCovered) ? b.topicsCovered : [];
  const concepts = Array.isArray(b.importantConcepts) ? b.importantConcepts : [];
  const homework = Array.isArray(b.homework) ? b.homework : [];
  const review = asRecord(b.tutorReview);

  return {
    _id: id,
    sessionId: String(b.sessionId || b.bookingId || ''),
    bookingId: b.bookingId ? String(b.bookingId) : undefined,
    packageId: b.packageId ? String(b.packageId) : undefined,
    subject: String(b.subject || 'Lesson'),
    title: String(b.title || 'Learning summary'),
    overview: String(b.overview || ''),
    topicsCovered: topics.map((t: unknown) => {
      const row = asRecord(t);
      if (!row) return { title: String(t) };
      return {
        title: String(row.title || ''),
        detail: row.detail != null ? String(row.detail) : undefined,
      };
    }),
    keyPoints: Array.isArray(b.keyPoints)
      ? b.keyPoints.map((x: unknown) => String(x))
      : [],
    importantConcepts: concepts.map((c: unknown) => {
      const row = asRecord(c);
      if (!row) return { name: String(c) };
      return {
        name: String(row.name || ''),
        explanation:
          row.explanation != null ? String(row.explanation) : undefined,
      };
    }),
    questionsDiscussed: Array.isArray(b.questionsDiscussed)
      ? b.questionsDiscussed.map((x: unknown) => String(x))
      : [],
    homework: homework.map((h: unknown) => {
      const row = asRecord(h);
      if (!row) return { title: String(h) };
      return {
        title: String(row.title || ''),
        description:
          row.description != null ? String(row.description) : undefined,
        dueHint: row.dueHint != null ? String(row.dueHint) : undefined,
      };
    }),
    studentStrengths: Array.isArray(b.studentStrengths)
      ? b.studentStrengths.map((x: unknown) => String(x))
      : [],
    areasToImprove: Array.isArray(b.areasToImprove)
      ? b.areasToImprove.map((x: unknown) => String(x))
      : [],
    nextSteps: Array.isArray(b.nextSteps)
      ? b.nextSteps.map((x: unknown) => String(x))
      : [],
    status,
    durationMinutes:
      b.durationMinutes != null ? Number(b.durationMinutes) : undefined,
    sessionDate: b.sessionDate ? String(b.sessionDate) : undefined,
    startTime: b.startTime ? String(b.startTime) : undefined,
    endTime: b.endTime ? String(b.endTime) : undefined,
    tutor: normalizeParticipant(b.tutor),
    student: normalizeParticipant(b.student),
    tutorReview: review
      ? {
          reviewed: Boolean(review.reviewed),
          reviewedAt: review.reviewedAt
            ? String(review.reviewedAt)
            : undefined,
          note: review.note != null ? String(review.note) : undefined,
          reviewedByName: review.reviewedByName
            ? String(review.reviewedByName)
            : undefined,
        }
      : undefined,
    publishedAt: b.publishedAt ? String(b.publishedAt) : undefined,
    createdAt: b.createdAt ? String(b.createdAt) : undefined,
    updatedAt: b.updatedAt ? String(b.updatedAt) : undefined,
  };
};

export const getSummaryErrorMessage = (error: unknown): string => {
  if (typeof error === 'string' && error.trim()) return error;

  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; code?: string }
      | undefined;
    const code = data?.code;
    const msg = String(data?.message || '').trim();

    switch (code) {
      case 'UNAUTHORIZED':
        return 'Please sign in again to view summaries.';
      case 'FORBIDDEN':
        return 'You do not have access to this summary.';
      case 'SUMMARY_NOT_FOUND':
        return 'Summary not found for this class.';
      case 'ALREADY_PUBLISHED':
        return 'This summary is already published.';
      case 'VALIDATION_ERROR':
        return msg || 'Please check the summary fields and try again.';
      case 'AI_RATE_LIMIT':
        return 'AI processing is busy. Please try again in a moment.';
      case 'AI_UNAVAILABLE':
        return 'Summary service is temporarily unavailable.';
      case 'STT_UNAVAILABLE':
        return 'Speech-to-text is unavailable. Paste class notes and retry.';
      default:
        break;
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    if (!error.response) {
      return 'Network error. Check your connection and retry.';
    }
    if (msg) return msg;
    if (error.response.status === 500) {
      return 'Server error while loading the summary.';
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
};

const unwrapSummary = (payload: unknown): AiClassSummary => {
  const root = asRecord(payload);
  const data = root?.data ?? payload;
  const normalized = normalizeSummary(data);
  if (!normalized) {
    throw new Error('Summary data is unavailable');
  }
  return normalized;
};

const unwrapList = (payload: unknown): SummaryListResult => {
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root;
  const itemsRaw = Array.isArray(data?.items)
    ? data!.items
    : Array.isArray(data?.data)
      ? (data!.data as unknown[])
      : Array.isArray(payload)
        ? (payload as unknown[])
        : [];
  const items = itemsRaw
    .map(normalizeSummary)
    .filter((x): x is AiClassSummary => Boolean(x));
  const pag = asRecord(data?.pagination) || {};
  return {
    items,
    pagination: {
      page: Number(pag.page || 1),
      limit: Number(pag.limit || 20),
      total: Number(pag.total || items.length),
      hasMore: Boolean(pag.hasMore),
    },
  };
};

export const endSessionForSummary = async (
  sessionId: string,
  data?: EndSessionSummaryPayload
): Promise<SummaryStatusPayload> => {
  try {
    const res = await endSessionForSummaryAPI(sessionId, data);
    const body = asRecord(res.data.data) || {};
    return {
      sessionId: String(body.sessionId || sessionId),
      summaryId: body.summaryId ? String(body.summaryId) : undefined,
      status:
        (String(body.status || 'processing') as SummaryStatus) || 'processing',
    };
  } catch (err) {
    // Idempotent publish conflict — recover via status poll.
    if (err instanceof AxiosError) {
      const code = (err.response?.data as { code?: string } | undefined)?.code;
      if (code === 'ALREADY_PUBLISHED' || err.response?.status === 409) {
        return fetchSummaryStatus(sessionId);
      }
    }
    throw err;
  }
};

export const appendTranscriptChunks = async (
  sessionId: string,
  chunks: TranscriptChunk[]
): Promise<void> => {
  const cleaned = chunks
    .map(c => ({
      text: String(c.text || '').trim(),
      at: c.at,
      speaker: c.speaker,
    }))
    .filter(c => c.text.length > 0);
  if (!cleaned.length) return;
  await appendTranscriptChunksAPI(sessionId, cleaned);
};

export const setTranscriptAudio = async (
  sessionId: string,
  audioUrl: string
): Promise<void> => {
  const url = String(audioUrl || '').trim();
  if (!url) throw new Error('Audio URL is required');
  await setTranscriptAudioAPI(sessionId, url);
};

export const setManualTranscript = async (
  sessionId: string,
  transcriptText: string,
  language?: string
): Promise<void> => {
  const text = String(transcriptText || '').trim();
  if (!text) throw new Error('Paste some class notes before saving.');
  await setManualTranscriptAPI(sessionId, text, language);
};

export const fetchSessionSummary = async (
  sessionId: string
): Promise<AiClassSummary> => {
  const res = await getSessionSummaryAPI(sessionId);
  return unwrapSummary(res.data);
};

export const fetchSummaryStatus = async (
  sessionId: string
): Promise<SummaryStatusPayload> => {
  const res = await getSummaryStatusAPI(sessionId);
  const body = asRecord(res.data.data) || {};
  return {
    sessionId: String(body.sessionId || sessionId),
    summaryId: body.summaryId ? String(body.summaryId) : undefined,
    status: String(body.status || 'not_started') as SummaryStatus,
    updatedAt: body.updatedAt ? String(body.updatedAt) : undefined,
    message: body.message ? String(body.message) : undefined,
  };
};

export const fetchSummaryById = async (
  summaryId: string
): Promise<AiClassSummary> => {
  const res = await getSummaryByIdAPI(summaryId);
  return unwrapSummary(res.data);
};

export const fetchStudentSummaries = async (
  params?: SummaryListParams
): Promise<SummaryListResult> => {
  const res = await getStudentSummariesAPI(params);
  return unwrapList(res.data);
};

export const fetchTutorSummaries = async (
  params?: SummaryListParams
): Promise<SummaryListResult> => {
  const res = await getTutorSummariesAPI(params);
  return unwrapList(res.data);
};

export const reviewSummary = async (
  summaryId: string,
  data: ReviewSummaryPayload
): Promise<AiClassSummary> => {
  const res = await reviewSummaryAPI(summaryId, data);
  return unwrapSummary(res.data);
};

export const publishSummary = async (
  summaryId: string
): Promise<AiClassSummary> => {
  const res = await publishSummaryAPI(summaryId);
  return unwrapSummary(res.data);
};

export const retrySummary = async (
  sessionId: string
): Promise<SummaryStatusPayload> => {
  const res = await retrySummaryAPI(sessionId);
  const body = asRecord(res.data.data) || {};
  return {
    sessionId: String(body.sessionId || sessionId),
    summaryId: body.summaryId ? String(body.summaryId) : undefined,
    status: String(body.status || 'processing') as SummaryStatus,
  };
};

export const statusCopy = (status: SummaryStatus): string => {
  switch (status) {
    case 'processing':
      return 'Generating your learning summary…';
    case 'generated':
      return 'Summary generated and waiting for tutor review.';
    case 'under_review':
      return 'Your tutor is reviewing the summary.';
    case 'published':
      return 'Your reviewed learning summary is ready.';
    case 'failed':
      return "We couldn't generate the summary.";
    default:
      return 'Summary has not started yet.';
  }
};
