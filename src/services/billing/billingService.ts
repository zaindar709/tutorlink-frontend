import { raiseDisputeAPI } from '../../api/billing.api';
import { RaiseDisputePayload } from '../../types/api.types';

export const raiseDispute = async (payload: RaiseDisputePayload) => {
  const response = await raiseDisputeAPI(payload);
  return response.data;
};
