import api from './client';
import { ApiSuccessResponse, DashboardData } from '../types/api.types';

export const getDashboardAPI = () => {
  return api.get<ApiSuccessResponse<DashboardData>>('/api/home/dashboard');
};
