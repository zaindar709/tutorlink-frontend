import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Booking,
  BookingMutationResult,
  BookingTab,
  ConfirmBookingPayload,
  CreateBookingPayload,
  ProposeReschedulePayload,
  RescheduleMutationResult,
} from '../../types/api.types';
import {
  acceptReschedule as acceptRescheduleRequest,
  cancelBooking as cancelBookingRequest,
  cancelReschedule as cancelRescheduleRequest,
  completeBooking as completeBookingRequest,
  confirmBooking as confirmBookingRequest,
  createBooking as createBookingRequest,
  fetchBookingById,
  fetchBookings as fetchBookingsRequest,
  proposeReschedule as proposeRescheduleRequest,
  rateBooking as rateBookingRequest,
  rejectReschedule as rejectRescheduleRequest,
} from '../../services/bookings/bookingsService';
import { listCacheKey } from '../../utils/bookings/bookingStatus';
import { getBookingErrorMessage } from '../../utils/bookings/bookingErrors';
import { getConfirmBookingErrorMessage } from '../../utils/bookings/bookingResponse';

type ListMeta = {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  ids: string[];
};

export type BookingState = {
  byId: Record<string, Booking>;
  lists: Record<string, ListMeta>;
  mutating: boolean;
  actionLoadingById: Record<string, boolean>;
  lastCreatedId: string | null;
  lastSessionAmount: number | null;
  lastError: string | null;
  lastErrorCode: string | null;
};

const emptyList = (): ListMeta => ({
  status: 'idle',
  error: null,
  ids: [],
});

const initialState: BookingState = {
  byId: {},
  lists: {},
  mutating: false,
  actionLoadingById: {},
  lastCreatedId: null,
  lastSessionAmount: null,
  lastError: null,
  lastErrorCode: null,
};

const upsertBooking = (state: BookingState, booking: Booking) => {
  state.byId[booking._id] = {
    ...state.byId[booking._id],
    ...booking,
  };
};

const upsertMany = (state: BookingState, bookings: Booking[]) => {
  bookings.forEach(b => upsertBooking(state, b));
};

const invalidateAllLists = (state: BookingState) => {
  Object.keys(state.lists).forEach(key => {
    state.lists[key] = { ...state.lists[key], status: 'idle' };
  });
};

const invalidateDateLists = (state: BookingState, date: string) => {
  const prefix = `${String(date).slice(0, 10)}|`;
  Object.keys(state.lists).forEach(key => {
    if (key.startsWith(prefix)) {
      state.lists[key] = {
        ...state.lists[key],
        status: 'idle',
      };
    }
  });
};

export const fetchBookingsThunk = createAsyncThunk<
  { date: string; tab: BookingTab; bookings: Booking[] },
  { date: string; tab: BookingTab },
  { rejectValue: string }
>('booking/fetchBookings', async ({ date, tab }, { rejectWithValue }) => {
  try {
    const bookings = await fetchBookingsRequest(date, tab);
    return { date, tab, bookings };
  } catch (error) {
    return rejectWithValue(getBookingErrorMessage(error));
  }
});

export const fetchBookingByIdThunk = createAsyncThunk<
  Booking | null,
  string,
  { rejectValue: string; state: { booking: BookingState } }
>(
  'booking/fetchBookingById',
  async (id, { getState, rejectWithValue, dispatch }) => {
    try {
      const cached = getState().booking.byId[id];
      if (cached) return cached;

      const direct = await fetchBookingById(id);
      if (direct) return direct;

      // Fallback: scan today's tabs (GET-by-id may be unsupported).
      const today = new Date().toISOString().slice(0, 10);
      for (const tab of ['pending', 'active', 'past'] as BookingTab[]) {
        const result = await dispatch(
          fetchBookingsThunk({ date: today, tab })
        ).unwrap();
        const found = result.bookings.find(b => b._id === id);
        if (found) return found;
      }
      return getState().booking.byId[id] ?? null;
    } catch (error) {
      return rejectWithValue(getBookingErrorMessage(error));
    }
  }
);

export const createBookingThunk = createAsyncThunk<
  Booking,
  CreateBookingPayload,
  { rejectValue: string; state: { booking: BookingState; auth: { user: import('../../types/api.types').ApiUser | null } } }
>('booking/createBooking', async (payload, { rejectWithValue, getState }) => {
  try {
    const booking = await createBookingRequest(payload);
    const authUser = getState().auth.user;
    // Ensure tutor-facing UIs show the logged-in student's name immediately
    // even if create response returns student as a bare id.
    if (authUser && typeof booking.student === 'string') {
      return {
        ...booking,
        student: {
          _id: booking.student,
          id: booking.student,
          name: authUser.name || authUser.fullName || 'Student',
          fullName: authUser.fullName || authUser.name,
          email: authUser.email,
          avatarUrl: authUser.avatarUrl,
          role: 'student',
        },
      };
    }
    if (
      authUser &&
      typeof booking.student === 'object' &&
      booking.student &&
      !booking.student.name &&
      !booking.student.fullName
    ) {
      return {
        ...booking,
        student: {
          ...booking.student,
          name: authUser.name || authUser.fullName || 'Student',
          fullName: authUser.fullName || authUser.name,
          avatarUrl: booking.student.avatarUrl || authUser.avatarUrl,
        },
      };
    }
    return booking;
  } catch (error) {
    return rejectWithValue(getBookingErrorMessage(error));
  }
});

