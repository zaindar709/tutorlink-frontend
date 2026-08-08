import { useCallback, useEffect, useRef } from 'react';
import {
  isInquiryConversationId,
  mapMessage,
  reactToMessage,
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
  addOptimisticMessage,
  deleteMessageThunk,
  fetchMessagesThunk,
  markConversationRead,
  messageReceived,
  messageStatusUpdated,
  sendMediaMessageThunk,
  sendTextMessageThunk,
  setPeerTyping,
} from '../../store/chat/chatSlice';
import {
  selectHasMoreMessages,
  selectMessagesFor,
  selectMessagesLoading,
  selectPeerTyping,
  selectSending,
} from '../../store/chat/chatSelectors';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  ChatMediaMessageType,
  ChatMessage,
  MessageStatus,
} from '../../types/chat.types';
import { ApiUser } from '../../types/api.types';
import { getUserId } from '../../utils/api/userId';

export const useChatMessages = (conversationId: string) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const me = getUserId(authUser);
  const messages = useAppSelector(selectMessagesFor(conversationId));
  const loading = useAppSelector(selectMessagesLoading(conversationId));
  const sending = useAppSelector(selectSending(conversationId));
  const peerTyping = useAppSelector(selectPeerTyping(conversationId));
  const hasMore = useAppSelector(selectHasMoreMessages(conversationId));
  const error = useAppSelector(state => state.chat.error);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef(1);

  const load = useCallback(async () => {
    if (!conversationId) return;
    pageRef.current = 1;
    const items = await dispatch(
      fetchMessagesThunk({
        conversationId,
        currentUser: authUser,
        page: 1,
        append: false,
      })
    ).unwrap();

    dispatch(markConversationRead(conversationId));

    const lastIncoming = [...items.messages].reverse().find(m => !m.isMine);
    if (lastIncoming && !isInquiryConversationId(conversationId)) {
      emitMessageDelivered(conversationId, lastIncoming.id);
      emitMessageSeen(conversationId, lastIncoming.id);
    }
  }, [authUser, conversationId, dispatch]);

  const loadMore = useCallback(async () => {
    if (!conversationId || !hasMore || loading) return;
    const nextPage = pageRef.current + 1;
    await dispatch(
      fetchMessagesThunk({
        conversationId,
        currentUser: authUser,
        page: nextPage,
        append: true,
      })
    );
    pageRef.current = nextPage;
  }, [authUser, conversationId, dispatch, hasMore, loading]);

  useEffect(() => {
    if (!conversationId) return;
    void load();

    if (isInquiryConversationId(conversationId)) {
      return;
    }

    let mounted = true;
    const handlers = {
      onNewMessage: (raw: unknown) => {
        if (!mounted) return;
        const mapped = mapMessage(raw, me, conversationId);
        if (!mapped || mapped.chatId !== conversationId) return;

        dispatch(
          messageReceived({
            message: mapped,
            incrementUnread: false,
          })
        );

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
          dispatch(setPeerTyping({ conversationId, typing: true }));
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
          dispatch(setPeerTyping({ conversationId, typing: false }));
        }
      },
      onMessageStatusUpdated: ({
        messageId,
        status,
      }: {
        messageId: string;
        status: string;
      }) => {
        dispatch(
          messageStatusUpdated({
            conversationId,
            messageId,
            status: status as MessageStatus,
          })
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
  }, [conversationId, dispatch, load, me]);

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

      const optimisticId = `local-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        chatId: conversationId,
        type: 'text',
        text: trimmed,
        senderId: me || 'me',
        isMine: true,
        createdAt: new Date().toISOString(),
        status: 'sending',
      };
      dispatch(
        addOptimisticMessage({ conversationId, message: optimistic })
      );

      try {
        await dispatch(
          sendTextMessageThunk({
            conversationId,
            text: trimmed,
            replyTo,
            currentUser: authUser,
            optimisticId,
          })
        ).unwrap();
      } catch {
        // failed status set in slice
      } finally {
        emitStopTyping(conversationId);
      }
    },
    [authUser, conversationId, dispatch, me]
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
      try {
        await dispatch(
          sendMediaMessageThunk({
            params: {
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
            currentUser: authUser,
          })
        ).unwrap();
      } catch {
        // error in slice
      }
    },
    [authUser, conversationId, dispatch]
  );

  const remove = useCallback(
    async (messageId: string, deleteFor: 'me' | 'everyone' = 'me') => {
      try {
        await dispatch(
          deleteMessageThunk({ conversationId, messageId, deleteFor })
        ).unwrap();
      } catch {
        void load();
      }
    },
    [conversationId, dispatch, load]
  );

  const react = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        await reactToMessage(messageId, emoji, authUser, conversationId);
        void load();
      } catch {
        // keep UI
      }
    },
    [authUser, conversationId, load]
  );

  return {
    messages,
    loading: loading && messages.length === 0,
    sending,
    error,
    peerTyping,
    hasMore,
    refresh: load,
    loadMore,
    sendText,
    sendMedia,
    react,
    remove,
    notifyTyping,
  };
};
