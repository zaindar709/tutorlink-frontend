import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  depositToWallet,
  fetchWalletBalance,
  fetchWalletTransactions,
} from '../../services/wallet/walletService';
import { RootState } from '../../store/store';
import {
  WalletBalance,
  WalletDepositPayload,
  WalletTransaction,
} from '../../types/api.types';
import { getUserId } from '../../utils/api/userId';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export const useWallet = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = getUserId(user as any);

  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [balanceData, transactionData] = await Promise.all([
        fetchWalletBalance(userId),
        fetchWalletTransactions(userId, 1, 20),
      ]);
      setBalance(balanceData);
      setTransactions(transactionData.transactions);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const deposit = async (payload: WalletDepositPayload) => {
    setDepositing(true);
    setError(null);
    try {
      await depositToWallet(payload);
      await loadWallet();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setDepositing(false);
    }
  };

  return {
    balance,
    transactions,
    loading,
    depositing,
    error,
    refresh: loadWallet,
    deposit,
  };
};
