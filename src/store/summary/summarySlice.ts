import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  endSessionForSummary,
  fetchSessionSummary,
  fetchStudentSummaries,
  fetchSummaryById,
  fetchSummaryStatus,
  fetchTutorSummaries,
  getSummaryErrorMessage,
  publishSummary,
  retrySummary,
  reviewSummary,
  setManualTranscript,
} from '../../services/summaries/summariesService';
import {
  AiClassSummary,
  EndSessionSummaryPayload,
  ReviewSummaryPayload,
  SummaryListParams,
  SummarySocketPayload,
  SummaryStatus,
  SummaryStatusPayload,
} from '../../types/summary.types';

type SummaryState = {
  byId: Record<string, AiClassSummary>;
  statusBySession: Record<string, SummaryStatusPayload>;
  studentListIds: string[];
  tutorListIds: string[];
  studentPagination: { page: number; hasMore: boolean; total: number };
  tutorPagination: { page: number; hasMore: boolean; total: number };
  listLoading: boolean;
  detailLoading: boolean;
  mutating: boolean;
  lastError: string | null;
  lastEndedSessionId: string | null;
};

const initialState: SummaryState = {
  byId: {},
  statusBySession: {},
  studentListIds: [],
  tutorListIds: [],
  studentPagination: { page: 1, hasMore: false, total: 0 },
  tutorPagination: { page: 1, hasMore: false, total: 0 },
  listLoading: false,
  detailLoading: false,
  mutating: false,
  lastError: null,
  lastEndedSessionId: null,
};

const upsert = (state: SummaryState, summary: AiClassSummary) => {
  state.byId[summary._id] = summary;
  if (summary.sessionId) {
    state.statusBySession[summary.sessionId] = {
      sessionId: summary.sessionId,
      summaryId: summary._id,
      status: summary.status,
      updatedAt: summary.updatedAt,
    };
  }
};

