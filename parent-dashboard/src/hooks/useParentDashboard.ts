import { useCallback, useEffect, useRef, useState } from 'react';
import { ParentApiError, getApiErrorMessage } from '../api/client';
import {
  getParentAiInsights,
  getParentNotifications,
  getParentPayments,
  getParentProgress,
  getParentSessions,
  openDashboardByCode,
  refreshDashboardByCode,
  unlinkChild,
  type RedeemResult,
} from '../api/parent.api';
import {
  emptyDashboard,
  extractItems,
  normalizeAi,
  normalizeDashboard,
  resolveChildId,
} from '../utils/normalizeDashboard';
import type {
  LinkedChild,
  ParentDashboardData,
  ParentNotification,
  ParentSettings,
  PaymentRecord,
} from '../types/parent.types';
import {
  clearChildAccess,
  findAccessByStudentId,
  getAccessCode,
  normalizeLinkCode,
  persistActiveStudentId,
  readActiveStudentId,
  readChildAccessList,
  removeChildAccess,
  upsertChildAccess,
  type ChildAccess,
} from '../services/codeAccessStore';
import { clearParentSession } from '../services/sessionStore';

const readQueryParam = (key: string) => {
  try {
    return String(new URLSearchParams(window.location.search).get(key) || '').trim();
  } catch {
    return '';
  }
};

const readQueryCode = () => readQueryParam('code');

const initialsFrom = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'S';

const accessToChild = (item: ChildAccess): LinkedChild => ({
  id: item.studentId,
  name: item.name,
  grade: item.grade || '—',
  board: item.board || '—',
  avatarInitials: item.avatarInitials || initialsFrom(item.name),
  subjects: item.subjects || [],
  attendanceRate: item.attendanceRate || 0,
  sessionsThisMonth: item.sessionsThisMonth || 0,
  avgScore: item.avgScore || 0,
  linkedAt: String(item.linkedAt || item.addedAt || '').slice(0, 10),
});

const rosterFromStore = () => readChildAccessList().map(accessToChild);

const unwrapDashboard = (raw: unknown) => {
  if (!raw || typeof raw !== 'object') return raw;
  const record = raw as Record<string, unknown>;
  if (record.dashboard && typeof record.dashboard === 'object') {
    return record.dashboard;
  }
  return raw;
};

const studentFromPayload = (raw: unknown): RedeemResult['student'] | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const record = raw as Record<string, unknown>;
  if (record.student && typeof record.student === 'object') {
    return record.student as RedeemResult['student'];
  }
  return undefined;
};

const persistAccessFromPayload = (code: string, raw: unknown) => {
  const student = studentFromPayload(raw);
  const dash = normalizeDashboard(unwrapDashboard(raw));
  const hintedId = String(
    student?.id || student?.studentId || student?.userId || ''
  ).trim();
  const child =
    dash.children.find(item => item.id === hintedId) || dash.children[0];
  const studentId = child?.id || hintedId || normalizeLinkCode(code);
  upsertChildAccess({
    code,
    studentId,
    name: child?.name || student?.name || 'Student',
    grade: child?.grade || student?.grade,
    board: child?.board || student?.board,
    avatarInitials: child?.avatarInitials,
    subjects: child?.subjects || student?.subjects,
    attendanceRate: child?.attendanceRate,
    sessionsThisMonth: child?.sessionsThisMonth,
    avgScore: child?.avgScore,
    linkedAt: child?.linkedAt,
  });
  return { dash, studentId, name: child?.name || student?.name || 'Student' };
};

const clearQueryLinkFromUrl = () => {
  try {
    const url = new URL(window.location.href);
    if (
      !url.searchParams.has('code') &&
      !url.searchParams.has('student') &&
      !url.searchParams.has('studentId')
    ) {
      return;
    }
    url.searchParams.delete('code');
    url.searchParams.delete('student');
    url.searchParams.delete('studentId');
    window.history.replaceState({}, '', url.pathname + url.hash);
  } catch {
    // ignore
  }
};

