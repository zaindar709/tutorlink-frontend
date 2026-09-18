export type ChildAccess = {
  code: string;
  studentId: string;
  name: string;
  grade?: string;
  board?: string;
  avatarInitials?: string;
  subjects?: string[];
  attendanceRate?: number;
  sessionsThisMonth?: number;
  avgScore?: number;
  linkedAt?: string;
  addedAt?: string;
};

/** Official parent-web keys from the integration guide. */
const CHILDREN_KEY = 'tutorlink_parent_children_v1';
const ACTIVE_KEY = 'tutorlink_parent_active_v1';
const LEGACY_CHILDREN_KEY = 'tutorlink.parent.childAccess';
const LEGACY_ACTIVE_KEY = 'tutorlink.parent.selectedChildId';

export const normalizeLinkCode = (raw: string) => {
  const trimmed = String(raw || '').trim();
  const sep = trimmed.indexOf('~');
  if (sep === -1) return trimmed.toUpperCase();
  return `${trimmed.slice(0, sep).toUpperCase()}${trimmed.slice(sep)}`;
};

const migrateIfNeeded = () => {
  try {
    if (!localStorage.getItem(CHILDREN_KEY)) {
      const legacy = localStorage.getItem(LEGACY_CHILDREN_KEY);
      if (legacy) {
        localStorage.setItem(CHILDREN_KEY, legacy);
        localStorage.removeItem(LEGACY_CHILDREN_KEY);
      }
    }
    if (!localStorage.getItem(ACTIVE_KEY)) {
      const legacyActive =
        localStorage.getItem(LEGACY_ACTIVE_KEY) ||
        (typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem(LEGACY_ACTIVE_KEY)
          : null);
      if (legacyActive) {
        localStorage.setItem(ACTIVE_KEY, legacyActive);
        localStorage.removeItem(LEGACY_ACTIVE_KEY);
        sessionStorage.removeItem(LEGACY_ACTIVE_KEY);
      }
    }
  } catch {
    // ignore storage errors
  }
};

export const readChildAccessList = (): ChildAccess[] => {
  migrateIfNeeded();
  try {
    const raw = localStorage.getItem(CHILDREN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChildAccess[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item?.code && item?.studentId);
  } catch {
    return [];
  }
};

export const saveChildAccessList = (items: ChildAccess[]) => {
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(items));
};

export const upsertChildAccess = (item: ChildAccess) => {
  const code = normalizeLinkCode(item.code);
  const list = readChildAccessList();
  const existing = list.find(entry => entry.studentId === item.studentId);
  const next = list.filter(
    entry =>
      entry.studentId !== item.studentId &&
      normalizeLinkCode(entry.code) !== code
  );
  next.push({
    ...item,
    code,
    addedAt: existing?.addedAt || item.addedAt || new Date().toISOString(),
  });
  saveChildAccessList(next);
  return next;
};

export const removeChildAccess = (studentId: string) => {
  const next = readChildAccessList().filter(item => item.studentId !== studentId);
  saveChildAccessList(next);
  if (readActiveStudentId() === studentId) {
    persistActiveStudentId(next[0]?.studentId || '');
  }
  return next;
};

export const clearChildAccess = () => {
  localStorage.removeItem(CHILDREN_KEY);
  localStorage.removeItem(ACTIVE_KEY);
};

export const readActiveStudentId = () => {
  migrateIfNeeded();
  try {
    return String(localStorage.getItem(ACTIVE_KEY) || '').trim();
  } catch {
    return '';
  }
};

export const persistActiveStudentId = (id: string) => {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // ignore
  }
};

export const findAccessByStudentId = (studentId?: string) => {
  if (!studentId) return undefined;
  return readChildAccessList().find(item => item.studentId === studentId);
};

export const getAccessCode = (studentId?: string) => {
  if (studentId) {
    const match = findAccessByStudentId(studentId);
    if (match?.code) return match.code;
  }
  return readChildAccessList()[0]?.code || '';
};
