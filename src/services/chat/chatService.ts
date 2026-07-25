import {
  createConversationAPI,
  deleteMessageAPI,
  editMessageAPI,
  listConversationsAPI,
  listMessagesAPI,
  reactToMessageAPI,
  sendMediaMessageAPI,
  sendTextMessageAPI,
} from '../../api/chat.api';
import {
  ChatConversation,
  CreateConversationPayload,
  ChatMessage,
  ChatParticipant,
  MessageStatus,
  MessageType,
  UploadChatMediaParams,
} from '../../types/chat.types';
import { getUserId } from '../../utils/api/userId';
import { ApiUser } from '../../types/api.types';
import { AxiosError } from 'axios';
import { getApiErrorMessage } from '../../utils/api/errorHandler';
import {
  appendInquiryMessage,
  deleteInquiryMessage,
  getOrCreateInquiryConversation,
  isInquiryConversationId,
  listInquiryConversations,
  listInquiryMessages,
  updateInquiryMessage,
} from './localInquiryChat';

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const extractData = (payload: unknown): unknown => {
  const root = asRecord(payload);
  if ('data' in root) return root.data;
  return payload;
};

const extractList = (payload: unknown): Record<string, unknown>[] => {
  const data = extractData(payload);
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  const nested = asRecord(data);
  if (Array.isArray(nested.conversations)) {
    return nested.conversations as Record<string, unknown>[];
  }
  if (Array.isArray(nested.messages)) {
    return nested.messages as Record<string, unknown>[];
  }
  if (Array.isArray(nested.items)) {
    return nested.items as Record<string, unknown>[];
  }
  return [];
};

const pickId = (raw: Record<string, unknown>): string =>
  String(raw._id || raw.id || '');

const pickUser = (raw: unknown): Record<string, unknown> => asRecord(raw);

const mapParticipant = (
  raw: Record<string, unknown>,
  fallbackRole: 'student' | 'tutor' = 'tutor'
): ChatParticipant => {
  const user = pickUser(raw.user || raw.participant || raw);
  return {
    id: String(user._id || user.id || raw._id || raw.id || ''),
    name: String(user.name || user.fullName || 'User'),
    avatar: String(
      user.avatarUrl || user.avatar || 'https://i.pravatar.cc/150?u=chat'
    ),
    role: (user.role as 'student' | 'tutor') || fallbackRole,
    isVerified: Boolean(user.isVerified),
    subject: raw.subject ? String(raw.subject) : undefined,
    isOnline: Boolean(user.isOnline ?? raw.isOnline),
    lastSeen: user.lastSeen
      ? String(user.lastSeen)
      : raw.lastSeen
        ? String(raw.lastSeen)
        : undefined,
  };
};

const mapLastMessageText = (raw: Record<string, unknown>): string => {
  if (typeof raw.lastMessage === 'string') return raw.lastMessage;
  const last = asRecord(raw.lastMessage);
  if (last.text) return String(last.text);
  if (last.messageType && last.messageType !== 'text') {
    return String(last.messageType);
  }
  return '';
};

export const mapConversation = (
  rawInput: unknown,
  currentUserId?: string | null
): ChatConversation | null => {
  const raw = asRecord(rawInput);
  const id = pickId(raw);
  if (!id) return null;

  const participants = Array.isArray(raw.participants)
    ? (raw.participants as Record<string, unknown>[])
    : [];

  let other: Record<string, unknown> | null = null;
  if (raw.otherParticipant) {
    other = asRecord(raw.otherParticipant);
  } else if (raw.participant) {
    other = asRecord(raw.participant);
  } else if (participants.length > 0 && currentUserId) {
    other =
      participants.find(p => {
        const row = asRecord(p);
        const nestedUser = asRecord(row.user);
        const uid = String(row._id || row.id || nestedUser._id || nestedUser.id || '');
        return uid && uid !== currentUserId;
      }) || participants[0];
  } else if (participants[0]) {
    other = participants[0];
  }

  const participant = mapParticipant(other || {});
  const lastAt =
    raw.lastMessageAt ||
    asRecord(raw.lastMessage).createdAt ||
    raw.updatedAt ||
    new Date().toISOString();

  return {
    id,
    participant,
    lastMessage: mapLastMessageText(raw),
    lastMessageAt: String(lastAt),
    unreadCount: Number(raw.unreadCount ?? 0),
    pinned: Boolean(raw.pinned),
    archived: Boolean(raw.archived),
    isTyping: Boolean(raw.isTyping),
    lastStatus: (asRecord(raw.lastMessage).status as MessageStatus) || undefined,
    subject: String(
      raw.subject || participant.subject || raw.bookingSubject || 'General'
    ),
    bookingId: raw.bookingId ? String(raw.bookingId) : undefined,
  };
};

