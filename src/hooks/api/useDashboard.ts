import { useCallback, useEffect, useState } from 'react';
import { fetchDashboard } from '../../services/home/homeService';
import { DashboardData } from '../../types/api.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await fetchDashboard();
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
