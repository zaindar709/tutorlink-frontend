/** TutorLink classroom / WebRTC configuration */

export const CLASSROOM_BRAND = {
  primary: '#0066FF',
  primaryDeep: '#0052CC',
  primarySoft: 'rgba(0, 102, 255, 0.12)',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  glass: 'rgba(15, 23, 42, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  overlay: 'rgba(8, 15, 35, 0.72)',
} as const;

export const WEBRTC_CONSTRAINTS = {
  audio: true,
  video: {
    facingMode: 'user' as const,
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
};

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // Add TURN later, e.g.:
  // { urls: 'turn:turn.tutorlink.app:3478', username: '...', credential: '...' },
];

/**
 * Canonical Socket.IO event names from TutorLink backend classroom signaling.
 * Media stays P2P — server only relays join/presence/SDP/ICE.
 */
export const SIGNALING_EVENTS = {
  JOIN_CLASSROOM: 'join-classroom',
  LEAVE_CLASSROOM: 'leave-classroom',
  OFFER: 'classroom-offer',
  ANSWER: 'classroom-answer',
  ICE_CANDIDATE: 'classroom-ice-candidate',
  CALL_ENDED: 'classroom-call-ended',
  JOINED_CLASSROOM: 'joined-classroom',
  CLASSROOM_ERROR: 'classroom-error',
  PEER_JOINED: 'peer-joined',
  PEER_LEFT: 'peer-left',
  // Optional client-side extras (ignored by BE if not mounted)
  TOGGLE_CAMERA: 'toggle-camera',
  TOGGLE_MIC: 'toggle-mic',
  SCREEN_SHARE_STARTED: 'screen-share-started',
  SCREEN_SHARE_STOPPED: 'screen-share-stopped',
  CONNECTION_QUALITY: 'connection-quality',
  SESSION_CHAT: 'session-chat',
} as const;

export const CLASSROOM_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Invalid classroom session details.',
  SESSION_NOT_FOUND: 'This booking was not found.',
  SESSION_NOT_ACCEPTED: 'Accept the booking before starting class.',
  SESSION_FORBIDDEN: 'You are not allowed to join this classroom.',
  ROOM_FULL: 'This classroom already has two participants.',
  INTERNAL_ERROR: 'Classroom signaling error. Please try again.',
  AUTH_REQUIRED: 'Sign in to join the classroom.',
  SOCKET_CONNECT_ERROR: 'Unable to reach classroom signaling server.',
};

export const CALL_STATE_LABELS: Record<string, string> = {
  idle: 'Ready',
  requesting_permissions: 'Requesting access…',
  connecting: 'Connecting…',
  waiting_for_peer: 'Waiting for peer…',
  peer_joined: 'Peer joined',
  connected: 'Connected',
  reconnecting: 'Reconnecting…',
  ended: 'Call ended',
  failed: 'Connection failed',
};

export const QUALITY_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  poor: 'Poor',
  unknown: 'Checking…',
} as const;

interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}
