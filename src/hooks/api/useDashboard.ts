import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDashboard } from '../../services/home/homeService';
import { DashboardData } from '../../types/api.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasDataRef = useRef(false);

  const loadDashboard = useCallback(async () => {
    setError(null);
    if (!hasDataRef.current) setLoading(true);
    try {
      const dashboard = await fetchDashboard();
      hasDataRef.current = true;
      setData(dashboard);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { data, loading, error, refresh: loadDashboard };
};
