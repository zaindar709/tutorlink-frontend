import { MOCK_WALLET_DEPOSITS } from '../../config/features';
import { WalletDepositPayload } from '../../types/api.types';
import { depositToWallet, fetchWalletBalance } from './walletService';

/** Preset chips on Wallet → Add Mock Funds (FYP demo). */
export const MOCK_WALLET_PRESETS = [1_000, 2_500, 5_000, 10_000] as const;

/** Recognizable mock JazzCash / Easypaisa number for demos. */
export const MOCK_WALLET_PHONE = '03001234567';

export const isMockWalletPhone = (phone?: string | null): boolean =>
  Boolean(phone && phone.replace(/\D/g, '') === MOCK_WALLET_PHONE);

export const buildMockDepositPayload = (
  amount: number,
  paymentMethod: 'jazzcash' | 'easypaisa' = 'jazzcash',
  phoneNumber: string = MOCK_WALLET_PHONE
): WalletDepositPayload => ({
  amount,
  paymentMethod,
  phoneNumber: phoneNumber.replace(/\D/g, '').slice(0, 11) || MOCK_WALLET_PHONE,
  isMock: true,
  mock: true,
});

/**
 * Credits the student wallet through the real deposit API, marked as mock.
 * Backend may ignore isMock/mock flags; jazzcash deposit typically still credits in demo APIs.
 */
export const depositMockFunds = async (
  amount: number,
  options?: {
    paymentMethod?: 'jazzcash' | 'easypaisa';
    phoneNumber?: string;
  }
) => {
  if (!MOCK_WALLET_DEPOSITS) {
    throw new Error('Mock wallet deposits are disabled.');
  }
  if (!amount || amount <= 0) {
    throw new Error('Enter a valid mock amount.');
  }

  return depositToWallet(
    buildMockDepositPayload(
      amount,
      options?.paymentMethod ?? 'jazzcash',
      options?.phoneNumber ?? MOCK_WALLET_PHONE
    )
  );
};

export const getAvailableWalletBalance = async (
  userId?: string | null
): Promise<number> => {
  if (!userId) return 0;
  const balance = await fetchWalletBalance(userId);
  return Math.max(
    0,
    (balance.totalBalance ?? 0) - (balance.escrowBalance ?? 0)
  );
};
