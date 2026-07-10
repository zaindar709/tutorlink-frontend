import { getDashboardAPI } from '../../api/home.api';
import { DashboardData } from '../../types/api.types';

export const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await getDashboardAPI();
  if (!response.data.data) {
    throw new Error('Dashboard data is unavailable');
  }
  return response.data.data;
};
