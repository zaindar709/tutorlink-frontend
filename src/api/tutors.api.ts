import api from './client';
import { ApiSuccessResponse, TutorProfile, TutorSearchPayload } from '../types/api.types';

export const searchTutorsAPI = (data: TutorSearchPayload) => {
  return api.post<ApiSuccessResponse<TutorProfile[]>>('/api/tutors/search', data);
};
