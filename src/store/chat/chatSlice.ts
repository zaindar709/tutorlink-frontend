import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ChatConversation,
  ChatMessage,
  CreateConversationPayload,
  MessageStatus,
  UploadChatMediaParams,
} from '../../types/chat.types';
import { ApiUser } from '../../types/api.types';
import {
  createConversation as createConversationRequest,
  deleteMessage as deleteMessageRequest,
  listConversations as listConversationsRequest,
  listMessages as listMessagesRequest,
  sendMediaMessage as sendMediaMessageRequest,
  sendTextMessage as sendTextMessageRequest,
} from '../../services/chat/chatService';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export type ChatState = {
  conversations: ChatConversation[];
  messagesByConversationId: Record<string, ChatMessage[]>;
  messagePages: Record<string, { page: number; hasMore: boolean }>;
  conversationsLoading: boolean;
  messagesLoadingById: Record<string, boolean>;
  sendingById: Record<string, boolean>;
  typingById: Record<string, boolean>;
  onlineByUserId: Record<string, boolean>;
  error: string | null;
};

const initialState: ChatState = {
  conversations: [],
  messagesByConversationId: {},
  messagePages: {},
  conversationsLoading: false,
  messagesLoadingById: {},
  sendingById: {},
  typingById: {},
  onlineByUserId: {},
  error: null,
};

export const fetchConversationsThunk = createAsyncThunk<
  ChatConversation[],
  ApiUser | null | undefined,
  { rejectValue: string }
>('chat/fetchConversations', async (currentUser, { rejectWithValue }) => {
  try {
    return await listConversationsRequest(currentUser);
  } catch (error) {
    return rejectWithValue(
      getApiErrorMessage(error, 'Could not load conversations.')
    );
  }
});

export const createConversationThunk = createAsyncThunk<
  ChatConversation,
  { payload: CreateConversationPayload; currentUser?: ApiUser | null },
  { rejectValue: string }
>('chat/createConversation', async ({ payload, currentUser }, { rejectWithValue }) => {
  try {
    if (!payload.bookingId) {
      return rejectWithValue(
        'Chat is available after a booking is created with this tutor.'
      );
    }
    return await createConversationRequest(payload, currentUser);
  } catch (error) {
    return rejectWithValue(
      getApiErrorMessage(error, 'Could not start conversation.')
    );
  }
});

export const fetchMessagesThunk = createAsyncThunk<
  { conversationId: string; messages: ChatMessage[]; page: number; append: boolean },
  {
    conversationId: string;
    currentUser?: ApiUser | null;
    page?: number;
    append?: boolean;
  },
  { rejectValue: string }
>(
  'chat/fetchMessages',
  async (
    { conversationId, currentUser, page = 1, append = false },
    { rejectWithValue }
  ) => {
    try {
      const messages = await listMessagesRequest(
        conversationId,
        currentUser,
        page
      );
      return { conversationId, messages, page, append };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, 'Could not load messages.')
      );
    }
  }
);

export const sendTextMessageThunk = createAsyncThunk<
  { conversationId: string; optimisticId: string; message: ChatMessage },
  {
    conversationId: string;
    text: string;
    replyTo?: string;
    currentUser?: ApiUser | null;
    optimisticId: string;
  },
  { rejectValue: { conversationId: string; optimisticId: string; message: string } }
>(
  'chat/sendTextMessage',
  async (
    { conversationId, text, replyTo, currentUser, optimisticId },
    { rejectWithValue }
  ) => {
    try {
      const message = await sendTextMessageRequest(
        conversationId,
        text,
        currentUser,
        replyTo
      );
      return { conversationId, optimisticId, message };
    } catch (error) {
      return rejectWithValue({
        conversationId,
        optimisticId,
        message: getApiErrorMessage(error, 'Failed to send message.'),
      });
    }
  }
);

export const sendMediaMessageThunk = createAsyncThunk<
  { conversationId: string; message: ChatMessage },
  { params: UploadChatMediaParams; currentUser?: ApiUser | null },
  { rejectValue: string }
>('chat/sendMediaMessage', async ({ params, currentUser }, { rejectWithValue }) => {
  try {
    const message = await sendMediaMessageRequest(params, currentUser);
    return { conversationId: params.conversationId, message };
  } catch (error) {
    return rejectWithValue(
      getApiErrorMessage(error, 'Failed to send attachment.')
    );
  }
});

export const deleteMessageThunk = createAsyncThunk<
  { conversationId: string; messageId: string },
  {
    conversationId: string;
    messageId: string;
    deleteFor: 'me' | 'everyone';
  },
  { rejectValue: string }
>(
  'chat/deleteMessage',
  async ({ conversationId, messageId, deleteFor }, { rejectWithValue }) => {
    try {
      await deleteMessageRequest(messageId, deleteFor);
      return { conversationId, messageId };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, 'Failed to delete message.')
      );
    }
  }
);

