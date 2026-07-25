import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  createConversation,
  listConversations,
} from '../../services/chat/chatService';
import {
  connectChatSocket,
  releaseChatSocket,
  emitCheckOnlineStatus,
} from '../../services/chat/chatSocket';
import {
  ChatConversation,
  CreateConversationPayload,
} from '../../types/chat.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';
import { ApiUser } from '../../types/api.types';

export const useChatConversations = () => {
  const authUser = useSelector(
    (state: any) => state.auth.user as ApiUser | null
  );
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const items = await listConversations(authUser);
        setConversations(items);

        const peerIds = items
          .map(item => item.participant.id)
          .filter(Boolean);
        if (peerIds.length) {
          emitCheckOnlineStatus(peerIds);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not load conversations.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authUser]
  );

  useEffect(() => {
    void load();

    let mounted = true;
    const handlers = {
      onNewMessage: () => {
        if (mounted) void load(true);
      },
      onUserStatus: ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
        if (!mounted) return;
        setConversations(prev =>
          prev.map(chat =>
            chat.participant.id === userId
              ? {
                  ...chat,
                  participant: {
                    ...chat.participant,
                    isOnline: status === 'online',
                    lastSeen: status === 'online' ? 'Online' : 'Offline',
                  },
                }
              : chat
          )
        );
      },
      onOnlineStatus: ({
        data,
      }: {
        data: Array<{ userId: string; status: string }>;
      }) => {
        if (!mounted || !Array.isArray(data)) return;
        const map = new Map(
          data.map(item => [item.userId, item.status === 'online'])
        );
        setConversations(prev =>
          prev.map(chat => {
            if (!map.has(chat.participant.id)) return chat;
            const online = map.get(chat.participant.id);
            return {
              ...chat,
              participant: {
                ...chat.participant,
                isOnline: online,
                lastSeen: online ? 'Online' : chat.participant.lastSeen,
              },
            };
          })
        );
      },
    };

    void connectChatSocket(handlers);

    return () => {
      mounted = false;
      releaseChatSocket(handlers);
    };
  }, [load]);

  const startConversation = useCallback(
    async (input: string | CreateConversationPayload) => {
      const conversation = await createConversation(input, authUser);
      setConversations(prev => {
        const without = prev.filter(c => c.id !== conversation.id);
        return [conversation, ...without];
      });
      return conversation;
    },
    [authUser]
  );

  const togglePinLocal = useCallback((id: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }, []);

  const archiveLocal = useCallback((id: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, archived: true } : c))
    );
  }, []);

  return {
    conversations,
    loading,
    refreshing,
    error,
    refresh: () => load(true),
    startConversation,
    togglePinLocal,
    archiveLocal,
  };
};