export const mapMessage = (
  rawInput: unknown,
  currentUserId?: string | null,
  conversationId?: string
): ChatMessage | null => {
  const raw = asRecord(rawInput);
  const id = pickId(raw);
  if (!id) return null;

  const sender = asRecord(raw.sender || raw.senderId);
  const senderId = String(
    sender._id || sender.id || raw.senderId || raw.sender || ''
  );
  const isMine =
    typeof raw.isMine === 'boolean'
      ? raw.isMine
      : Boolean(currentUserId && senderId && senderId === currentUserId);

  const replyRaw = asRecord(raw.replyTo);
  const hasReply =
    Boolean(pickId(replyRaw)) ||
    Boolean(replyRaw.text) ||
    typeof raw.replyTo === 'string';
  const replyTo = hasReply
    ? {
        id: pickId(replyRaw) || String(raw.replyTo || ''),
        senderName: String(
          asRecord(replyRaw.sender).name || replyRaw.senderName || 'User'
        ),
        text: String(replyRaw.text || ''),
      }
    : undefined;

  const reaction =
    typeof raw.reaction === 'string'
      ? raw.reaction
      : Array.isArray(raw.reactions) && raw.reactions.length > 0
        ? String(
            asRecord(raw.reactions[0]).emoji ||
              asRecord(raw.reactions[0]).reaction ||
              ''
          ) || undefined
        : undefined;

  return {
    id,
    chatId: String(
      raw.conversationId || conversationId || raw.chatId || ''
    ),
    type: (raw.messageType || raw.type || 'text') as MessageType,
    text: raw.text != null ? String(raw.text) : undefined,
    senderId: senderId || (isMine ? 'me' : 'other'),
    isMine,
    createdAt: String(raw.createdAt || new Date().toISOString()),
    status: (raw.status as MessageStatus) || (isMine ? 'sent' : undefined),
    edited: Boolean(raw.edited || raw.isEdited),
    reaction,
    replyTo,
    mediaUri: raw.mediaUrl
      ? String(raw.mediaUrl)
      : raw.fileUrl
        ? String(raw.fileUrl)
        : raw.mediaUri
          ? String(raw.mediaUri)
          : undefined,
    fileName: raw.fileName ? String(raw.fileName) : undefined,
    fileSize: raw.fileSize ? String(raw.fileSize) : undefined,
    durationSec:
      raw.duration != null
        ? Number(raw.duration)
        : raw.durationSec != null
          ? Number(raw.durationSec)
          : undefined,
    systemKind: raw.systemKind as ChatMessage['systemKind'],
    systemTitle: raw.systemTitle ? String(raw.systemTitle) : undefined,
    systemSubtitle: raw.systemSubtitle
      ? String(raw.systemSubtitle)
      : undefined,
  };
};

const isBookingRequiredError = (error: unknown) => {
  const status =
    error instanceof AxiosError ? error.response?.status : undefined;
  const message = getApiErrorMessage(error, '').toLowerCase();
  return (
    status === 400 &&
    (/booking/i.test(message) ||
      /participant/i.test(message) ||
      /required/i.test(message) ||
      /invalid/i.test(message))
  );
};

const createLocalInquiry = async (payload: CreateConversationPayload) => {
  const participantId = String(
    payload.participantId || payload.tutorId || ''
  );
  if (!participantId) {
    throw new Error('participantId is required for pre-booking chat.');
  }

  return getOrCreateInquiryConversation({
    participantId,
    subject: payload.subject,
    participant: {
      id: participantId,
      name: payload.peerName || 'Tutor',
      avatar:
        payload.peerAvatar ||
        `https://i.pravatar.cc/150?u=${encodeURIComponent(participantId)}`,
      role: 'tutor',
      isVerified: payload.isVerified,
      subject: payload.subject,
    },
  });
};

export const listConversations = async (
  currentUser?: ApiUser | null
): Promise<ChatConversation[]> => {
  const me = getUserId(currentUser);
  let remote: ChatConversation[] = [];

  try {
    const response = await listConversationsAPI();
    remote = extractList(response.data)
      .map(item => mapConversation(item, me))
      .filter((item): item is ChatConversation => Boolean(item));
  } catch {
    // Keep local inquiry chats available offline / when API fails.
  }

  const local = await listInquiryConversations();
  const remotePeerIds = new Set(remote.map(c => c.participant.id));
  const mergedLocal = local.filter(c => !remotePeerIds.has(c.participant.id));
  return [...remote, ...mergedLocal].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
};

