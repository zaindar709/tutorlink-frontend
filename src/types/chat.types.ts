export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export type MessageType =
  | 'text'
  | 'image'
  | 'pdf'
  | 'document'
  | 'voice'
  | 'location'
  | 'homework'
  | 'system'
  | 'session';

export type SystemCardKind =
  | 'homework_shared'
  | 'assignment_received'
  | 'session_reminder'
  | 'ai_summary'
  | 'class_recording'
  | 'booking_confirmed';

export type ChatParticipant = {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'tutor';
  isVerified?: boolean;
  subject?: string;
  isOnline?: boolean;
  lastSeen?: string;
};

export type ReplyPreview = {
  id: string;
  senderName: string;
  text: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  type: MessageType;
  text?: string;
  senderId: string;
  isMine: boolean;
  createdAt: string;
  status?: MessageStatus;
  edited?: boolean;
  reaction?: string;
  replyTo?: ReplyPreview;
  mediaUri?: string;
  fileName?: string;
  fileSize?: string;
  durationSec?: number;
  locationLabel?: string;
  systemKind?: SystemCardKind;
  systemTitle?: string;
  systemSubtitle?: string;
};

export type ChatConversation = {
  id: string;
  participant: ChatParticipant;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  pinned?: boolean;
  archived?: boolean;
  isTyping?: boolean;
  lastStatus?: MessageStatus;
  subject: string;
  bookingId?: string;
};

export type CreateConversationPayload = {
  bookingId?: string;
  /** User id of the other party (tutor for student, student for tutor) */
  participantId?: string;
  tutorId?: string;
  /** Tutor profile id (optional alternate id some backends expect) */
  tutorProfileId?: string;
  subject?: string;
  /** Used for local pre-booking fallback when API requires bookingId */
  peerName?: string;
  peerAvatar?: string;
  isVerified?: boolean;
};

export type SendTextMessagePayload = {
  text: string;
  messageType?: MessageType;
  replyTo?: string;
};

export type EditMessagePayload = {
  text: string;
};

export type DeleteMessagePayload = {
  deleteFor: 'me' | 'everyone';
};

export type ReactionPayload = {
  emoji: string;
};

export type ChatMediaMessageType =
  | 'image'
  | 'pdf'
  | 'document'
  | 'voice'
  | 'homework';

export type UploadChatMediaParams = {
  conversationId: string;
  file: {
    uri: string;
    type?: string;
    name?: string;
  };
  messageType: ChatMediaMessageType;
  text?: string;
  replyTo?: string;
  duration?: number;
};
