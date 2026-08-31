import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rateBooking as rateBookingRequest } from '../../services/bookings/bookingsService';
import { getBookingErrorMessage } from '../../utils/bookings/bookingErrors';
import { publishLiveRatingToAdmin } from '../../services/ratings/liveRatingsSync';

const STORAGE_KEY = '@TutorLink:tutorRatings';

export type TutorRatingEntry = {
  id: string;
  bookingId: string;
  tutorId: string;
  tutorName: string;
  studentId?: string;
  studentName?: string;
  subject?: string;
  rating: number;
  liked: boolean;
  review?: string;
  ratedAt: string;
};

export type PendingRateModal = {
  bookingId: string;
  sessionId: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  studentName?: string;
} | null;

type RatingState = {
  entries: TutorRatingEntry[];
  pendingModal: PendingRateModal;
  submitting: boolean;
  lastError: string | null;
  hydrated: boolean;
};

const initialState: RatingState = {
  entries: [],
  pendingModal: null,
  submitting: false,
  lastError: null,
  hydrated: false,
};

const persistEntries = (entries: TutorRatingEntry[]) => {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch(
    () => undefined
  );
};

const syncEntryToAdmin = async (entry: TutorRatingEntry) => {
  try {
    return await publishLiveRatingToAdmin(entry);
  } catch {
    return false;
  }
};

export const hydrateRatingsThunk = createAsyncThunk(
  'rating/hydrate',
  async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [] as TutorRatingEntry[];
      const parsed = JSON.parse(raw);
      const entries = Array.isArray(parsed)
        ? (parsed as TutorRatingEntry[])
        : [];
      // Push any locally saved ratings to admin (if dashboard is up).
      await Promise.all(entries.map(entry => syncEntryToAdmin(entry)));
      return entries;
    } catch {
      return [] as TutorRatingEntry[];
    }
  }
);

export const submitTutorRatingThunk = createAsyncThunk<
  TutorRatingEntry & { syncedToAdmin: boolean },
  {
    bookingId: string;
    tutorId: string;
    tutorName: string;
    subject?: string;
    studentId?: string;
    studentName?: string;
    rating: number;
    liked: boolean;
    review?: string;
  },
  { rejectValue: string }
>('rating/submit', async payload => {
  const ratedAt = new Date().toISOString();
  const entry: TutorRatingEntry = {
    id: `${payload.bookingId}-${ratedAt}`,
    bookingId: payload.bookingId,
    tutorId: payload.tutorId,
    tutorName: payload.tutorName,
    studentId: payload.studentId,
    studentName: payload.studentName,
    subject: payload.subject,
    rating: payload.rating,
    liked: payload.liked,
    review: payload.review,
    ratedAt,
  };

  try {
    await rateBookingRequest(payload.bookingId, {
      rating: payload.rating,
      review: payload.review,
    });
  } catch (error) {
    const msg = getBookingErrorMessage(error);
    if (__DEV__) {
      console.warn('[rating] API rate failed — saved locally', msg);
    }
  }

  const syncedToAdmin = await syncEntryToAdmin(entry);
  return { ...entry, syncedToAdmin };
});

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    openRateTutorModal(
      state,
      action: PayloadAction<NonNullable<PendingRateModal>>
    ) {
      state.pendingModal = action.payload;
      state.lastError = null;
    },
    closeRateTutorModal(state) {
      state.pendingModal = null;
    },
    clearRatingError(state) {
      state.lastError = null;
    },
    addLocalRating(state, action: PayloadAction<TutorRatingEntry>) {
      const next = [
        action.payload,
        ...state.entries.filter(e => e.bookingId !== action.payload.bookingId),
      ];
      state.entries = next;
      persistEntries(next);
      void syncEntryToAdmin(action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateRatingsThunk.fulfilled, (state, action) => {
        state.entries = action.payload;
        state.hydrated = true;
      })
      .addCase(hydrateRatingsThunk.rejected, state => {
        state.hydrated = true;
      })
      .addCase(submitTutorRatingThunk.pending, state => {
        state.submitting = true;
        state.lastError = null;
      })
      .addCase(submitTutorRatingThunk.fulfilled, (state, action) => {
        state.submitting = false;
        const { syncedToAdmin: _synced, ...entry } = action.payload;
        const next = [
          entry,
          ...state.entries.filter(e => e.bookingId !== entry.bookingId),
        ];
        state.entries = next;
        state.pendingModal = null;
        persistEntries(next);
      })
      .addCase(submitTutorRatingThunk.rejected, (state, action) => {
        state.submitting = false;
        state.lastError = action.payload || 'Failed to submit rating';
      });
  },
});

export const {
  openRateTutorModal,
  closeRateTutorModal,
  clearRatingError,
  addLocalRating,
} = ratingSlice.actions;

export default ratingSlice.reducer;

export const selectTutorAvgRating = (
  entries: TutorRatingEntry[],
  tutorId: string
): { avg: number; count: number; likes: number } => {
  const list = entries.filter(e => e.tutorId === tutorId);
  if (!list.length) return { avg: 0, count: 0, likes: 0 };
  const sum = list.reduce((a, e) => a + e.rating, 0);
  return {
    avg: Math.round((sum / list.length) * 10) / 10,
    count: list.length,
    likes: list.filter(e => e.liked).length,
  };
};
