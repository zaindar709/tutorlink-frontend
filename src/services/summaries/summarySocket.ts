import { connectChatSocket, getChatSocket } from '../chat/chatSocket';
import { store } from '../../store/store';
import {
  applySummarySocketEvent,
  fetchStudentSummariesThunk,
  fetchSummaryByIdThunk,
  fetchTutorSummariesThunk,
} from '../../store/summary/summarySlice';
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

type SummaryEventName = (typeof SUMMARY_EVENTS)[number];

const EVENT_STATUS: Record<SummaryEventName, SummaryStatus> = {
  'summary-processing': 'processing',
  'summary-generated': 'generated',
  'summary-under-review': 'under_review',
  'summary-published': 'published',
  'summary-failed': 'failed',
};

let boundSocket: ReturnType<typeof getChatSocket> = null;
const externalHandlers = new Set<SummaryHandler>();
const listeners = new Map<SummaryEventName, (raw: unknown) => void>();

const normalizePayload = (
  raw: unknown,
  event: SummaryEventName
): SummarySocketPayload | null => {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  const nested =
    p.data && typeof p.data === 'object'
      ? (p.data as Record<string, unknown>)
      : p;
    const sessionId = String(nested.sessionId || nested.bookingId || '').trim();
  if (!sessionId) return null;
  const rawStatus = String(nested.status || '').trim() as SummaryStatus;
  const status = (
    [
      'not_started',
      'processing',
      'generated',
      'under_review',
      'published',
      'failed',
    ] as SummaryStatus[]
  ).includes(rawStatus)
    ? rawStatus
    : EVENT_STATUS[event];
  return {
    sessionId,
    summaryId: nested.summaryId
      ? String(nested.summaryId)
      : nested._id
        ? String(nested._id)
        : undefined,
    status,
    title: nested.title ? String(nested.title) : undefined,
    subject: nested.subject ? String(nested.subject) : undefined,
    code: nested.code ? String(nested.code) : undefined,
    message: nested.message ? String(nested.message) : undefined,
  };
};

const handleEvent = async (raw: unknown, event: SummaryEventName) => {
  const payload = normalizePayload(raw, event);
  if (!payload) return;

  store.dispatch(applySummarySocketEvent(payload));
  externalHandlers.forEach(fn => fn(payload));

  const user = store.getState().auth.user as ApiUser | null;
  const role = store.getState().auth.role;
  const recipientUserId = getUserId(user) || undefined;

  if (
    payload.summaryId &&
    (role === 'tutor' || payload.status === 'published')
  ) {
    void store.dispatch(fetchSummaryByIdThunk(payload.summaryId));
  }

  if (payload.status === 'published') {
    void store.dispatch(
      fetchStudentSummariesThunk({ page: 1, limit: 30, status: 'published' })
    );
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

  if (payload.status === 'generated' || payload.status === 'under_review') {
    void store.dispatch(fetchTutorSummariesThunk({ page: 1, limit: 40 }));
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

const attachListeners = (socket: NonNullable<ReturnType<typeof getChatSocket>>) => {
  SUMMARY_EVENTS.forEach(event => {
    let listener = listeners.get(event);
    if (!listener) {
      listener = (raw: unknown) => {
        void handleEvent(raw, event);
      };
      listeners.set(event, listener);
    }
    socket.off(event, listener);
    socket.on(event, listener);
  });
  boundSocket = socket;
};

/**
 * Reuses the existing chat Socket.io connection (same host/auth).
 * Does not create a second socket client.
 */
export const ensureSummarySocket = async (
  onEvent?: SummaryHandler
): Promise<void> => {
  if (onEvent) externalHandlers.add(onEvent);

  let socket = getChatSocket();
  if (!socket) {
    socket = (await connectChatSocket({})) || getChatSocket();
  }
  if (!socket) return;

  attachListeners(socket);
};

export const releaseSummarySocketHandler = (onEvent?: SummaryHandler) => {
  if (onEvent) externalHandlers.delete(onEvent);
};
