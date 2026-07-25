import api from './client';
import { ApiSuccessResponse } from '../types/api.types';
import {
  CreateConversationPayload,
  DeleteMessagePayload,
  EditMessagePayload,
  ReactionPayload,
  SendTextMessagePayload,
  UploadChatMediaParams,
} from '../types/chat.types';

export const createConversationAPI = (data: CreateConversationPayload) =>
  api.post<ApiSuccessResponse<unknown>>('/api/chat/conversations', data);

export const listConversationsAPI = () =>
  api.get<ApiSuccessResponse<unknown>>('/api/chat/conversations');

export const listMessagesAPI = (
  conversationId: string,
  params?: { page?: number; limit?: number }
) =>
  api.get<ApiSuccessResponse<unknown>>(
    `/api/chat/conversations/${conversationId}/messages`,
    { params: { page: params?.page ?? 1, limit: params?.limit ?? 20 } }
  );

export const sendTextMessageAPI = (
  conversationId: string,
  data: SendTextMessagePayload
) =>
  api.post<ApiSuccessResponse<unknown>>(
    `/api/chat/conversations/${conversationId}/messages`,
    data
  );

export const sendMediaMessageAPI = ({
  conversationId,
  file,
  messageType,
  text,
  replyTo,
  duration,
}: UploadChatMediaParams) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type || 'application/octet-stream',
    name: file.name || 'upload',
  } as any);
  formData.append('messageType', messageType);
  if (text) formData.append('text', text);
  if (replyTo) formData.append('replyTo', replyTo);
  if (duration != null) formData.append('duration', String(duration));

  return api.post<ApiSuccessResponse<unknown>>(
    `/api/chat/conversations/${conversationId}/messages/media`,
    formData,
    { timeout: 60000 }
  );
};

export const editMessageAPI = (messageId: string, data: EditMessagePayload) =>
  api.patch<ApiSuccessResponse<unknown>>(
    `/api/chat/messages/${messageId}`,
    data
  );

export const deleteMessageAPI = (
  messageId: string,
  data: DeleteMessagePayload
) =>
  api.delete<ApiSuccessResponse<unknown>>(`/api/chat/messages/${messageId}`, {
    data,
  });

export const reactToMessageAPI = (
  messageId: string,
  data: ReactionPayload
) =>
  api.post<ApiSuccessResponse<unknown>>(
    `/api/chat/messages/${messageId}/reaction`,
    data
  );
