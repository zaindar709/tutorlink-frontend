import api from './client';
import { ApiSuccessResponse, TutorProfile, TutorSearchPayload } from '../types/api.types';

export const searchTutorsAPI = (data: TutorSearchPayload) => {
  // Render free tier can cold-start slowly; keep this call patient.
  return api.post<ApiSuccessResponse<TutorProfile[]>>(
    '/api/tutors/search',
    data,
    { timeout: 45000 }
  );
};
