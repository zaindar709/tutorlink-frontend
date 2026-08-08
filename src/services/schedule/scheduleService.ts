import {
  getTutorAvailabilityAPI,
  getTutorDayScheduleAPI,
  updateTutorAvailabilityAPI,
} from '../../api/schedule.api';
import {
  TutorAvailability,
  TutorDaySchedule,
  UpdateTutorAvailabilityPayload,
} from '../../types/api.types';

export const fetchTutorDaySchedule = async (
  date: string
): Promise<TutorDaySchedule> => {
  const response = await getTutorDayScheduleAPI(date);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to load schedule');
  }
  return response.data.data;
};

export const fetchTutorAvailability = async (): Promise<TutorAvailability> => {
  const response = await getTutorAvailabilityAPI();
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to load availability');
  }
  return response.data.data;
};

export const saveTutorAvailability = async (
  payload: UpdateTutorAvailabilityPayload
): Promise<TutorAvailability> => {
  const response = await updateTutorAvailabilityAPI(payload);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to save availability');
  }
  return response.data.data;
};
