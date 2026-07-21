import { useCallback, useState } from 'react';
import { MOCK_PARENT_DASHBOARD } from '../constants/mockData';
import type {
  ParentDashboardData,
  ParentNotification,
  ParentSettings,
} from '../types/parent.types';

export function useParentDashboard() {
  const [data, setData] = useState<ParentDashboardData>(MOCK_PARENT_DASHBOARD);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
    showToast('All notifications marked as read');
  }, [showToast]);

  const deleteNotification = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<ParentSettings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
    showToast('Settings saved locally');
  }, [showToast]);

  const updateProfile = useCallback(
    (patch: Partial<ParentDashboardData['profile']>) => {
      setData(prev => ({
        ...prev,
        profile: { ...prev.profile, ...patch },
      }));
      showToast('Profile updated');
    },
    [showToast]
  );

  const unreadCount = data.notifications.filter((n: ParentNotification) => !n.read)
    .length;

  return {
    data,
    toast,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    updateSettings,
    updateProfile,
    showToast,
  };
}