const isRevokedCodeError = (err: unknown) =>
  err instanceof ParentApiError &&
  err.status === 400 &&
  (err.code === 'CODE_EXPIRED' ||
    /invalid|expired/i.test(err.message || ''));

export function useParentDashboard() {
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [prefillCode, setPrefillCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState(readActiveStudentId);
  const selectedChildRef = useRef(selectedChildId);
  selectedChildRef.current = selectedChildId;
  const urlRedeemAttempted = useRef(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  }, []);

  const rememberChild = useCallback((id: string) => {
    selectedChildRef.current = id;
    setSelectedChildId(id);
    persistActiveStudentId(id);
  }, []);

  const currentCode = useCallback(
    (studentId?: string) =>
      getAccessCode(studentId || selectedChildRef.current),
    []
  );

  const applyDashboard = useCallback(
    (dash: ParentDashboardData, preferredId?: string) => {
      const roster = rosterFromStore();
      const next = {
        ...dash,
        children: roster.length ? roster : dash.children,
        profile: {
          ...dash.profile,
          name: dash.profile.name || 'Parent',
        },
      };
      const resolved = resolveChildId(next.children, preferredId);
      rememberChild(resolved);
      setData(next);
      return next;
    },
    [rememberChild]
  );

  const loadDashboard = useCallback(
    async (preferredChildId?: string) => {
      const list = readChildAccessList();
      if (list.length === 0) {
        setData(null);
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        const hintId =
          preferredChildId ||
          selectedChildRef.current ||
          readActiveStudentId() ||
          list[0].studentId;
        const access =
          findAccessByStudentId(hintId) ||
          list.find(item => item.studentId === hintId) ||
          list[0];

        const raw = await refreshDashboardByCode(access.code);
        const saved = persistAccessFromPayload(access.code, raw);
        return applyDashboard(saved.dash, saved.studentId || hintId);
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          'Could not load this student’s dashboard'
        );
        setError(message);
        if (isRevokedCodeError(err)) {
          showToast(
            `${message} Unlink this student or paste a new code from the student app.`
          );
        }
        const roster = rosterFromStore();
        if (roster.length) {
          setData(prev =>
            prev
              ? { ...prev, children: roster }
              : { ...emptyDashboard(), children: roster }
          );
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [applyDashboard, showToast]
  );

  const linkStudent = useCallback(
    async (rawCode: string) => {
      const code = normalizeLinkCode(rawCode);
      if (code.length < 4) {
        return { ok: false as const, error: 'Enter a valid parent link code.' };
      }
      try {
        const raw = await openDashboardByCode(code);
        const saved = persistAccessFromPayload(code, raw);
        clearQueryLinkFromUrl();
        rememberChild(saved.studentId);
        await loadDashboard(saved.studentId);
        showToast(`${saved.name} linked — showing their progress`);
        return { ok: true as const };
      } catch (err) {
        return {
          ok: false as const,
          error: getApiErrorMessage(
            err,
            'Invalid or expired code. Ask your child to generate a new one.'
          ),
        };
      }
    },
    [loadDashboard, rememberChild, showToast]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pendingCode = readQueryCode();
      setPrefillCode(pendingCode);
      if (pendingCode && !urlRedeemAttempted.current) {
        urlRedeemAttempted.current = true;
        const result = await linkStudent(pendingCode);
        if (!cancelled && !result.ok) {
          setError(result.error);
        }
      } else if (readChildAccessList().length) {
        await loadDashboard();
      }
      if (!cancelled) setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [linkStudent, loadDashboard]);

  const logout = useCallback(() => {
    clearChildAccess();
    clearParentSession();
    persistActiveStudentId('');
    selectedChildRef.current = '';
    setSelectedChildId('');
    setData(null);
    setPayments([]);
    showToast('Cleared linked students');
  }, [showToast]);

  const selectChild = useCallback(
    (studentId: string) => {
      if (!studentId || studentId === selectedChildRef.current) return;
      rememberChild(studentId);
      void loadDashboard(studentId);
    },
    [loadDashboard, rememberChild]
  );

  const unlinkStudent = useCallback(
    async (studentId: string) => {
      const code = getAccessCode(studentId);
      try {
        if (code) await unlinkChild(studentId, code);
      } catch {
        // Local unlink is required even if DELETE is unavailable.
      }
      const remaining = removeChildAccess(studentId);
      if (selectedChildRef.current === studentId) {
        rememberChild(remaining[0]?.studentId || '');
      }
      if (remaining.length === 0) {
        setData(null);
      } else {
        await loadDashboard(remaining[0]?.studentId);
      }
      showToast('Student unlinked');
      return true;
    },
    [loadDashboard, rememberChild, showToast]
  );

  const updateSettings = useCallback(
    async (patch: Partial<ParentSettings>) => {
      setData(prev =>
        prev ? { ...prev, settings: { ...prev.settings, ...patch } } : prev
      );
      showToast('Settings saved on this device');
      return true;
    },
    [showToast]
  );

  const updateProfile = useCallback(async () => true, []);
  const uploadAvatar = useCallback(async () => true, []);

  const refreshSessions = useCallback(async () => {
    try {
      const result = await getParentSessions('all', currentCode());
      const items = extractItems(result);
      setData(prev =>
        prev
          ? {
              ...prev,
              sessions: items.length
                ? normalizeDashboard({ ...prev, sessions: items }).sessions
                : prev.sessions,
            }
          : prev
      );
    } catch {
      // keep last loaded sessions
    }
  }, [currentCode]);

  const refreshProgress = useCallback(async () => {
    try {
      const result = await getParentProgress(currentCode());
      if (!result?.progress && !result?.weeklyProgress) return;
      const next = normalizeDashboard({
        ...result,
        progress: result.progress,
        weeklyProgress: result.weeklyProgress,
      });
      setData(prev =>
        prev
          ? {
              ...prev,
              progress: next.progress,
              weeklyProgress: next.weeklyProgress,
            }
          : prev
      );
    } catch {
      // keep last loaded progress
    }
  }, [currentCode]);

  const refreshNotifications = useCallback(async () => {
    try {
      const result = await getParentNotifications('all', currentCode());
      const items = extractItems<ParentNotification>(result);
      setData(prev =>
        prev
          ? {
              ...prev,
              notifications: normalizeDashboard({
                ...prev,
                notifications: items,
              }).notifications,
            }
          : prev
      );
    } catch {
      // keep last loaded notifications
    }
  }, [currentCode]);

  const refreshPayments = useCallback(async () => {
    try {
      const result = await getParentPayments(currentCode());
      setMonthlySpend(Number(result.monthlySpend || 0));
      setPayments(Array.isArray(result.items) ? result.items : []);
    } catch {
      // keep last loaded payments
    }
  }, [currentCode]);

  const refreshAi = useCallback(async () => {
    try {
      const result = await getParentAiInsights(currentCode());
      setData(prev =>
        prev ? { ...prev, aiRecommendation: normalizeAi(result) } : prev
      );
    } catch {
      // dashboard already has copy
    }
  }, [currentCode]);

  const loadDeviceSessions = useCallback(async () => undefined, []);
  const signOutOthers = useCallback(async () => false, []);

  const downloadData = useCallback(async () => {
    showToast('Data export is not available with a student code');
    return false;
  }, [showToast]);

  const unreadCount = data
    ? data.notifications.filter((n: ParentNotification) => !n.read).length
    : 0;

  return {
    booting,
    authenticated: Boolean(data?.children.length),
    loading,
    data,
    payments,
    monthlySpend,
    sessionsList: [],
    toast,
    unreadCount,
    prefillCode,
    error,
    selectedChildId,
    onAuthenticated: loadDashboard,
    logout,
    loadDashboard,
    linkStudent,
    selectChild,
    unlinkStudent,
    updateSettings,
    updateProfile,
    uploadAvatar,
    refreshSessions,
    refreshProgress,
    refreshNotifications,
    refreshPayments,
    refreshAi,
    loadDeviceSessions,
    signOutOthers,
    downloadData,
    showToast,
  };
}
