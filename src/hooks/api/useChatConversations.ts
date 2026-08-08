import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  connectChatSocket,
  releaseChatSocket,
  emitCheckOnlineStatus,
} from '../../services/chat/chatSocket';
import { mapMessage } from '../../services/chat/chatService';
import {
  createConversationThunk,
  fetchConversationsThunk,
  messageReceived,
  setUserOnline,
  upsertConversation,
} from '../../store/chat/chatSlice';
import {
  selectChatError,
  selectConversations,
  selectConversationsLoading,
  selectUnreadTotal,
} from '../../store/chat/chatSelectors';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { CreateConversationPayload } from '../../types/chat.types';
import { ApiUser } from '../../types/api.types';
import { getUserId } from '../../utils/api/userId';

export const useChatConversations = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user as ApiUser | null);
  const conversations = useAppSelector(selectConversations);
  const loading = useAppSelector(selectConversationsLoading);
  const error = useAppSelector(selectChatError);
  const unreadTotal = useAppSelector(selectUnreadTotal);
  const onlineByUserId = useAppSelector(state => state.chat.onlineByUserId);
  const [refreshing, setRefreshing] = useState(false);
  const me = getUserId(authUser);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const items = await dispatch(
          fetchConversationsThunk(authUser)
        ).unwrap();
        const peerIds = items
          .map((item: { participant: { id: string } }) => item.participant.id)
          .filter(Boolean);
        if (peerIds.length) {
          emitCheckOnlineStatus(peerIds);
        }
      } catch {
        // error stored in slice
      } finally {
        setRefreshing(false);
      }
    },
    [authUser, dispatch]
  );

  useEffect(() => {
    void load();

    let mounted = true;
    const handlers = {
      onNewMessage: (raw: unknown) => {
        if (!mounted) return;
        const mapped = mapMessage(raw, me);
        if (mapped) {
          dispatch(
            messageReceived({
              message: mapped,
              incrementUnread: !mapped.isMine,
            })
          );
        } else {
          void load(true);
        }
      },
      onUserStatus: ({
        userId,
        status,
      }: {
        userId: string;
        status: 'online' | 'offline';
      }) => {
        if (!mounted) return;
        dispatch(setUserOnline({ userId, online: status === 'online' }));
      },
      onOnlineStatus: ({
        data,
      }: {
        data: Array<{ userId: string; status: string }>;
      }) => {
        if (!mounted || !Array.isArray(data)) return;
        data.forEach(item => {
          dispatch(
            setUserOnline({
              userId: item.userId,
              online: item.status === 'online',
            })
          );
        });
      },
    };

    void connectChatSocket(handlers);

    return () => {
      mounted = false;
      releaseChatSocket(handlers);
    };
  }, [dispatch, load, me]);

  const enriched = useMemo(
    () =>
      conversations.map(chat => {
        if (!(chat.participant.id in onlineByUserId)) return chat;
        const online = onlineByUserId[chat.participant.id];
        return {
          ...chat,
          participant: {
            ...chat.participant,
            isOnline: online,
            lastSeen: online ? 'Online' : chat.participant.lastSeen,
          },
        };
      }),
    [conversations, onlineByUserId]
  );

  const startConversation = useCallback(
    async (input: string | CreateConversationPayload) => {
      const payload: CreateConversationPayload =
        typeof input === 'string' ? { bookingId: input } : input;
      const conversation = await dispatch(
        createConversationThunk({ payload, currentUser: authUser })
      ).unwrap();
      dispatch(upsertConversation(conversation));
      return conversation;
    },
    [authUser, dispatch]
  );

  const togglePinLocal = useCallback(
    (id: string) => {
      const current = conversations.find(c => c.id === id);
      if (!current) return;
      dispatch(upsertConversation({ ...current, pinned: !current.pinned }));
    },
    [conversations, dispatch]
  );

  const archiveLocal = useCallback(
    (id: string) => {
      const current = conversations.find(c => c.id === id);
      if (!current) return;
      dispatch(upsertConversation({ ...current, archived: true }));
    },
    [conversations, dispatch]
  );

  return {
    conversations: enriched,
    loading: loading && enriched.length === 0,
    refreshing,
    error,
    unreadTotal,
    refresh: () => load(true),
    startConversation,
    togglePinLocal,
    archiveLocal,
  };
};
