import api from './client';
import {
  ApiSuccessResponse,
  TutorAvailability,
  TutorDaySchedule,
  UpdateTutorAvailabilityPayload,
} from '../types/api.types';

export const getTutorDayScheduleAPI = (date: string) => {
  return api.get<ApiSuccessResponse<TutorDaySchedule>>('/api/tutor/schedule', {
    params: { date },
  });
};

export const getTutorAvailabilityAPI = () => {
  return api.get<ApiSuccessResponse<TutorAvailability>>(
    '/api/tutor/schedule/availability'
  );
};

export const updateTutorAvailabilityAPI = (
  payload: UpdateTutorAvailabilityPayload
) => {
  return api.put<ApiSuccessResponse<TutorAvailability>>(
    '/api/tutor/schedule/availability',
    payload
  );
};
