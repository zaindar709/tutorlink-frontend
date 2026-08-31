import { useCallback, useEffect, useState } from 'react';
import type { DemoParentLinkEntry } from '../constants/linkCodes';
import { resolveParentLink } from '../constants/linkCodes';
import { buildFreshParentDashboard } from '../constants/freshDashboard';
import type {
  ParentDashboardData,
  ParentNotification,
  ParentSettings,
} from '../types/parent.types';

const STORAGE_KEY = 'tl-parent-linked-code';
const STORAGE_NAME_KEY = 'tl-parent-linked-student-name';

function readQueryLink(): { raw: string; studentName: string } | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = String(params.get('code') || '').trim();
    const studentName = String(params.get('student') || '').trim();
    if (!raw) return null;
    return { raw, studentName };
  } catch {
    return null;
  }
}

function clearQueryLinkFromUrl() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('code') && !url.searchParams.has('student')) {
      return;
    }
    url.searchParams.delete('code');
    url.searchParams.delete('student');
    window.history.replaceState({}, '', url.pathname + url.hash);
  } catch {
    // ignore
  }
}

export function useParentDashboard() {
  const [linkedEntry, setLinkedEntry] = useState<DemoParentLinkEntry | null>(
    null
  );
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [prefillCode, setPrefillCode] = useState('');

  useEffect(() => {
    try {
      const fromQuery = readQueryLink();
      if (fromQuery) {
        const entry = resolveParentLink(fromQuery.raw, {
          studentNameOverride: fromQuery.studentName || undefined,
        });
        if (entry) {
          const name = entry.studentName;
          setLinkedEntry(entry);
          setData(
            buildFreshParentDashboard(entry, {
              studentNameOverride: name,
            })
          );
          localStorage.setItem(STORAGE_KEY, entry.code);
          localStorage.setItem(STORAGE_NAME_KEY, name);
          clearQueryLinkFromUrl();
          setToast(`${name} linked — progress starts at 0%`);
          setTimeout(() => setToast(null), 3200);
          return;
        }
        setPrefillCode(fromQuery.raw);
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const savedName = localStorage.getItem(STORAGE_NAME_KEY) || undefined;
      const entry = resolveParentLink(saved, {
        studentNameOverride: savedName,
      });
      if (!entry) return;
      setLinkedEntry(entry);
      setData(
        buildFreshParentDashboard(entry, {
          studentNameOverride: savedName || entry.studentName,
        })
      );
    } catch {
      // ignore
    }
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  }, []);

  const linkStudent = useCallback(
    (
      entry: DemoParentLinkEntry,
      opts?: { studentNameOverride?: string }
    ) => {
      const name =
        String(opts?.studentNameOverride || '').trim() || entry.studentName;
      setLinkedEntry(entry);
      setData(
        buildFreshParentDashboard(entry, { studentNameOverride: name })
      );
      try {
        localStorage.setItem(STORAGE_KEY, entry.code);
        localStorage.setItem(STORAGE_NAME_KEY, name);
      } catch {
        // ignore
      }
      clearQueryLinkFromUrl();
      showToast(`${name} linked — progress starts at 0%`);
    },
    [showToast]
  );

  const unlinkStudent = useCallback(() => {
    setLinkedEntry(null);
    setData(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_NAME_KEY);
    } catch {
      // ignore
    }
    showToast('Student unlinked');
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    setData(prev =>
      prev
        ? {
            ...prev,
            notifications: prev.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
          }
        : prev
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setData(prev =>
      prev
        ? {
            ...prev,
            notifications: prev.notifications.map(n => ({ ...n, read: true })),
          }
        : prev
    );
    showToast('All notifications marked as read');
  }, [showToast]);

  const deleteNotification = useCallback((id: string) => {
    setData(prev =>
      prev
        ? {
            ...prev,
            notifications: prev.notifications.filter(n => n.id !== id),
          }
        : prev
    );
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<ParentSettings>) => {
      setData(prev =>
        prev
          ? { ...prev, settings: { ...prev.settings, ...patch } }
          : prev
      );
      showToast('Settings saved locally');
    },
    [showToast]
  );

  const updateProfile = useCallback(
    (patch: Partial<ParentDashboardData['profile']>) => {
      setData(prev =>
        prev ? { ...prev, profile: { ...prev.profile, ...patch } } : prev
      );
      showToast('Profile updated');
    },
    [showToast]
  );

  const unreadCount = data
    ? data.notifications.filter((n: ParentNotification) => !n.read).length
    : 0;

  return {
    linkedEntry,
    data,
    toast,
    unreadCount,
    prefillCode,
    linkStudent,
    unlinkStudent,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    updateSettings,
    updateProfile,
    showToast,
  };
}
