import { useCallback, useEffect, useRef, useState } from 'react';
import { searchTutors } from '../../services/tutors/tutorsService';
import { TutorProfile, TutorSearchPayload } from '../../types/api.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export const useTutorSearch = (
  initialFilters: TutorSearchPayload = {},
  options?: { autoLoad?: boolean }
) => {
  const autoLoad = options?.autoLoad !== false;
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const filtersRef = useRef<TutorSearchPayload>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const search = useCallback(async (override?: TutorSearchPayload) => {
    setLoading(true);
    setError(null);

    try {
      const payload = override
        ? { ...filtersRef.current, ...override }
        : { ...filtersRef.current };

      filtersRef.current = payload;
      const results = await searchTutors(payload);
      setTutors(results);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setTutors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoLoad || hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    search(initialFilters);
    // Load once when the screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tutors,
    loading,
    error,
    search,
  };
};
