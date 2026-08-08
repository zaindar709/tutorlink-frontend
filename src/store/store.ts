import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import bookingReducer from './booking/bookingSlice';
import chatReducer from './chat/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
