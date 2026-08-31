import api from './client';
import { ApiSuccessResponse } from '../types/api.types';
import {
  AiClassSummary,
  EndSessionSummaryPayload,
  ReviewSummaryPayload,
  SummaryListParams,
  SummaryListResult,
  SummaryStatusPayload,
  TranscriptChunk,
} from '../types/summary.types';

const BASE = '/api/summaries';

export const endSessionForSummaryAPI = (
  sessionId: string,
  data?: EndSessionSummaryPayload
) =>
  api.post<
    ApiSuccessResponse<{
      sessionId: string;
      summaryId?: string;
      status: string;
    }>
  >(`${BASE}/session/${sessionId}/end`, data || {});

export const getSessionSummaryAPI = (sessionId: string) =>
  api.get<ApiSuccessResponse<AiClassSummary>>(
    `${BASE}/session/${sessionId}`
  );

export const getSummaryStatusAPI = (sessionId: string) =>
  api.get<ApiSuccessResponse<SummaryStatusPayload>>(
    `${BASE}/session/${sessionId}/status`
  );

export const getSummaryByIdAPI = (summaryId: string) =>
  api.get<ApiSuccessResponse<AiClassSummary>>(`${BASE}/${summaryId}`);

export const getStudentSummariesAPI = (params?: SummaryListParams) =>
  api.get<ApiSuccessResponse<SummaryListResult>>(`${BASE}/student`, {
    params,
  });

export const getTutorSummariesAPI = (params?: SummaryListParams) =>
  api.get<ApiSuccessResponse<SummaryListResult>>(`${BASE}/tutor`, {
    params,
  });

export const reviewSummaryAPI = (
  summaryId: string,
  data: ReviewSummaryPayload
) =>
  api.patch<ApiSuccessResponse<AiClassSummary>>(
    `${BASE}/${summaryId}/review`,
    data
  );

export const publishSummaryAPI = (summaryId: string) =>
  api.post<ApiSuccessResponse<AiClassSummary>>(
    `${BASE}/${summaryId}/publish`,
    { confirm: true }
  );

export const retrySummaryAPI = (sessionId: string) =>
  api.post<
    ApiSuccessResponse<{
      sessionId: string;
      summaryId?: string;
      status: string;
    }>
  >(`${BASE}/session/${sessionId}/retry`);

/** Append live caption chunks during/after class. */
export const appendTranscriptChunksAPI = (
  sessionId: string,
  chunks: TranscriptChunk[]
) =>
  api.post<ApiSuccessResponse<{ ok?: boolean; count?: number }>>(
    `${BASE}/session/${sessionId}/transcript/chunks`,
    { chunks }
  );

/** Set remote audio URL for backend STT. */
export const setTranscriptAudioAPI = (sessionId: string, audioUrl: string) =>
  api.put<ApiSuccessResponse<{ ok?: boolean }>>(
    `${BASE}/session/${sessionId}/transcript/audio`,
    { audioUrl }
  );

/** Tutor-only: paste manual transcript (marks ready for AI). */
export const setManualTranscriptAPI = (
  sessionId: string,
  transcriptText: string,
  language?: string
) =>
  api.put<ApiSuccessResponse<{ ok?: boolean }>>(
    `${BASE}/session/${sessionId}/transcript/manual`,
    { transcriptText, ...(language ? { language } : {}) }
  );
