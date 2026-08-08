import api from './client';
import {
  ApiSuccessResponse,
  TutorOnboardingStatusData,
} from '../types/api.types';

export const getTutorOnboardingStatusAPI = (config?: { timeout?: number }) => {
  return api.get<ApiSuccessResponse<TutorOnboardingStatusData>>(
    '/api/tutor/onboarding/status',
    config
  );
};

export const submitTutorOnboardingStep1API = (data: {
  subject: string;
  grades: string[];
  hourlyRate?: number;
  availability?: boolean;
  qualification?: string;
  experience?: string;
  experienceYears?: number;
  bio?: string;
  name?: string;
  phoneNumber?: string;
}) => {
  return api.patch<ApiSuccessResponse<TutorOnboardingStatusData>>(
    '/api/tutor/onboarding/step-1',
    data
  );
};

export const uploadTutorDocumentsAPI = (formData: FormData) => {
  return api.post<ApiSuccessResponse<TutorOnboardingStatusData>>(
    '/api/tutor/onboarding/documents',
    formData,
    {
      timeout: 120000,
      transformRequest: data => data,
    }
  );
};

export const scheduleTutorOnboardingInterviewAPI = (data: {
  interviewDate: string;
}) => {
  return api.post<ApiSuccessResponse<TutorOnboardingStatusData>>(
    '/api/tutor/onboarding/interview',
    data
  );
};
