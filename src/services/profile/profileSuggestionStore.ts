import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProfileSuggestionRole = 'student' | 'tutor';

const resolveUserKey = (userId?: string | null) =>
  String(userId || '').trim();

const dismissKey = (role: ProfileSuggestionRole, userId?: string | null) => {
  const key = resolveUserKey(userId);
  if (!key) return null;
  return `@TutorLink:profileSuggestionDismissed:${role}:${key}`;
};

const neededKey = (role: ProfileSuggestionRole, userId?: string | null) => {
  const key = resolveUserKey(userId);
  if (!key) return null;
  return `@TutorLink:profileSuggestionNeeded:${role}:${key}`;
};

export const markProfileSuggestionNeeded = async (
  role: ProfileSuggestionRole,
  userId?: string | null
): Promise<void> => {
  const key = neededKey(role, userId);
  if (!key) return;
  try {
    await AsyncStorage.setItem(key, '1');
    // New signup should always see the banner — clear any stale dismiss.
    const dismissed = dismissKey(role, userId);
    if (dismissed) await AsyncStorage.removeItem(dismissed);
  } catch {
    // ignore
  }
};

export const clearProfileSuggestionNeeded = async (
  role: ProfileSuggestionRole,
  userId?: string | null
): Promise<void> => {
  const key = neededKey(role, userId);
  if (!key) return;
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const isProfileSuggestionNeeded = async (
  role: ProfileSuggestionRole,
  userId?: string | null
): Promise<boolean> => {
  const key = neededKey(role, userId);
  if (!key) return false;
  try {
    return (await AsyncStorage.getItem(key)) === '1';
  } catch {
    return false;
  }
};

export const isProfileSuggestionDismissed = async (
  role: ProfileSuggestionRole,
  userId?: string | null
): Promise<boolean> => {
  const key = dismissKey(role, userId);
  if (!key) return false; // never treat anonymous/guest as dismissed
  try {
    return (await AsyncStorage.getItem(key)) === '1';
  } catch {
    return false;
  }
};

export const dismissProfileSuggestion = async (
  role: ProfileSuggestionRole,
  userId?: string | null
): Promise<void> => {
  const key = dismissKey(role, userId);
  if (!key) return;
  try {
    await AsyncStorage.setItem(key, '1');
    await clearProfileSuggestionNeeded(role, userId);
  } catch {
    // ignore
  }
};

export const clearProfileSuggestionDismiss = async (
  role: ProfileSuggestionRole,
  userId?: string | null
): Promise<void> => {
  const key = dismissKey(role, userId);
  if (!key) return;
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
};

/** Should the Profile tab show the completion banner? */
export const shouldShowProfileSuggestion = async (
  role: ProfileSuggestionRole,
  userId: string | null | undefined,
  incomplete: boolean
): Promise<boolean> => {
  const dismissed = await isProfileSuggestionDismissed(role, userId);
  if (dismissed) return false;

  const needed = await isProfileSuggestionNeeded(role, userId);
  // After signup we force-show; otherwise show whenever profile is incomplete.
  return needed || incomplete;
};

/** Student profile is "complete enough" when core fields are filled. */
export const isStudentProfileComplete = (profile: {
  phoneNumber?: string | null;
  phone?: string | null;
  grade?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  board?: string | null;
}): boolean => {
  const phone = String(profile.phoneNumber || profile.phone || '').trim();
  const grade = String(profile.grade || '').trim();
  const bio = String(profile.bio || '').trim();
  const board = String(profile.board || '').trim();
  // Phone + class + (bio or board) — typical post-signup gaps
  return Boolean(phone && grade && (bio || board));
};

/** Tutor profile is complete when teaching identity fields exist. */
export const isTutorProfileComplete = (profile: {
  phone?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  education?: string | null;
  hourlyRate?: string | number | null;
}): boolean => {
  const phone = String(profile.phone || profile.phoneNumber || '').trim();
  const bio = String(profile.bio || '').trim();
  const education = String(profile.education || '').trim();
  const fee = String(profile.hourlyRate ?? '').trim();
  // Signup only collects name/email/phone — bio/education/fee are the gaps.
  return Boolean(phone && bio && education && fee);
};
