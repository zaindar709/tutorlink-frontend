import { io, Socket } from 'socket.io-client';
import { SIGNALING_BASE_URL, SIGNALING_PATH } from '../../config/signaling';
import { SIGNALING_EVENTS } from '../../constants/webrtc';
import { getFirebaseIdToken } from '../auth/firebaseAuthService';
import { getToken } from '../storage';
import { store } from '../../store/store';
import type {
  CallEndedPayload,
  ConnectionQualityPayload,
  JoinClassroomPayload,
  JoinedClassroomPayload,
  MediaTogglePayload,
  PeerJoinedPayload,
  ScreenSharePayload,
  SessionChatPayload,
  SessionErrorPayload,
  SignalingAnswerPayload,
  SignalingIcePayload,
  SignalingOfferPayload,
} from '../../types/webrtc.types';

export type ClassroomSocketHandlers = {
  onJoinedClassroom?: (payload: JoinedClassroomPayload) => void;
  onPeerJoined?: (payload: PeerJoinedPayload) => void;
  onPeerLeft?: (payload: { sessionId: string; userId: string }) => void;
  onOffer?: (payload: SignalingOfferPayload) => void;
  onAnswer?: (payload: SignalingAnswerPayload) => void;
  onIceCandidate?: (payload: SignalingIcePayload) => void;
  onCallEnded?: (payload: CallEndedPayload) => void;
  onToggleCamera?: (payload: MediaTogglePayload) => void;
  onToggleMic?: (payload: MediaTogglePayload) => void;
  onScreenShareStarted?: (payload: ScreenSharePayload) => void;
  onScreenShareStopped?: (payload: ScreenSharePayload) => void;
  onConnectionQuality?: (payload: ConnectionQualityPayload) => void;
  onSessionChat?: (payload: SessionChatPayload) => void;
  onClassroomError?: (payload: SessionErrorPayload) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onReconnect?: () => void;
  /** @deprecated use onJoinedClassroom */
  onJoinAck?: (payload: {
    sessionId: string;
    peerCount: number;
    shouldCreateOffer: boolean;
  }) => void;
  /** @deprecated use onClassroomError */
  onSessionError?: (payload: SessionErrorPayload) => void;
};

let socket: Socket | null = null;
let handlers: ClassroomSocketHandlers = {};
let connectWaiters: Array<(s: Socket | null) => void> = [];

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

const flushConnectWaiters = (s: Socket | null) => {
  const waiters = connectWaiters;
  connectWaiters = [];
  waiters.forEach(resolve => resolve(s));
};

const mapJoinedToLegacyAck = (payload: JoinedClassroomPayload) => {
  const peerCount = (payload.peers?.length || 0) + 1;
  const shouldCreateOffer =
    payload.role === 'tutor' && (payload.peers?.length || 0) > 0;
  handlers.onJoinAck?.({
    sessionId: payload.sessionId,
    peerCount,
    shouldCreateOffer,
  });
};

const EVENT_LIST = [
  SIGNALING_EVENTS.JOINED_CLASSROOM,
  SIGNALING_EVENTS.PEER_JOINED,
  SIGNALING_EVENTS.PEER_LEFT,
  SIGNALING_EVENTS.OFFER,
  SIGNALING_EVENTS.ANSWER,
  SIGNALING_EVENTS.ICE_CANDIDATE,
  SIGNALING_EVENTS.CALL_ENDED,
  SIGNALING_EVENTS.CLASSROOM_ERROR,
  SIGNALING_EVENTS.TOGGLE_CAMERA,
  SIGNALING_EVENTS.TOGGLE_MIC,
  SIGNALING_EVENTS.SCREEN_SHARE_STARTED,
  SIGNALING_EVENTS.SCREEN_SHARE_STOPPED,
  SIGNALING_EVENTS.CONNECTION_QUALITY,
  SIGNALING_EVENTS.SESSION_CHAT,
  'connected',
  'connect',
  'disconnect',
  'reconnect',
  'connect_error',
] as const;

