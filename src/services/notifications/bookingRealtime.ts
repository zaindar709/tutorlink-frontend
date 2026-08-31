import { connectChatSocket, releaseChatSocket, getChatSocket } from '../chat/chatSocket';
import { syncServerNotifications } from './notificationSyncService';
import { store } from '../../store/store';
import { fetchBookingByIdThunk } from '../../store/booking/bookingSlice';
import { invalidateStudentTutorRelationsCache } from '../../hooks/api/useStudentTutorRelations';
import { getUserId } from '../../utils/api/userId';

export type BookingUpdatedPayload = {
  bookingId?: string;
  type?: string;
  screen?: string;
  notificationId?: string;
  userId?: string;
  booking?: unknown;
};

type BookingUpdatedHandler = (payload: BookingUpdatedPayload) => void;

const handlers = new Set<BookingUpdatedHandler>();
let socketHandlers: Parameters<typeof connectChatSocket>[0] | null = null;
let started = false;

const onBookingUpdated = (payload: BookingUpdatedPayload) => {
  console.log('[BookingRealtime] booking-updated', payload);
  handlers.forEach(fn => {
    try {
      fn(payload);
    } catch (error) {
      console.warn('[BookingRealtime] handler error', error);
    }
  });

  const bookingId = payload?.bookingId
    ? String(payload.bookingId)
    : undefined;
  const userId = getUserId(store.getState().auth.user as any);

  void syncServerNotifications(userId);
  invalidateStudentTutorRelationsCache();

  if (bookingId) {
    void store.dispatch(fetchBookingByIdThunk({ id: bookingId, force: true }));
  }
};

const bindBookingUpdated = () => {
  const socket = getChatSocket();
  if (!socket) return;
  socket.off('booking-updated', onBookingUpdated);
  socket.on('booking-updated', onBookingUpdated);
};

/**
 * Keep a shared socket connection so booking-updated events refresh inbox/lists
 * without aggressive polling (same auth as chat).
 */
export const startBookingRealtime = async (): Promise<void> => {
  if (!socketHandlers) {
    socketHandlers = {};
  }

  if (!started) {
    const socket = await connectChatSocket(socketHandlers);
    if (!socket) return;
    started = true;
    socket.on('connect', bindBookingUpdated);
  } else if (!getChatSocket()) {
    started = false;
    const socket = await connectChatSocket(socketHandlers);
    if (!socket) return;
    started = true;
    socket.on('connect', bindBookingUpdated);
  }

  bindBookingUpdated();
};

export const stopBookingRealtime = (): void => {
  const socket = getChatSocket();
  if (socket) {
    socket.off('booking-updated', onBookingUpdated);
    socket.off('connect', bindBookingUpdated);
  }
  if (socketHandlers && started) {
    releaseChatSocket(socketHandlers);
  }
  socketHandlers = null;
  started = false;
};

export const subscribeBookingUpdated = (
  handler: BookingUpdatedHandler
): (() => void) => {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
};
