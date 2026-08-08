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
import {
  appendInquiryMessage,
  deleteInquiryMessage,
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

  const sender = asRecord(
    typeof raw.sender === 'object' ? raw.sender : undefined
  );
  const senderId = String(
    sender._id ||
      sender.id ||
      (typeof raw.senderId === 'string' || typeof raw.senderId === 'number'
        ? raw.senderId
        : '') ||
      (typeof raw.sender === 'string' || typeof raw.sender === 'number'
        ? raw.sender
        : '') ||
      ''
  );
  const me = currentUserId ? String(currentUserId) : '';
  // WhatsApp-style: only mark mine when sender matches current user
  const isMine =
    typeof raw.isMine === 'boolean'
      ? raw.isMine
      : Boolean(me && senderId && senderId === me);

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

/**
 * Chat requires a real booking relationship.
 * Pass bookingId — reuses an existing thread for that booking when present.
 */
export const createConversation = async (
  input: string | CreateConversationPayload,
  currentUser?: ApiUser | null
): Promise<ChatConversation> => {
  const payload: CreateConversationPayload =
    typeof input === 'string' ? { bookingId: input } : input;

  const bookingId = payload.bookingId ? String(payload.bookingId) : '';
  if (!bookingId) {
    throw new Error(
      'Chat is available after a booking is created with this tutor.'
    );
  }

  const me = getUserId(currentUser);

  // Reuse existing conversation for this booking
  try {
    const response = await listConversationsAPI();
    const existing = extractList(response.data)
      .map(item => mapConversation(item, me))
      .find(
        (c): c is ChatConversation =>
          Boolean(c && c.bookingId && c.bookingId === bookingId)
      );
    if (existing) return existing;
  } catch {
    // continue to create
  }

  const response = await createConversationAPI({
    bookingId,
    subject: payload.subject,
  });
  const mapped = mapConversation(extractData(response.data), me);
  if (!mapped) throw new Error('Could not create conversation.');
  return mapped;
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
