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
  const raw = response.data.data as TutorDaySchedule;

  // Deduplicate booked/free items client-side in case backend returns
  // repeated entries for the same booking or slot. Keep the first
  // occurrence for stability.
  const items = Array.isArray(raw.items) ? raw.items : [];
  const seen = new Set<string>();
  const deduped: TutorScheduleItem[] = [];

  items.forEach(it => {
    if ((it as any).kind === 'booked') {
      const b = it as TutorScheduleBookedItem;
      const key = b.bookingId || `${b.startTime}-${b.endTime}-${b.student?._id}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(it);
      }
    } else {
      // free slot
      const f = it as TutorScheduleFreeItem;
      const key = `free-${f.startTime}-${f.endTime}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(it);
      }
    }
  });

  return {
    ...raw,
    items: deduped,
  };
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
