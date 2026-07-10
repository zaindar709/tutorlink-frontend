import { AxiosError } from 'axios';
import { getFirebaseIdToken } from '../auth/firebaseAuthService';
import { getAuthProfileAPI } from '../../api/auth.api';
import {
  generateLinkCodeAPI,
  getMyProfileAPI,
  redeemLinkCodeAPI,
  updateInterestsAPI,
  updateMyProfileAPI,
} from '../../api/profile.api';
import { getAuthSession, saveAuthSession } from '../storage';
import {
  LinkCodeData,
  RedeemLinkCodePayload,
  StudentProfile,
  UpdateInterestsPayload,
  UpdateProfilePayload,
} from '../../types/api.types';
import { getUserId } from '../../utils/api/userId';

const extractProfile = (payload: any): StudentProfile | null => {
  if (!payload) return null;
  return payload.data ?? payload;
};

export const fetchMyProfile = async (): Promise<StudentProfile> => {
  const response = await getMyProfileAPI();
  const profile = extractProfile(response.data);
  if (!profile) {
    throw new Error('Profile is unavailable');
  }
  return profile;
};

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<StudentProfile> => {
  const response = await updateMyProfileAPI(payload);
  const profile = extractProfile(response.data);
  if (!profile) {
    throw new Error('Failed to update profile');
  }
  return profile;
};

export const updateInterests = async (
  payload: UpdateInterestsPayload
): Promise<{ interests: string[]; interestsCount: number }> => {
  const response = await updateInterestsAPI(payload);
  return response.data;
};

export const completeStudentOnboarding = async (payload: {
  interests: string[];
  grade: string;
}): Promise<void> => {
  await getFirebaseIdToken(true);

  const session = await getAuthSession();
  const userId = getUserId(session?.user ?? null);

  if (userId) {
    await getAuthProfileAPI(userId);
  }

  await updateMyProfileAPI({ grade: payload.grade });
  await updateInterestsAPI({ interests: payload.interests });

  if (session) {
    await saveAuthSession({
      ...session,
      user: {
        ...session.user,
        grade: payload.grade,
        interests: payload.interests,
      },
    });
  }
};

export const generateParentLinkCode = async (): Promise<LinkCodeData> => {
  const response = await generateLinkCodeAPI();
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to generate link code');
  }
  return response.data.data;
};

export const redeemParentLinkCode = async (
  payload: RedeemLinkCodePayload
): Promise<void> => {
  await redeemLinkCodeAPI(payload);
};

export const isNotFoundError = (error: unknown): boolean =>
  error instanceof AxiosError && error.response?.status === 404;
