import api from './client';
import {
  ApiSuccessResponse,
  TutorOnboardingStatusData,
} from '../types/api.types';

export const getTutorOnboardingStatusAPI = () => {
  return api.get<ApiSuccessResponse<TutorOnboardingStatusData>>(
    '/api/tutor/onboarding/status'
  );
};

export const submitTutorOnboardingStep1API = (data: {
  subject: string;
  grades: string[];
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
      headers: { 'Content-Type': 'multipart/form-data' },
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