const bumpConversationPreview = (
  state: ChatState,
  conversationId: string,
  text: string,
  at: string,
  unreadIncrement = 0
) => {
  const idx = state.conversations.findIndex(c => c.id === conversationId);
  if (idx < 0) return;
  const current = state.conversations[idx];
  const updated: ChatConversation = {
    ...current,
    lastMessage: text,
    lastMessageAt: at,
    unreadCount: Math.max(0, current.unreadCount + unreadIncrement),
  };
  state.conversations.splice(idx, 1);
  state.conversations.unshift(updated);
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChatError(state) {
      state.error = null;
    },
    setPeerTyping(
      state,
      action: PayloadAction<{ conversationId: string; typing: boolean }>
    ) {
      state.typingById[action.payload.conversationId] = action.payload.typing;
    },
    setUserOnline(
      state,
      action: PayloadAction<{ userId: string; online: boolean }>
    ) {
      state.onlineByUserId[action.payload.userId] = action.payload.online;
    },
    messageReceived(
      state,
      action: PayloadAction<{ message: ChatMessage; incrementUnread?: boolean }>
    ) {
      const { message, incrementUnread } = action.payload;
      const list = state.messagesByConversationId[message.chatId] || [];
      if (list.some(m => m.id === message.id)) return;
      state.messagesByConversationId[message.chatId] = [...list, message];
      bumpConversationPreview(
        state,
        message.chatId,
        message.text || message.type,
        message.createdAt,
        incrementUnread && !message.isMine ? 1 : 0
      );
    },
    messageStatusUpdated(
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId: string;
        status: MessageStatus;
      }>
    ) {
      const { conversationId, messageId, status } = action.payload;
      const list = state.messagesByConversationId[conversationId];
      if (!list) return;
      state.messagesByConversationId[conversationId] = list.map(m =>
        m.id === messageId ? { ...m, status } : m
      );
    },
    markConversationRead(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.conversations = state.conversations.map(c =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      );
    },
    addOptimisticMessage(
      state,
      action: PayloadAction<{ conversationId: string; message: ChatMessage }>
    ) {
      const { conversationId, message } = action.payload;
      const list = state.messagesByConversationId[conversationId] || [];
      state.messagesByConversationId[conversationId] = [...list, message];
      bumpConversationPreview(
        state,
        conversationId,
        message.text || message.type,
        message.createdAt,
        0
      );
    },
    upsertConversation(state, action: PayloadAction<ChatConversation>) {
      const existing = state.conversations.findIndex(
        c => c.id === action.payload.id
      );
      if (existing >= 0) {
        state.conversations[existing] = {
          ...state.conversations[existing],
          ...action.payload,
        };
      } else {
        state.conversations.unshift(action.payload);
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchConversationsThunk.pending, state => {
        state.conversationsLoading = true;
        state.error = null;
      })
      .addCase(fetchConversationsThunk.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversationsThunk.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload || 'Could not load conversations.';
      })
      .addCase(createConversationThunk.fulfilled, (state, action) => {
        const existing = state.conversations.findIndex(
          c => c.id === action.payload.id
        );
        if (existing >= 0) {
          state.conversations[existing] = action.payload;
        } else {
          state.conversations.unshift(action.payload);
        }
      })
      .addCase(createConversationThunk.rejected, (state, action) => {
        state.error = action.payload || 'Could not start conversation.';
      })
      .addCase(fetchMessagesThunk.pending, (state, action) => {
        state.messagesLoadingById[action.meta.arg.conversationId] = true;
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        const { conversationId, messages, page, append } = action.payload;
        state.messagesLoadingById[conversationId] = false;
        const existing = state.messagesByConversationId[conversationId] || [];
        if (append) {
          const ids = new Set(existing.map(m => m.id));
          const older = messages.filter(m => !ids.has(m.id));
          state.messagesByConversationId[conversationId] = [
            ...older,
            ...existing,
          ];
        } else {
          state.messagesByConversationId[conversationId] = messages;
        }
        state.messagePages[conversationId] = {
          page,
          hasMore: messages.length >= 20,
        };
      })
      .addCase(fetchMessagesThunk.rejected, (state, action) => {
        state.messagesLoadingById[action.meta.arg.conversationId] = false;
        state.error = action.payload || 'Could not load messages.';
      })
      .addCase(sendTextMessageThunk.pending, (state, action) => {
        state.sendingById[action.meta.arg.conversationId] = true;
      })
      .addCase(sendTextMessageThunk.fulfilled, (state, action) => {
        const { conversationId, optimisticId, message } = action.payload;
        state.sendingById[conversationId] = false;
        const list = state.messagesByConversationId[conversationId] || [];
        state.messagesByConversationId[conversationId] = list.map(m =>
          m.id === optimisticId ? message : m
        );
        bumpConversationPreview(
          state,
          conversationId,
          message.text || message.type,
          message.createdAt,
          0
        );
      })
      .addCase(sendTextMessageThunk.rejected, (state, action) => {
        const payload = action.payload;
        if (payload) {
          state.sendingById[payload.conversationId] = false;
          const list =
            state.messagesByConversationId[payload.conversationId] || [];
          state.messagesByConversationId[payload.conversationId] = list.map(m =>
            m.id === payload.optimisticId ? { ...m, status: 'failed' } : m
          );
          state.error = payload.message;
        }
      })
      .addCase(sendMediaMessageThunk.pending, (state, action) => {
        state.sendingById[action.meta.arg.params.conversationId] = true;
      })
      .addCase(sendMediaMessageThunk.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        state.sendingById[conversationId] = false;
        const list = state.messagesByConversationId[conversationId] || [];
        if (!list.some(m => m.id === message.id)) {
          state.messagesByConversationId[conversationId] = [...list, message];
        }
        bumpConversationPreview(
          state,
          conversationId,
          message.text || message.type,
          message.createdAt,
          0
        );
      })
      .addCase(sendMediaMessageThunk.rejected, (state, action) => {
        state.sendingById[action.meta.arg.params.conversationId] = false;
        state.error = action.payload || 'Failed to send attachment.';
      })
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload;
        const list = state.messagesByConversationId[conversationId] || [];
        state.messagesByConversationId[conversationId] = list.filter(
          m => m.id !== messageId
        );
      });
  },
});

export const {
  clearChatError,
  setPeerTyping,
  setUserOnline,
  messageReceived,
  messageStatusUpdated,
  markConversationRead,
  addOptimisticMessage,
  upsertConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
