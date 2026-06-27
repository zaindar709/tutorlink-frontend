import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiUser } from '../../types/api.types';

export type User = ApiUser;

interface AuthState {
  user: User | null;
  token: string | null;
  role: 'student' | 'tutor' | 'parent' | null;
  loading: boolean;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  role: null,
  loading: false,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setUser: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        role: AuthState['role'];
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isLoggedIn = true;
    },

    setRole: (
      state,
      action: PayloadAction<'student' | 'tutor' | 'parent'>
    ) => {
      state.role = action.payload;
    },

    logout: state => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setLoading, setUser, setRole, logout } =
  authSlice.actions;

export default authSlice.reducer;
