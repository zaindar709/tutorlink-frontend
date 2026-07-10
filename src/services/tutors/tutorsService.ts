import { searchTutorsAPI } from '../../api/tutors.api';
import { TutorProfile, TutorSearchPayload } from '../../types/api.types';

export const searchTutors = async (
  filters: TutorSearchPayload
): Promise<TutorProfile[]> => {
  const response = await searchTutorsAPI(filters);
  return response.data.data ?? [];
};
