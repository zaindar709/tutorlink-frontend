import { useCallback, useEffect, useState } from 'react';
import {
  fetchTutorAvailability,
  saveTutorAvailability,
} from '../../services/schedule/scheduleService';
import {
  TutorAvailability,
  TutorAvailabilityDay,
  UpdateTutorAvailabilityPayload,
} from '../../types/api.types';
import { getBookingErrorMessage } from '../../utils/bookings/bookingErrors';

export const useTutorAvailability = () => {
  const [availability, setAvailability] = useState<TutorAvailability | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTutorAvailability();
      setAvailability(data);
    } catch (err) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (days: TutorAvailabilityDay[]) => {
    setSaving(true);
    setError(null);
    try {
      const payload: UpdateTutorAvailabilityPayload = { days };
      const data = await saveTutorAvailability(payload);
      setAvailability(data);
      return data;
    } catch (err) {
      const message = getBookingErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    availability,
    loading,
    saving,
    error,
    refresh: load,
    save,
  };
};
