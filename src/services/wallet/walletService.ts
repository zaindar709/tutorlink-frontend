import {
  depositWalletAPI,
  getWalletBalanceAPI,
  getWalletTransactionsAPI,
} from '../../api/wallet.api';
import {
  WalletBalance,
  WalletDepositPayload,
  WalletTransaction,
} from '../../types/api.types';

export const fetchWalletBalance = async (
  userId: string
): Promise<WalletBalance> => {
  const response = await getWalletBalanceAPI(userId);
  if (!response.data.data) {
    throw new Error('Wallet balance is unavailable');
  }
  return response.data.data;
};

export const fetchWalletTransactions = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<{ transactions: WalletTransaction[]; total: number }> => {
  const response = await getWalletTransactionsAPI(userId, page, limit);
  return {
    transactions: response.data.data ?? [],
    total: response.data.pagination?.total ?? response.data.results ?? 0,
  };
};

export const depositToWallet = async (
  payload: WalletDepositPayload
): Promise<WalletTransaction> => {
  const response = await depositWalletAPI(payload);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Deposit failed');
  }
  return response.data.data;
};
