import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import bookingReducer from './booking/bookingSlice';
import chatReducer from './chat/chatSlice';
import summaryReducer from './summary/summarySlice';
import ratingReducer from './rating/ratingSlice';
import assessmentReducer from './assessment/assessmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    chat: chatReducer,
    summary: summaryReducer,
    rating: ratingReducer,
    assessment: assessmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
