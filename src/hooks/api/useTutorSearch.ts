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
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);

  const search = useCallback(
    async (
      override?: TutorSearchPayload,
      opts?: { replace?: boolean }
    ) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const payload = opts?.replace
          ? { ...(override || {}) }
          : override
            ? { ...filtersRef.current, ...override }
            : { ...filtersRef.current };

        filtersRef.current = payload;
        console.log('[TutorSearch] hook request', payload);
        const results = await searchTutors(payload);
        if (requestId !== requestIdRef.current) return;
        console.log(
          '[TutorSearch] hook results',
          results.length,
          results.map(t => t.user?.name)
        );
        setTutors(results);
        if (results.length === 0) {
          setError(null);
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        const message = getApiErrorMessage(err);
        console.warn('[TutorSearch] hook error', message, err);
        setError(message);
        setTutors([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!autoLoad || hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    void search(initialFilters, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tutors,
    loading,
    error,
    search,
  };
};
