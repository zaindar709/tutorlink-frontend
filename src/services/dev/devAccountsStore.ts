import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthRole } from '../auth/authService';

const DEV_ACCOUNTS_KEY = '@TutorLink:devAccounts';

export type DevAccount = {
  id: string;
  label: string;
  email: string;
  password: string;
  role: AuthRole;
  updatedAt: string;
};

export const loadDevAccounts = async (): Promise<DevAccount[]> => {
  try {
    const raw = await AsyncStorage.getItem(DEV_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DevAccount[]) : [];
  } catch {
    return [];
  }
};

export const saveDevAccounts = async (accounts: DevAccount[]) => {
  await AsyncStorage.setItem(DEV_ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const upsertDevAccount = async (
  account: Omit<DevAccount, 'id' | 'updatedAt'> & { id?: string }
): Promise<DevAccount[]> => {
  const list = await loadDevAccounts();
  const email = account.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const existingIndex = list.findIndex(
    a => a.email.toLowerCase() === email && a.role === account.role
  );

  const next: DevAccount = {
    id:
      account.id ||
      (existingIndex >= 0 ? list[existingIndex].id : `${account.role}-${Date.now()}`),
    label: account.label.trim() || `${account.role} · ${email}`,
    email,
    password: account.password,
    role: account.role,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    list[existingIndex] = next;
  } else {
    list.unshift(next);
  }

  await saveDevAccounts(list);
  return list;
};

export const removeDevAccount = async (id: string): Promise<DevAccount[]> => {
  const list = (await loadDevAccounts()).filter(a => a.id !== id);
  await saveDevAccounts(list);
  return list;
};
