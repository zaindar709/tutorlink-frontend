import api from './client';
import { ApiSuccessResponse, TutorOnboardingStatusData } from '../types/api.types';

export type TutorProfileUpdatePayload = {
  name?: string;
  phoneNumber?: string;
  bio?: string;
  qualification?: string;
  experience?: string;
  experienceYears?: number;
  hourlyRate: number;
  availability?: boolean;
  subject?: string;
  subjects?: string[];
  grades?: string[];
};

/** Approved-tutor profile fields used by booking (rate + availability). */
export const updateTutorProfileAPI = (data: TutorProfileUpdatePayload) =>
  api.patch<ApiSuccessResponse<TutorOnboardingStatusData>>(
    '/api/tutor/profile',
    data
  );

export const updateTutorMeAPI = (data: TutorProfileUpdatePayload) =>
  api.patch<ApiSuccessResponse<TutorOnboardingStatusData>>(
    '/api/tutor/me',
    data
  );