export const confirmBookingThunk = createAsyncThunk<
  BookingMutationResult,
  { id: string; payload?: ConfirmBookingPayload },
  { rejectValue: string }
>('booking/confirmBooking', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await confirmBookingRequest(id, payload);
  } catch (error) {
    return rejectWithValue(getConfirmBookingErrorMessage(error));
  }
});

export const cancelBookingThunk = createAsyncThunk<
  BookingMutationResult,
  { id: string; actorRole?: 'student' | 'tutor' | 'parent' },
  {
    rejectValue: string;
    state: {
      booking: BookingState;
      auth: {
        user: import('../../types/api.types').ApiUser | null;
        role: 'student' | 'tutor' | 'parent' | null;
      };
    };
  }
>('booking/cancelBooking', async ({ id, actorRole }, { rejectWithValue, getState }) => {
  try {
    const previous = getState().booking.byId[id];
    const role = actorRole || getState().auth.role || undefined;
    return await cancelBookingRequest(id, {
      actorRole: role || undefined,
      previousStatus: previous?.status,
    });
  } catch (error) {
    return rejectWithValue(getBookingErrorMessage(error));
  }
});

export const completeBookingThunk = createAsyncThunk<
  BookingMutationResult,
  string,
  { rejectValue: string }
>('booking/completeBooking', async (id, { rejectWithValue }) => {
  try {
    return await completeBookingRequest(id);
  } catch (error) {
    return rejectWithValue(getBookingErrorMessage(error));
  }
});

export const rateBookingThunk = createAsyncThunk<
  { bookingId: string; rating: number; review?: string; ratedAt?: string },
  { bookingId: string; rating: number; review?: string },
  { rejectValue: string }
>('booking/rateBooking', async ({ bookingId, rating, review }, { rejectWithValue }) => {
  try {
    const result = await rateBookingRequest(bookingId, { rating, review });
    return {
      bookingId,
      rating: result?.rating ?? rating,
      review: result?.review ?? review,
      ratedAt: result?.ratedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    return rejectWithValue(getBookingErrorMessage(error));
  }
});

export const proposeRescheduleThunk = createAsyncThunk<
  RescheduleMutationResult,
  { id: string; payload: ProposeReschedulePayload },
  { rejectValue: string }
>('booking/proposeReschedule', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await proposeRescheduleRequest(id, payload);
  } catch (error) {
    return rejectWithValue(getBookingErrorMessage(error));
  }
});

export const acceptRescheduleThunk = createAsyncThunk<
  RescheduleMutationResult,
  string,
  { rejectValue: string }
>('booking/acceptReschedule', async (id, { rejectWithValue }) => {
  try {
    return await acceptRescheduleRequest(id);
  } catch (error) {
    return rejectWithValue(getBookingErrorMessage(error));
  }
});

export const rejectRescheduleThunk = createAsyncThunk<
  RescheduleMutationResult,
  string,
  { rejectValue: string }
>('booking/rejectReschedule', async (id, { rejectWithValue }) => {
  try {
    return await rejectRescheduleRequest(id);
  } catch (error) {
    return rejectWithValue(getBookingErrorMessage(error));
  }
});

export const cancelRescheduleThunk = createAsyncThunk<
  RescheduleMutationResult,
  string,
  { rejectValue: string }
