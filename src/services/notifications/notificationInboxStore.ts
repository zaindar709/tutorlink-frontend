import { AppNotification } from '../../types/notification.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@TutorLink:notificationCenter';
const MAX_ITEMS = 100;

let memoryCache: AppNotification[] | null = null;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach(cb => cb());
};

export const subscribeNotificationInbox = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const readStore = async (): Promise<AppNotification[]> => {
  if (memoryCache) {
    return memoryCache;
  }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    memoryCache = raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    memoryCache = [];
  }
  return memoryCache;
};

const writeStore = async (items: AppNotification[]) => {
  memoryCache = items.slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
  notify();
};

const matchesRecipient = (
  item: AppNotification,
  userId?: string | null
): boolean => {
  if (!userId) return true;
  const recipient =
    item.recipientUserId ||
    item.data?.recipientUserId ||
    item.data?.userId;
  // Legacy items without recipient stay visible to everyone on this device.
  if (!recipient) return true;
  return String(recipient) === String(userId);
};

export const getNotificationInbox = async (
  userId?: string | null
): Promise<AppNotification[]> => {
  const items = await readStore();
  return [...items]
    .filter(item => matchesRecipient(item, userId))
    .sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );
};

export const upsertNotification = async (
  item: AppNotification
): Promise<AppNotification> => {
  const existing = await readStore();
  const withoutDup = existing.filter(n => n.id !== item.id);
  await writeStore([item, ...withoutDup]);
  return item;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  const existing = await readStore();
  await writeStore(
    existing.map(n => (n.id === id ? { ...n, read: true } : n))
  );
};

export const markAllNotificationsRead = async (
  userId?: string | null
): Promise<void> => {
  const existing = await readStore();
  await writeStore(
    existing.map(n =>
      matchesRecipient(n, userId) ? { ...n, read: true } : n
    )
  );
};

export const deleteNotification = async (id: string): Promise<void> => {
  const existing = await readStore();
  await writeStore(existing.filter(n => n.id !== id));
};

export const clearNotificationInbox = async (
  userId?: string | null
): Promise<void> => {
  if (!userId) {
    await writeStore([]);
    return;
  }
  const existing = await readStore();
  await writeStore(existing.filter(n => !matchesRecipient(n, userId)));
};

export const getUnreadNotificationCount = async (
  userId?: string | null
): Promise<number> => {
  const items = await readStore();
  return items.filter(n => !n.read && matchesRecipient(n, userId)).length;
};