export const endSessionSummaryThunk = createAsyncThunk(
  'summary/endSession',
  async (
    {
      sessionId,
      payload,
    }: { sessionId: string; payload?: EndSessionSummaryPayload },
    { rejectWithValue }
  ) => {
    try {
      return await endSessionForSummary(sessionId, payload);
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

export const fetchSummaryStatusThunk = createAsyncThunk(
  'summary/fetchStatus',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      return await fetchSummaryStatus(sessionId);
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

export const fetchSummaryByIdThunk = createAsyncThunk(
  'summary/fetchById',
  async (summaryId: string, { rejectWithValue }) => {
    try {
      return await fetchSummaryById(summaryId);
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

export const fetchSessionSummaryThunk = createAsyncThunk(
  'summary/fetchBySession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      return await fetchSessionSummary(sessionId);
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

export const fetchStudentSummariesThunk = createAsyncThunk(
  'summary/fetchStudentList',
  async (params: SummaryListParams | undefined, { rejectWithValue }) => {
    try {
      return await fetchStudentSummaries(params);
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

export const fetchTutorSummariesThunk = createAsyncThunk(
  'summary/fetchTutorList',
  async (params: SummaryListParams | undefined, { rejectWithValue }) => {
    try {
      return await fetchTutorSummaries(params);
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

export const reviewSummaryThunk = createAsyncThunk(
  'summary/review',
  async (
    { summaryId, data }: { summaryId: string; data: ReviewSummaryPayload },
    { rejectWithValue }
  ) => {
    try {
      return await reviewSummary(summaryId, data);
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

export const publishSummaryThunk = createAsyncThunk(
  'summary/publish',
  async (summaryId: string, { rejectWithValue }) => {
    try {
      return await publishSummary(summaryId);
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

export const setManualTranscriptThunk = createAsyncThunk(
  'summary/setManualTranscript',
  async (
    {
      sessionId,
      transcriptText,
      language,
    }: { sessionId: string; transcriptText: string; language?: string },
    { rejectWithValue }
  ) => {
    try {
      await setManualTranscript(sessionId, transcriptText, language);
      return { sessionId };
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

/** Retry failed generation. Optionally paste manual notes first (FYP path without STT). */
export const retrySummaryThunk = createAsyncThunk(
  'summary/retry',
  async (
    arg: string | { sessionId: string; transcriptText?: string },
    { rejectWithValue }
  ) => {
    const sessionId = typeof arg === 'string' ? arg : arg.sessionId;
    const transcriptText =
      typeof arg === 'string' ? undefined : arg.transcriptText;
    try {
      if (transcriptText?.trim()) {
        await setManualTranscript(sessionId, transcriptText.trim());
      }
      return await retrySummary(sessionId);
    } catch (err) {
      return rejectWithValue(getSummaryErrorMessage(err));
    }
  }
);

const summarySlice = createSlice({
  name: 'summary',
  initialState,
  reducers: {
    clearSummaryError(state) {
      state.lastError = null;
    },
    applySummarySocketEvent(
      state,
      action: PayloadAction<SummarySocketPayload>
    ) {
      const p = action.payload;
      state.statusBySession[p.sessionId] = {
        sessionId: p.sessionId,
        summaryId: p.summaryId,
        status: p.status,
      };
      if (p.summaryId && state.byId[p.summaryId]) {
        state.byId[p.summaryId].status = p.status as SummaryStatus;
      }
    },
    cacheSummary(state, action: PayloadAction<AiClassSummary>) {
      upsert(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(endSessionSummaryThunk.fulfilled, (state, action) => {
        state.statusBySession[action.payload.sessionId] = action.payload;
        state.lastEndedSessionId = action.payload.sessionId;
      })
      .addCase(endSessionSummaryThunk.rejected, (state, action) => {
        state.lastError = (action.payload as string) || 'Failed to end session';
      })
      .addCase(fetchSummaryStatusThunk.fulfilled, (state, action) => {
        state.statusBySession[action.payload.sessionId] = action.payload;
      })
      .addCase(fetchSummaryByIdThunk.pending, state => {
        state.detailLoading = true;
        state.lastError = null;
      })
      .addCase(fetchSummaryByIdThunk.fulfilled, (state, action) => {
        state.detailLoading = false;
        upsert(state, action.payload);
      })
      .addCase(fetchSummaryByIdThunk.rejected, (state, action) => {
        state.detailLoading = false;
        state.lastError = (action.payload as string) || 'Failed to load summary';
      })
      .addCase(fetchSessionSummaryThunk.pending, state => {
        state.detailLoading = true;
        state.lastError = null;
      })
      .addCase(fetchSessionSummaryThunk.fulfilled, (state, action) => {
        state.detailLoading = false;
        upsert(state, action.payload);
      })
      .addCase(fetchSessionSummaryThunk.rejected, (state, action) => {
        state.detailLoading = false;
        state.lastError = (action.payload as string) || 'Failed to load summary';
      })
      .addCase(fetchStudentSummariesThunk.pending, state => {
        state.listLoading = true;
        state.lastError = null;
      })
      .addCase(fetchStudentSummariesThunk.fulfilled, (state, action) => {
        state.listLoading = false;
        action.payload.items.forEach(s => upsert(state, s));
        const page = action.payload.pagination.page || 1;
        const ids = action.payload.items.map(s => s._id);
        state.studentListIds =
          page > 1 ? [...state.studentListIds, ...ids] : ids;
        state.studentPagination = {
          page,
          hasMore: action.payload.pagination.hasMore,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchStudentSummariesThunk.rejected, (state, action) => {
        state.listLoading = false;
        state.lastError = (action.payload as string) || 'Failed to load summaries';
      })
      .addCase(fetchTutorSummariesThunk.pending, state => {
        state.listLoading = true;
        state.lastError = null;
      })
      .addCase(fetchTutorSummariesThunk.fulfilled, (state, action) => {
        state.listLoading = false;
        action.payload.items.forEach(s => upsert(state, s));
        const page = action.payload.pagination.page || 1;
        const ids = action.payload.items.map(s => s._id);
        state.tutorListIds = page > 1 ? [...state.tutorListIds, ...ids] : ids;
        state.tutorPagination = {
          page,
          hasMore: action.payload.pagination.hasMore,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchTutorSummariesThunk.rejected, (state, action) => {
        state.listLoading = false;
        state.lastError = (action.payload as string) || 'Failed to load summaries';
      })
      .addCase(reviewSummaryThunk.pending, state => {
        state.mutating = true;
        state.lastError = null;
      })
      .addCase(reviewSummaryThunk.fulfilled, (state, action) => {
        state.mutating = false;
        upsert(state, action.payload);
      })
      .addCase(reviewSummaryThunk.rejected, (state, action) => {
        state.mutating = false;
        state.lastError = (action.payload as string) || 'Failed to save review';
      })
      .addCase(publishSummaryThunk.pending, state => {
        state.mutating = true;
        state.lastError = null;
      })
      .addCase(publishSummaryThunk.fulfilled, (state, action) => {
        state.mutating = false;
        upsert(state, action.payload);
      })
      .addCase(publishSummaryThunk.rejected, (state, action) => {
        state.mutating = false;
        state.lastError = (action.payload as string) || 'Failed to publish';
      })
      .addCase(setManualTranscriptThunk.pending, state => {
        state.mutating = true;
        state.lastError = null;
      })
      .addCase(setManualTranscriptThunk.fulfilled, state => {
        state.mutating = false;
      })
      .addCase(setManualTranscriptThunk.rejected, (state, action) => {
        state.mutating = false;
        state.lastError =
          (action.payload as string) || 'Could not save transcript';
      })
      .addCase(retrySummaryThunk.pending, state => {
        state.mutating = true;
        state.lastError = null;
      })
      .addCase(retrySummaryThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.statusBySession[action.payload.sessionId] = action.payload;
      })
      .addCase(retrySummaryThunk.rejected, (state, action) => {
        state.mutating = false;
        state.lastError = (action.payload as string) || 'Retry failed';
      });
  },
});

export const {
  clearSummaryError,
  applySummarySocketEvent,
  cacheSummary,
} = summarySlice.actions;

export default summarySlice.reducer;
