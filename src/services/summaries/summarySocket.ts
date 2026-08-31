import { connectChatSocket, getChatSocket } from '../chat/chatSocket';
import { store } from '../../store/store';
import { applySummarySocketEvent } from '../../store/summary/summarySlice';
import { SummarySocketPayload, SummaryStatus } from '../../types/summary.types';
import { upsertNotification } from '../notifications/notificationInboxStore';
import { getUserId } from '../../utils/api/userId';
import { ApiUser } from '../../types/api.types';

type SummaryHandler = (payload: SummarySocketPayload) => void;

const SUMMARY_EVENTS = [
  'summary-processing',
  'summary-generated',
  'summary-under-review',
  'summary-published',
  'summary-failed',
] as const;

let bound = false;
const externalHandlers = new Set<SummaryHandler>();

const normalizePayload = (raw: unknown): SummarySocketPayload | null => {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  const sessionId = String(p.sessionId || '').trim();
  if (!sessionId) return null;
  return {
    sessionId,
    summaryId: p.summaryId ? String(p.summaryId) : undefined,
    status: String(p.status || 'processing') as SummaryStatus,
    title: p.title ? String(p.title) : undefined,
    subject: p.subject ? String(p.subject) : undefined,
    code: p.code ? String(p.code) : undefined,
    message: p.message ? String(p.message) : undefined,
  };
};

const handleEvent = async (raw: unknown) => {
  const payload = normalizePayload(raw);
  if (!payload) return;

  store.dispatch(applySummarySocketEvent(payload));
  externalHandlers.forEach(fn => fn(payload));

  const user = store.getState().auth.user as ApiUser | null;
  const role = store.getState().auth.role;
  const recipientUserId = getUserId(user) || undefined;

  if (payload.status === 'published') {
    void upsertNotification({
      id: `ai-summary-published-${payload.summaryId || payload.sessionId}`,
      title: 'AI Session Summary Ready',
      body: payload.subject
        ? `Your AI summary for ${payload.subject}${
            payload.title ? ` — ${payload.title}` : ''
          } is ready.`
        : 'Your AI summary for your recent session is ready.',
      type: 'ai_summary',
      createdAt: new Date().toISOString(),
      read: false,
      recipientUserId,
      source: 'local',
      data: {
        type: 'ai_summary',
        summaryId: payload.summaryId || '',
        sessionId: payload.sessionId,
        screen: 'StudentSummaryDetailScreen',
      },
    });
  }

  if (payload.status === 'generated' && role === 'tutor') {
    void upsertNotification({
      id: `ai-summary-review-${payload.summaryId || payload.sessionId}`,
      title: 'AI summary ready for review',
      body: payload.subject
        ? `${payload.subject} summary is ready to review.`
        : 'Review and publish the class learning summary.',
      type: 'ai_summary_review',
      createdAt: new Date().toISOString(),
      read: false,
      recipientUserId,
      source: 'local',
      data: {
        type: 'ai_summary_review',
        summaryId: payload.summaryId || '',
        sessionId: payload.sessionId,
        screen: 'TutorSummaryReviewScreen',
      },
    });
  }

  if (payload.status === 'failed' && role === 'tutor') {
    void upsertNotification({
      id: `ai-summary-failed-${payload.summaryId || payload.sessionId}`,
      title: 'AI summary failed',
      body:
        payload.message ||
        'Paste class notes and retry so the student can get a summary.',
      type: 'ai_summary_failed',
      createdAt: new Date().toISOString(),
      read: false,
      recipientUserId,
      source: 'local',
      data: {
        type: 'ai_summary_failed',
        summaryId: payload.summaryId || '',
        sessionId: payload.sessionId,
        screen: 'TutorSummaryReviewScreen',
      },
    });
  }
};

/**
 * Reuses the existing chat Socket.io connection (same host/auth).
 * Does not create a second socket client.
 */
export const ensureSummarySocket = async (
  onEvent?: SummaryHandler
): Promise<void> => {
  if (onEvent) externalHandlers.add(onEvent);

  const socket = (await connectChatSocket({})) || getChatSocket();
  if (!socket) return;

  if (bound) return;
  bound = true;

  SUMMARY_EVENTS.forEach(event => {
    socket.on(event, (payload: unknown) => {
      void handleEvent(payload);
    });
  });
};

export const releaseSummarySocketHandler = (onEvent?: SummaryHandler) => {
  if (onEvent) externalHandlers.delete(onEvent);
};
