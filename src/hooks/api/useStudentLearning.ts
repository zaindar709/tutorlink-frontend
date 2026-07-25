import { useCallback, useEffect, useState } from 'react';
import {
  fetchCertificates,
  fetchSessionHistory,
  getCertificateDownloadUrl,
  rateCompletedSession,
} from '../../services/profile/profileService';
import {
  StudentCertificateItem,
  StudentSessionHistoryItem,
} from '../../types/api.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export const useSessionHistory = (
  status: 'all' | 'completed' | 'cancelled' | 'missed' = 'all'
) => {
  const [sessions, setSessions] = useState<StudentSessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchSessionHistory({ status, limit: 50 });
      setSessions(items);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const rateSession = async (
    bookingId: string,
    rating: number,
    review?: string
  ) => {
    setActionLoading(true);
    setError(null);
    try {
      await rateCompletedSession(bookingId, rating, review);
      setSessions(prev =>
        prev.map(s => (s.id === bookingId ? { ...s, rating } : s))
      );
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    sessions,
    loading,
    error,
    actionLoading,
    refresh: load,
    rateSession,
  };
};

export const useCertificates = (filter: 'all' | 'recent' = 'all') => {
  const [certificates, setCertificates] = useState<StudentCertificateItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchCertificates({ filter, limit: 50 });
      setCertificates(items);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const download = async (id: string) => {
    try {
      return await getCertificateDownloadUrl(id);
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    }
  };

  return { certificates, loading, error, refresh: load, download };
};
