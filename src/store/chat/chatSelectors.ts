import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export const selectChatState = (state: RootState) => state.chat;

export const selectConversations = (state: RootState) =>
  state.chat.conversations;

export const selectConversationsLoading = (state: RootState) =>
  state.chat.conversationsLoading;

export const selectChatError = (state: RootState) => state.chat.error;

export const selectUnreadTotal = createSelector(
  selectConversations,
  conversations =>
    conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
);

export const selectMessagesFor = (conversationId: string) =>
  (state: RootState) =>
    state.chat.messagesByConversationId[conversationId] || [];

export const selectMessagesLoading = (conversationId: string) =>
  (state: RootState) =>
    Boolean(state.chat.messagesLoadingById[conversationId]);

export const selectSending = (conversationId: string) => (state: RootState) =>
  Boolean(state.chat.sendingById[conversationId]);

export const selectPeerTyping = (conversationId: string) =>
  (state: RootState) =>
    Boolean(state.chat.typingById[conversationId]);

export const selectHasMoreMessages = (conversationId: string) =>
  (state: RootState) =>
    state.chat.messagePages[conversationId]?.hasMore ?? true;

export const selectConversationById = (id: string) => (state: RootState) =>
  state.chat.conversations.find(c => c.id === id);

export const selectConversationByBookingId = (bookingId: string) =>
  (state: RootState) =>
    state.chat.conversations.find(c => c.bookingId === bookingId);