const bindCoreListeners = (s: Socket) => {
  EVENT_LIST.forEach(event => s.off(event));

  s.on('connect', () => {
    console.log('[ClassroomSocket] connected', s.id);
    handlers.onConnect?.();
    flushConnectWaiters(s);
  });

  // Backend emits `connected` with { userId, status } after auth (same as chat).
  s.on('connected', (payload: { userId?: string; status?: string }) => {
    console.log('[ClassroomSocket] auth online', payload?.userId);
  });

  s.on('disconnect', (reason: string) => {
    console.warn('[ClassroomSocket] disconnect', reason);
    handlers.onDisconnect?.(reason);
  });

  s.on('reconnect', () => {
    handlers.onReconnect?.();
  });

  s.on(SIGNALING_EVENTS.JOINED_CLASSROOM, (payload: JoinedClassroomPayload) => {
    handlers.onJoinedClassroom?.(payload);
    mapJoinedToLegacyAck(payload);
  });

  s.on(SIGNALING_EVENTS.PEER_JOINED, payload =>
    handlers.onPeerJoined?.(payload)
  );
  s.on(SIGNALING_EVENTS.PEER_LEFT, payload => handlers.onPeerLeft?.(payload));
  s.on(SIGNALING_EVENTS.OFFER, payload => handlers.onOffer?.(payload));
  s.on(SIGNALING_EVENTS.ANSWER, payload => handlers.onAnswer?.(payload));
  s.on(SIGNALING_EVENTS.ICE_CANDIDATE, payload =>
    handlers.onIceCandidate?.(payload)
  );
  s.on(SIGNALING_EVENTS.CALL_ENDED, payload =>
    handlers.onCallEnded?.(payload)
  );
  s.on(SIGNALING_EVENTS.TOGGLE_CAMERA, payload =>
    handlers.onToggleCamera?.(payload)
  );
  s.on(SIGNALING_EVENTS.TOGGLE_MIC, payload =>
    handlers.onToggleMic?.(payload)
  );
  s.on(SIGNALING_EVENTS.SCREEN_SHARE_STARTED, payload =>
    handlers.onScreenShareStarted?.(payload)
  );
  s.on(SIGNALING_EVENTS.SCREEN_SHARE_STOPPED, payload =>
    handlers.onScreenShareStopped?.(payload)
  );
  s.on(SIGNALING_EVENTS.CONNECTION_QUALITY, payload =>
    handlers.onConnectionQuality?.(payload)
  );
  s.on(SIGNALING_EVENTS.SESSION_CHAT, payload =>
    handlers.onSessionChat?.(payload)
  );

  s.on(SIGNALING_EVENTS.CLASSROOM_ERROR, (payload: SessionErrorPayload) => {
    handlers.onClassroomError?.(payload);
    handlers.onSessionError?.(payload);
  });

  s.on('connect_error', err => {
    console.warn('[ClassroomSocket] connect_error', err.message);
    const errorPayload: SessionErrorPayload = {
      code: 'SOCKET_CONNECT_ERROR',
      message: err.message || 'Unable to reach classroom signaling server',
    };
    handlers.onClassroomError?.(errorPayload);
    handlers.onSessionError?.(errorPayload);
    flushConnectWaiters(null);
  });
};

export const connectClassroomSocket = async (
  nextHandlers: ClassroomSocketHandlers = {}
): Promise<Socket | null> => {
  handlers = { ...handlers, ...nextHandlers };

  if (socket?.connected) {
    bindCoreListeners(socket);
    return socket;
  }

  if (socket && !socket.connected) {
    bindCoreListeners(socket);
    const waitPromise = new Promise<Socket | null>(resolve => {
      connectWaiters.push(resolve);
    });
    socket.connect();
    return waitPromise;
  }

  const token = await resolveToken();
  if (!token) {
    const errorPayload: SessionErrorPayload = {
      code: 'AUTH_REQUIRED',
      message: 'Sign in to join the classroom',
    };
    handlers.onClassroomError?.(errorPayload);
    handlers.onSessionError?.(errorPayload);
    return null;
  }

  // Same host + auth style as chat Socket.IO (classroom handlers share that io).
  socket = io(SIGNALING_BASE_URL, {
    path: SIGNALING_PATH,
    transports: ['websocket'],
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    query: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 12,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });

  bindCoreListeners(socket);

  if (socket.connected) return socket;

  return new Promise<Socket | null>(resolve => {
    connectWaiters.push(resolve);
    // Safety timeout so join() does not hang forever
    setTimeout(() => {
      if (!socket?.connected) {
        flushConnectWaiters(null);
      }
    }, 15000);
  });
};

