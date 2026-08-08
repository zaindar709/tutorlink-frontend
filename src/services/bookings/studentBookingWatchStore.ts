import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@TutorLink:studentWatchedPendingBookings';

const readIds = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
};

const writeIds = async (ids: string[]) => {
  const unique = Array.from(new Set(ids.map(String).filter(Boolean)));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
};

/** Track a pending booking so the student app can detect accept/reject. */
export const watchStudentPendingBooking = async (bookingId?: string | null) => {
  const id = String(bookingId || '').trim();
  if (!id) return;
  const ids = await readIds();
  if (ids.includes(id)) return;
  await writeIds([...ids, id]);
};

export const unwatchStudentPendingBooking = async (bookingId?: string | null) => {
  const id = String(bookingId || '').trim();
  if (!id) return;
  const ids = await readIds();
  await writeIds(ids.filter(item => item !== id));
};

export const listWatchedStudentPendingBookings = async (): Promise<string[]> =>
  readIds();
