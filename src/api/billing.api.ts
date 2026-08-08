import api from './client';
import { ApiSuccessResponse, RaiseDisputePayload } from '../types/api.types';

export const raiseDisputeAPI = (data: RaiseDisputePayload) =>
  api.post<ApiSuccessResponse<unknown>>('/api/billing/disputes/raise', data);
