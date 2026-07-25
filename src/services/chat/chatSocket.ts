import { API_BASE_URL } from '../../config/api';
import { getFirebaseIdToken } from '../auth/firebaseAuthService';
import { getToken } from '../storage';
import { store } from '../../store/store';
import { io, Socket } from 'socket.io-client';

type ChatSocketHandlers = {
  onNewMessage?: (message: unknown) => void;
  onUserTyping?: (payload: { conversationId: string; userId: string }) => void;
  onUserStopTyping?: (payload: {
    conversationId: string;
    userId: string;
  }) => void;
  onMessageStatusUpdated?: (payload: {
    messageId: string;
    status: string;
  }) => void;
  onUserStatus?: (payload: {
    userId: string;
    status: 'online' | 'offline';
  }) => void;
  onOnlineStatus?: (payload: {
    data: Array<{ userId: string; status: string }>;
  }) => void;
};

let socket: Socket | null = null;
let refCount = 0;
const handlerSets = new Set<ChatSocketHandlers>();

const resolveToken = async (): Promise<string | null> => {
  try {
    const firebaseToken = await getFirebaseIdToken(false);
    if (firebaseToken) return firebaseToken;
  } catch {
    // fall through
  }
  const stored = await getToken();
  if (stored) return stored;
  return store.getState().auth.token;
};

const broadcast = <K extends keyof ChatSocketHandlers>(
  key: K,
  payload: Parameters<NonNullable<ChatSocketHandlers[K]>>[0]
) => {
  handlerSets.forEach(handlers => {
    const fn = handlers[key] as ((p: typeof payload) => void) | undefined;
    fn?.(payload);
  });
};

export const connectChatSocket = async (
  handlers: ChatSocketHandlers = {}
): Promise<Socket | null> => {
  handlerSets.add(handlers);
  refCount += 1;

  if (socket?.connected) {
    return socket;
  }

  if (socket && !socket.connected) {
    socket.connect();
    return socket;
  }

  const token = await resolveToken();
  if (!token) {
    console.warn('[ChatSocket] No auth token — skip connect');
    return null;
  }

  socket = io(API_BASE_URL, {
    transports: ['websocket'],
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
  });

  socket.on('connect', () => {
    console.log('[ChatSocket] connected', socket?.id);
  });

  socket.on('connect_error', err => {
    console.warn('[ChatSocket] connect_error', err.message);
  });

  socket.on('new-message', payload => broadcast('onNewMessage', payload));
  socket.on('user-typing', payload => broadcast('onUserTyping', payload));
  socket.on('user-stop-typing', payload =>
    broadcast('onUserStopTyping', payload)
  );
  socket.on('message-status-updated', payload =>
    broadcast('onMessageStatusUpdated', payload)
  );
  socket.on('user-status', payload => broadcast('onUserStatus', payload));
  socket.on('online-status', payload => broadcast('onOnlineStatus', payload));

  return socket;
};

export const releaseChatSocket = (handlers?: ChatSocketHandlers) => {
  if (handlers) handlerSets.delete(handlers);
  refCount = Math.max(0, refCount - 1);
  if (refCount > 0) return;

  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  handlerSets.clear();
};

/** @deprecated Prefer releaseChatSocket for shared usage */
export const disconnectChatSocket = () => {
  refCount = 0;
  handlerSets.clear();
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};

export const getChatSocket = () => socket;

export const joinConversationRoom = (conversationId: string) => {
  socket?.emit('join-conversation', { conversationId });
};

export const leaveConversationRoom = (conversationId: string) => {
  socket?.emit('leave-conversation', { conversationId });
};

export const emitTyping = (conversationId: string) => {
  socket?.emit('typing', { conversationId });
};

export const emitStopTyping = (conversationId: string) => {
  socket?.emit('stop-typing', { conversationId });
};

export const emitMessageDelivered = (
  conversationId: string,
  messageId: string
) => {
  socket?.emit('message-delivered', { conversationId, messageId });
};

export const emitMessageSeen = (conversationId: string, messageId: string) => {
  socket?.emit('message-seen', { conversationId, messageId });
};

export const emitCheckOnlineStatus = (userIds: string[]) => {
  socket?.emit('check-online-status', { userIds });
};
