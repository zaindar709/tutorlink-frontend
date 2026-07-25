import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChatConversation,
  ChatMessage,
  ChatParticipant,
} from '../../types/chat.types';

const INQUIRY_PREFIX = 'inquiry-';
const STORE_KEY = '@TutorLink:inquiryChats';

type InquiryStore = {
  conversations: ChatConversation[];
  messagesByChat: Record<string, ChatMessage[]>;
};

const emptyStore = (): InquiryStore => ({
  conversations: [],
  messagesByChat: {},
});

const readStore = async (): Promise<InquiryStore> => {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as InquiryStore;
    return {
      conversations: Array.isArray(parsed.conversations)
        ? parsed.conversations
        : [],
      messagesByChat:
        parsed.messagesByChat && typeof parsed.messagesByChat === 'object'
          ? parsed.messagesByChat
          : {},
    };
  } catch {
    return emptyStore();
  }
};

const writeStore = async (store: InquiryStore) => {
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(store));
};

export const isInquiryConversationId = (id?: string | null) =>
  Boolean(id && id.startsWith(INQUIRY_PREFIX));

export const buildInquiryConversationId = (participantId: string) =>
  `${INQUIRY_PREFIX}${participantId}`;

export const listInquiryConversations = async (): Promise<
  ChatConversation[]
> => {
  const store = await readStore();
  return store.conversations
    .filter(c => !c.archived)
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );
};

export const getOrCreateInquiryConversation = async (params: {
  participantId: string;
  participant: ChatParticipant;
  subject?: string;
}): Promise<ChatConversation> => {
  const store = await readStore();
  const id = buildInquiryConversationId(params.participantId);
  const existing = store.conversations.find(c => c.id === id);
  if (existing) {
    return {
      ...existing,
      participant: { ...existing.participant, ...params.participant },
      subject: params.subject || existing.subject,
    };
  }

  const conversation: ChatConversation = {
    id,
    participant: params.participant,
    lastMessage: 'Ask about available slots before booking',
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
    subject: params.subject || 'General',
  };

  store.conversations = [conversation, ...store.conversations];
  store.messagesByChat[id] = [
    {
      id: `sys-${Date.now()}`,
      chatId: id,
      type: 'system',
      text: 'Pre-booking chat',
      senderId: 'system',
      isMine: false,
      createdAt: new Date().toISOString(),
      systemKind: 'booking_confirmed',
      systemTitle: 'Chat before you hire',
      systemSubtitle:
        'Ask if a slot is free. Live sync needs backend participantId support.',
    },
  ];
  await writeStore(store);
  return conversation;
};

export const listInquiryMessages = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const store = await readStore();
  return store.messagesByChat[conversationId] || [];
};

export const appendInquiryMessage = async (
  conversationId: string,
  message: ChatMessage
): Promise<ChatMessage> => {
  const store = await readStore();
  const list = store.messagesByChat[conversationId] || [];
  store.messagesByChat[conversationId] = [...list, message];
  store.conversations = store.conversations.map(c =>
    c.id === conversationId
      ? {
          ...c,
          lastMessage: message.text || message.type,
          lastMessageAt: message.createdAt,
          lastStatus: message.status,
        }
      : c
  );
  await writeStore(store);
  return message;
};

export const updateInquiryMessage = async (
  conversationId: string,
  messageId: string,
  patch: Partial<ChatMessage>
): Promise<ChatMessage | null> => {
  const store = await readStore();
  const list = store.messagesByChat[conversationId] || [];
  let updated: ChatMessage | null = null;
  store.messagesByChat[conversationId] = list.map(m => {
    if (m.id !== messageId) return m;
    updated = { ...m, ...patch };
    return updated;
  });
  if (updated) await writeStore(store);
  return updated;
};

export const deleteInquiryMessage = async (
  conversationId: string,
  messageId: string
): Promise<void> => {
  const store = await readStore();
  store.messagesByChat[conversationId] = (
    store.messagesByChat[conversationId] || []
  ).filter(m => m.id !== messageId);
  await writeStore(store);
};