export const setClassroomSocketHandlers = (
  nextHandlers: ClassroomSocketHandlers
) => {
  handlers = { ...handlers, ...nextHandlers };
  if (socket) bindCoreListeners(socket);
};

export const disconnectClassroomSocket = () => {
  if (!socket) return;
  EVENT_LIST.forEach(event => socket?.off(event));
  socket.disconnect();
  socket = null;
  handlers = {};
  flushConnectWaiters(null);
};

export const getClassroomSocket = () => socket;

export const emitJoinClassroom = (
  payload: JoinClassroomPayload,
  ack?: (response: JoinedClassroomPayload | SessionErrorPayload) => void
) => {
  if (!socket) return;
  if (ack) {
    socket.emit(SIGNALING_EVENTS.JOIN_CLASSROOM, payload, ack);
  } else {
    socket.emit(SIGNALING_EVENTS.JOIN_CLASSROOM, payload);
  }
};

/** @deprecated use emitJoinClassroom */
export const emitJoinSession = (
  payload: JoinClassroomPayload & Record<string, unknown>
) => {
  emitJoinClassroom({ sessionId: String(payload.sessionId) });
};

export const emitLeaveClassroom = (payload: JoinClassroomPayload) => {
  socket?.emit(SIGNALING_EVENTS.LEAVE_CLASSROOM, payload);
};

/** @deprecated use emitLeaveClassroom */
export const emitLeaveSession = (payload: {
  sessionId: string;
  userId?: string;
}) => {
  emitLeaveClassroom({ sessionId: payload.sessionId });
};

export const emitOffer = (payload: SignalingOfferPayload) => {
  socket?.emit(SIGNALING_EVENTS.OFFER, {
    sessionId: payload.sessionId,
    sdp: payload.sdp,
  });
};

export const emitAnswer = (payload: SignalingAnswerPayload) => {
  socket?.emit(SIGNALING_EVENTS.ANSWER, {
    sessionId: payload.sessionId,
    sdp: payload.sdp,
  });
};

export const emitIceCandidate = (payload: SignalingIcePayload) => {
  socket?.emit(SIGNALING_EVENTS.ICE_CANDIDATE, {
    sessionId: payload.sessionId,
    candidate: payload.candidate,
  });
};

export const emitCallEnded = (payload: CallEndedPayload) => {
  socket?.emit(SIGNALING_EVENTS.CALL_ENDED, {
    sessionId: payload.sessionId,
  });
};

export const emitToggleCamera = (payload: MediaTogglePayload) => {
  socket?.emit(SIGNALING_EVENTS.TOGGLE_CAMERA, payload);
};

export const emitToggleMic = (payload: MediaTogglePayload) => {
  socket?.emit(SIGNALING_EVENTS.TOGGLE_MIC, payload);
};

export const emitScreenShareStarted = (payload: ScreenSharePayload) => {
  socket?.emit(SIGNALING_EVENTS.SCREEN_SHARE_STARTED, payload);
};

export const emitScreenShareStopped = (payload: ScreenSharePayload) => {
  socket?.emit(SIGNALING_EVENTS.SCREEN_SHARE_STOPPED, payload);
};

export const emitConnectionQuality = (payload: ConnectionQualityPayload) => {
  socket?.emit(SIGNALING_EVENTS.CONNECTION_QUALITY, payload);
};

export const emitSessionChat = (payload: SessionChatPayload) => {
  socket?.emit(SIGNALING_EVENTS.SESSION_CHAT, payload);
};