>('booking/cancelReschedule', async (id, { rejectWithValue }) => {
  try {
    return await cancelRescheduleRequest(id);
  } catch (error) {
    return rejectWithValue(getBookingErrorMessage(error));
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError(state) {
      state.lastError = null;
      state.lastErrorCode = null;
    },
    upsertBookingLocal(state, action: PayloadAction<Booking>) {
      upsertBooking(state, action.payload);
    },
    invalidateBookingLists(state, action: PayloadAction<string | undefined>) {
      if (action.payload) {
        invalidateDateLists(state, action.payload);
        return;
      }
      Object.keys(state.lists).forEach(key => {
        state.lists[key] = { ...state.lists[key], status: 'idle' };
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBookingsThunk.pending, (state, action) => {
        const key = listCacheKey(action.meta.arg.date, action.meta.arg.tab);
        state.lists[key] = {
          ...(state.lists[key] || emptyList()),
          status: 'loading',
          error: null,
        };
      })
      .addCase(fetchBookingsThunk.fulfilled, (state, action) => {
        const { date, tab, bookings } = action.payload;
        const key = listCacheKey(date, tab);
        upsertMany(state, bookings);
        state.lists[key] = {
          status: 'succeeded',
          error: null,
          ids: bookings.map(b => b._id),
        };
      })
      .addCase(fetchBookingsThunk.rejected, (state, action) => {
        const key = listCacheKey(action.meta.arg.date, action.meta.arg.tab);
        state.lists[key] = {
          ...(state.lists[key] || emptyList()),
          status: 'failed',
          error: action.payload || 'Failed to load bookings',
          ids: state.lists[key]?.ids || [],
        };
        state.lastError = action.payload || 'Failed to load bookings';
      })
      .addCase(fetchBookingByIdThunk.fulfilled, (state, action) => {
        if (action.payload) upsertBooking(state, action.payload);
      })
      .addCase(createBookingThunk.pending, state => {
        state.mutating = true;
        state.lastError = null;
      })
      .addCase(createBookingThunk.fulfilled, (state, action) => {
        state.mutating = false;
        upsertBooking(state, action.payload);
        state.lastCreatedId = action.payload._id;
        invalidateDateLists(state, action.payload.date);
      })
      .addCase(createBookingThunk.rejected, (state, action) => {
        state.mutating = false;
        state.lastError = action.payload || 'Failed to create booking';
      })
      .addCase(confirmBookingThunk.pending, (state, action) => {
        state.mutating = true;
        state.actionLoadingById[action.meta.arg.id] = true;
        state.lastError = null;
      })
      .addCase(confirmBookingThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg.id] = false;
        upsertBooking(state, action.payload.booking);
        state.lastSessionAmount = action.payload.sessionAmount ?? null;
        invalidateAllLists(state);
      })
      .addCase(confirmBookingThunk.rejected, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg.id] = false;
        state.lastError = action.payload || 'Failed to confirm booking';
      })
      .addCase(cancelBookingThunk.pending, (state, action) => {
        state.mutating = true;
        state.actionLoadingById[action.meta.arg.id] = true;
        state.lastError = null;
      })
      .addCase(cancelBookingThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg.id] = false;
        upsertBooking(state, action.payload.booking);
        state.lastSessionAmount = action.payload.sessionAmount ?? null;
        invalidateAllLists(state);
      })
      .addCase(cancelBookingThunk.rejected, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg.id] = false;
        state.lastError = action.payload || 'Failed to cancel booking';
      })
      .addCase(completeBookingThunk.pending, (state, action) => {
        state.mutating = true;
        state.actionLoadingById[action.meta.arg] = true;
        state.lastError = null;
      })
      .addCase(completeBookingThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg] = false;
        upsertBooking(state, action.payload.booking);
        state.lastSessionAmount = action.payload.sessionAmount ?? null;
        invalidateAllLists(state);
      })
      .addCase(completeBookingThunk.rejected, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg] = false;
        state.lastError = action.payload || 'Failed to complete booking';
      })
      .addCase(rateBookingThunk.fulfilled, (state, action) => {
        const existing = state.byId[action.payload.bookingId];
        if (existing) {
          existing.studentRating = action.payload.rating;
          existing.studentReview = action.payload.review;
          existing.ratedAt = action.payload.ratedAt;
        }
      })
      .addCase(rateBookingThunk.rejected, (state, action) => {
        state.lastError = action.payload || 'Failed to submit rating';
      })
      .addCase(proposeRescheduleThunk.pending, (state, action) => {
        state.mutating = true;
        state.actionLoadingById[action.meta.arg.id] = true;
        state.lastError = null;
      })
      .addCase(proposeRescheduleThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg.id] = false;
        upsertBooking(state, action.payload.booking);
        invalidateAllLists(state);
      })
      .addCase(proposeRescheduleThunk.rejected, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg.id] = false;
        state.lastError = action.payload || 'Failed to propose reschedule';
      })
      .addCase(acceptRescheduleThunk.pending, (state, action) => {
        state.mutating = true;
        state.actionLoadingById[action.meta.arg] = true;
        state.lastError = null;
      })
      .addCase(acceptRescheduleThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg] = false;
        upsertBooking(state, action.payload.booking);
        invalidateAllLists(state);
      })
      .addCase(acceptRescheduleThunk.rejected, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg] = false;
        state.lastError = action.payload || 'Failed to accept reschedule';
      })
      .addCase(rejectRescheduleThunk.pending, (state, action) => {
        state.mutating = true;
        state.actionLoadingById[action.meta.arg] = true;
        state.lastError = null;
      })
      .addCase(rejectRescheduleThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg] = false;
        upsertBooking(state, action.payload.booking);
        invalidateAllLists(state);
      })
      .addCase(rejectRescheduleThunk.rejected, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg] = false;
        state.lastError = action.payload || 'Failed to reject reschedule';
      })
      .addCase(cancelRescheduleThunk.pending, (state, action) => {
        state.mutating = true;
        state.actionLoadingById[action.meta.arg] = true;
        state.lastError = null;
      })
      .addCase(cancelRescheduleThunk.fulfilled, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg] = false;
        upsertBooking(state, action.payload.booking);
        invalidateAllLists(state);
      })
      .addCase(cancelRescheduleThunk.rejected, (state, action) => {
        state.mutating = false;
        state.actionLoadingById[action.meta.arg] = false;
        state.lastError = action.payload || 'Failed to cancel reschedule';
      });
  },
});

export const {
  clearBookingError,
  upsertBookingLocal,
  invalidateBookingLists,
} = bookingSlice.actions;

export default bookingSlice.reducer;
