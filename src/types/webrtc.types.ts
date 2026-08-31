import type { MediaStream } from 'react-native-webrtc';

export type SessionRole = 'student' | 'tutor';

export type CallState =
  | 'idle'
  | 'requesting_permissions'
  | 'connecting'
  | 'waiting_for_peer'
  | 'peer_joined'
  | 'connected'
  | 'reconnecting'
  | 'ended'
  | 'failed';

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'unknown';

export type SignalingEvent =
  | 'join-classroom'
  | 'leave-classroom'
  | 'classroom-offer'
  | 'classroom-answer'
  | 'classroom-ice-candidate'
  | 'classroom-call-ended'
  | 'joined-classroom'
  | 'classroom-error'
  | 'peer-joined'
  | 'peer-left';

export interface VideoSessionParticipant {
  userId: string;
  name: string;
  role: SessionRole;
  avatarUrl?: string;
  verified?: boolean;
}

export interface VideoSessionParams {
  sessionId: string;
  bookingId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  role: SessionRole;
  peer: VideoSessionParticipant;
  self: VideoSessionParticipant;
  /** Skip lobby and start media + signaling immediately (tutor Start class). */
  autoStart?: boolean;
}

/** Client → server: join-classroom */
export interface JoinClassroomPayload {
  sessionId: string;
}

/** Server → client: joined-classroom */
export interface JoinedClassroomPayload {
  success?: boolean;
  sessionId: string;
  room?: string;
  userId: string;
  role: SessionRole;
  peers: Array<{ userId: string }>;
  message?: string;
}

export interface SignalingOfferPayload {
  sessionId: string;
  sdp: RTCSessionDescriptionInit;
  fromUserId?: string;
}

export interface SignalingAnswerPayload {
  sessionId: string;
  sdp: RTCSessionDescriptionInit;
  fromUserId?: string;
}

export interface SignalingIcePayload {
  sessionId: string;
  candidate: RTCIceCandidateInit | null;
  fromUserId?: string;
}

export interface MediaTogglePayload {
  sessionId: string;
  userId: string;
  enabled: boolean;
}

export interface ScreenSharePayload {
  sessionId: string;
  userId: string;
}

export interface ConnectionQualityPayload {
  sessionId: string;
  userId: string;
  quality: ConnectionQuality;
}

export interface SessionChatPayload {
  sessionId: string;
  userId: string;
  name: string;
  text: string;
  createdAt: string;
}

export interface PeerJoinedPayload {
  sessionId: string;
  userId: string;
  role?: SessionRole;
  name?: string;
  peerCount?: number;
}

export interface CallEndedPayload {
  sessionId: string;
  reason?: string;
  endedBy?: string;
}

export interface SessionErrorPayload {
  success?: false;
  code: string;
  message: string;
  sessionId?: string;
}

/** @deprecated Prefer JoinClassroomPayload — kept for gradual rename */
export type JoinSessionPayload = JoinClassroomPayload & {
  bookingId?: string;
  userId?: string;
  role?: SessionRole;
  name?: string;
};

export interface WebRTCMediaState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  facingMode: 'user' | 'environment';
}

export interface UseWebRTCResult extends WebRTCMediaState {
  callState: CallState;
  connectionQuality: ConnectionQuality;
  error: string | null;
  elapsedSeconds: number;
  chatMessages: SessionChatPayload[];
  peerPresent: boolean;
  join: () => Promise<void>;
  leave: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  switchCamera: () => Promise<void>;
  toggleSpeaker: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  sendChatMessage: (text: string) => void;
}

declare global {
  // Minimal WebRTC description shapes used by signaling payloads.
  interface RTCSessionDescriptionInit {
    type?: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp?: string;
  }

  interface RTCIceCandidateInit {
    candidate?: string | null;
    sdpMLineIndex?: number | null;
    sdpMid?: string | null;
    usernameFragment?: string | null;
  }
}