export const createConversation = async (
  input: string | CreateConversationPayload,
  currentUser?: ApiUser | null
): Promise<ChatConversation> => {
  const payload: CreateConversationPayload =
    typeof input === 'string' ? { bookingId: input } : input;

  if (!payload.bookingId && !payload.participantId && !payload.tutorId) {
    throw new Error('bookingId or participantId is required.');
  }

  // Booking-linked chat (backend contract from short doc)
  if (payload.bookingId) {
    const response = await createConversationAPI({
      bookingId: payload.bookingId,
      subject: payload.subject,
    });
    const mapped = mapConversation(
      extractData(response.data),
      getUserId(currentUser)
    );
    if (!mapped) throw new Error('Could not create conversation.');
    return mapped;
  }

  // Pre-booking: try participantId / tutorId variants the backend may accept
  const attempts: CreateConversationPayload[] = [
    {
      participantId: payload.participantId,
      subject: payload.subject,
    },
    {
      tutorId: payload.tutorId || payload.participantId,
      subject: payload.subject,
    },
  ];
  if (payload.tutorProfileId) {
    attempts.push({
      tutorId: payload.tutorProfileId,
      subject: payload.subject,
    });
  }

  let lastError: unknown;
  for (const attempt of attempts) {
    if (!attempt.participantId && !attempt.tutorId) continue;
    try {
      const response = await createConversationAPI(attempt);
      const mapped = mapConversation(
        extractData(response.data),
        getUserId(currentUser)
      );
      if (mapped) return mapped;
    } catch (error) {
      lastError = error;
      if (!isBookingRequiredError(error)) {
        // Unexpected error — still fall back so Ask UI is usable
        break;
      }
    }
  }

  // Backend still requires bookingId → local pre-booking chat for UI / demo
  console.warn(
    '[Chat] Pre-booking API rejected; using local inquiry chat.',
    getApiErrorMessage(lastError, '400')
  );
  return createLocalInquiry(payload);
};

export const listMessages = async (
  conversationId: string,
  currentUser?: ApiUser | null,
  page = 1,
  limit = 20
): Promise<ChatMessage[]> => {
  if (isInquiryConversationId(conversationId)) {
    return listInquiryMessages(conversationId);
  }

  const response = await listMessagesAPI(conversationId, { page, limit });
  const me = getUserId(currentUser);
  // API returns newest first — reverse for chat UI (oldest → newest)
  const mapped = extractList(response.data)
    .map(item => mapMessage(item, me, conversationId))
    .filter((item): item is ChatMessage => Boolean(item))
    .reverse();
  return mapped;
};

export const sendTextMessage = async (
  conversationId: string,
  text: string,
  currentUser?: ApiUser | null,
  replyTo?: string
): Promise<ChatMessage> => {
  if (isInquiryConversationId(conversationId)) {
    const me = getUserId(currentUser) || 'me';
    return appendInquiryMessage(conversationId, {
      id: `local-${Date.now()}`,
      chatId: conversationId,
      type: 'text',
      text,
      senderId: me,
      isMine: true,
      createdAt: new Date().toISOString(),
      status: 'sent',
      replyTo: replyTo
        ? { id: replyTo, senderName: 'You', text: '' }
        : undefined,
    });
  }

  const response = await sendTextMessageAPI(conversationId, {
    text,
    messageType: 'text',
    replyTo,
  });
  const mapped = mapMessage(
    extractData(response.data),
    getUserId(currentUser),
    conversationId
  );
  if (!mapped) {
    throw new Error('Failed to send message.');
  }
  return mapped;
};

export const sendMediaMessage = async (
  params: UploadChatMediaParams,
  currentUser?: ApiUser | null
): Promise<ChatMessage> => {
  if (isInquiryConversationId(params.conversationId)) {
    const me = getUserId(currentUser) || 'me';
    return appendInquiryMessage(params.conversationId, {
      id: `local-media-${Date.now()}`,
      chatId: params.conversationId,
      type: params.messageType === 'homework' ? 'homework' : params.messageType,
      text: params.text || params.file.name || 'Attachment',
      senderId: me,
      isMine: true,
      createdAt: new Date().toISOString(),
      status: 'sent',
      mediaUri: params.file.uri,
      fileName: params.file.name,
      durationSec: params.duration,
    });
  }

  const response = await sendMediaMessageAPI(params);
  const mapped = mapMessage(
    extractData(response.data),
    getUserId(currentUser),
    params.conversationId
  );
  if (!mapped) {
    throw new Error('Failed to send media.');
  }
  return mapped;
};

export const editMessage = async (
  messageId: string,
  text: string,
  currentUser?: ApiUser | null,
  conversationId?: string
): Promise<ChatMessage> => {
  if (conversationId && isInquiryConversationId(conversationId)) {
    const updated = await updateInquiryMessage(conversationId, messageId, {
      text,
      edited: true,
    });
    if (!updated) throw new Error('Failed to edit message.');
    return updated;
  }

  const response = await editMessageAPI(messageId, { text });
  const mapped = mapMessage(extractData(response.data), getUserId(currentUser));
  if (!mapped) {
    throw new Error('Failed to edit message.');
  }
  return mapped;
};

export const deleteMessage = async (
  messageId: string,
  deleteFor: 'me' | 'everyone' = 'me',
  conversationId?: string
): Promise<void> => {
  if (conversationId && isInquiryConversationId(conversationId)) {
    await deleteInquiryMessage(conversationId, messageId);
    return;
  }
  await deleteMessageAPI(messageId, { deleteFor });
};

export const reactToMessage = async (
  messageId: string,
  emoji: string,
  currentUser?: ApiUser | null,
  conversationId?: string
): Promise<ChatMessage | null> => {
  if (conversationId && isInquiryConversationId(conversationId)) {
    return updateInquiryMessage(conversationId, messageId, {
      reaction: emoji,
    });
  }

  const response = await reactToMessageAPI(messageId, { emoji });
  return mapMessage(extractData(response.data), getUserId(currentUser));
};

export { isInquiryConversationId };
