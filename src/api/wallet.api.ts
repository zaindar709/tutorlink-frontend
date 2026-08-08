import api from './client';
import {
  ApiSuccessResponse,
  PaginationMeta,
  WalletBalance,
  WalletDepositPayload,
  WalletTransaction,
} from '../types/api.types';

export const getWalletBalanceAPI = (userId: string) => {
  return api.get<ApiSuccessResponse<WalletBalance>>(
    `/api/wallet/balance/${userId}`
  );
};

export const getWalletTransactionsAPI = (
  userId: string,
  page = 1,
  limit = 10
) => {
  return api.get<
    ApiSuccessResponse<WalletTransaction[]> & { pagination?: PaginationMeta }
  >(`/api/wallet/transactions/${userId}`, {
    params: { page, limit },
  });
};

export const depositWalletAPI = (data: WalletDepositPayload) => {
  const body: WalletDepositPayload = {
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    phoneNumber: data.phoneNumber,
  };
  if (data.isMock || data.mock) {
    body.isMock = true;
    body.mock = true;
  }
  return api.post<ApiSuccessResponse<WalletTransaction>>(
    '/api/wallet/deposit',
    body
  );
};
