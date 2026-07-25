import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  deleteMessage,
  listMessages,
  mapMessage,
  reactToMessage,
  sendMediaMessage,
  sendTextMessage,
  isInquiryConversationId,
} from '../../services/chat/chatService';
import {
  connectChatSocket,
  emitMessageDelivered,
  emitMessageSeen,
  emitStopTyping,
  emitTyping,
  joinConversationRoom,
  leaveConversationRoom,
  releaseChatSocket,
} from '../../services/chat/chatSocket';
import {
  ChatMediaMessageType,
  ChatMessage,
  MessageStatus,
} from '../../types/chat.types';
import { ApiUser } from '../../types/api.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';
import { getUserId } from '../../utils/api/userId';

export const useChatMessages = (conversationId: string) => {
  const authUser = useSelector(
    (state: any) => state.auth.user as ApiUser | null
  );
  const me = getUserId(authUser);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const items = await listMessages(conversationId, authUser);
      setMessages(items);

      const lastIncoming = [...items].reverse().find(m => !m.isMine);
      if (lastIncoming) {
        emitMessageDelivered(conversationId, lastIncoming.id);
        emitMessageSeen(conversationId, lastIncoming.id);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load messages.'));
    } finally {
      setLoading(false);
    }
  }, [authUser, conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    void load();

    // Local pre-booking chats don't use sockets
    if (isInquiryConversationId(conversationId)) {
      return;
    }

    let mounted = true;
    const handlers = {
      onNewMessage: (raw: unknown) => {
        if (!mounted) return;
        const mapped = mapMessage(raw, me, conversationId);
        if (!mapped || mapped.chatId !== conversationId) return;

        setMessages(prev => {
          if (prev.some(m => m.id === mapped.id)) return prev;
          const withoutOptimistic = prev.filter(
            m =>
              !(
                m.id.startsWith('local-') &&
                m.isMine &&
                m.text &&
                m.text === mapped.text
              )
          );
          return [...withoutOptimistic, mapped];
        });

        if (!mapped.isMine) {
          emitMessageDelivered(conversationId, mapped.id);
          emitMessageSeen(conversationId, mapped.id);
        }
      },
      onUserTyping: ({
        conversationId: id,
        userId,
      }: {
        conversationId: string;
        userId: string;
      }) => {
        if (id === conversationId && userId !== me) {
          setPeerTyping(true);
        }
      },
      onUserStopTyping: ({
        conversationId: id,
        userId,
      }: {
        conversationId: string;
        userId: string;
      }) => {
        if (id === conversationId && userId !== me) {
          setPeerTyping(false);
        }
      },
      onMessageStatusUpdated: ({
        messageId,
        status,
      }: {
        messageId: string;
        status: string;
      }) => {
        setMessages(prev =>
          prev.map(m =>
            m.id === messageId
              ? { ...m, status: status as MessageStatus }
              : m
          )
        );
      },
    };

    void connectChatSocket(handlers).then(() => {
      joinConversationRoom(conversationId);
    });

    return () => {
      mounted = false;
      leaveConversationRoom(conversationId);
      releaseChatSocket(handlers);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [conversationId, load, me]);

  const notifyTyping = useCallback(() => {
    if (!conversationId || isInquiryConversationId(conversationId)) return;
    emitTyping(conversationId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emitStopTyping(conversationId);
    }, 1200);
  }, [conversationId]);

  const sendText = useCallback(
    async (text: string, replyTo?: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const optimistic: ChatMessage = {
        id: `local-${Date.now()}`,
        chatId: conversationId,
        type: 'text',
        text: trimmed,
        senderId: me || 'me',
        isMine: true,
        createdAt: new Date().toISOString(),
        status: 'sending',
      };
      setMessages(prev => [...prev, optimistic]);
      setSending(true);

      try {
        const saved = await sendTextMessage(
          conversationId,
          trimmed,
          authUser,
          replyTo
        );
        setMessages(prev =>
          prev.map(m => (m.id === optimistic.id ? saved : m))
        );
      } catch (err) {
        setMessages(prev =>
          prev.map(m =>
            m.id === optimistic.id ? { ...m, status: 'failed' } : m
          )
        );
        setError(getApiErrorMessage(err, 'Failed to send message.'));
      } finally {
        setSending(false);
        emitStopTyping(conversationId);
      }
    },
    [authUser, conversationId, me]
  );

  const sendMedia = useCallback(
    async (params: {
      uri: string;
      type?: string;
      name?: string;
      messageType: ChatMediaMessageType;
      text?: string;
      duration?: number;
    }) => {
      setSending(true);
      try {
        const saved = await sendMediaMessage(
          {
            conversationId,
            file: {
              uri: params.uri,
              type: params.type,
              name: params.name,
            },
            messageType: params.messageType,
            text: params.text,
            duration: params.duration,
          },
          authUser
        );
        setMessages(prev => [...prev, saved]);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to send attachment.'));
      } finally {
        setSending(false);
      }
    },
    [authUser, conversationId]
  );

  const remove = useCallback(
    async (messageId: string, deleteFor: 'me' | 'everyone' = 'me') => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
      try {
        await deleteMessage(messageId, deleteFor, conversationId);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to delete message.'));
        void load();
      }
    },
    [conversationId, load]
  );

  const react = useCallback(
    async (messageId: string, emoji: string) => {
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, reaction: m.reaction === emoji ? undefined : emoji }
            : m
        )
      );
      try {
        const updated = await reactToMessage(
          messageId,
          emoji,
          authUser,
          conversationId
        );
        if (updated) {
          setMessages(prev =>
            prev.map(m => (m.id === messageId ? { ...m, ...updated } : m))
          );
        }
      } catch {
        // keep optimistic UI
      }
    },
    [authUser, conversationId]
  );

  return {
    messages,
    loading,
    sending,
    error,
    peerTyping,
    refresh: load,
    sendText,
    sendMedia,
    react,
    remove,
    notifyTyping,
  };
};
