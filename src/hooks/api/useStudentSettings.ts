import { useCallback, useEffect, useState } from 'react';
import {
  fetchAppSettings,
  fetchNotificationSettings,
  fetchPrivacySettings,
  saveAppSettings,
  saveNotificationSettings,
  savePrivacySettings,
} from '../../services/profile/profileService';
import {
  StudentAppSettings,
  StudentNotificationSettings,
  StudentPrivacySettings,
} from '../../types/api.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

const defaultNotifications: StudentNotificationSettings = {
  booking: true,
  messages: true,
  promotions: false,
  parent: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

const defaultApp: StudentAppSettings = {
  language: 'en',
  appearance: 'system',
  soundEnabled: true,
  hapticsEnabled: true,
  autoPlayPreviews: false,
};

const defaultPrivacy: StudentPrivacySettings = {
  twoFactorEnabled: false,
  loginAlerts: true,
  profileVisibleToTutors: true,
};

export const useStudentNotificationSettings = () => {
  const [settings, setSettings] =
    useState<StudentNotificationSettings>(defaultNotifications);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotificationSettings();
      setSettings({ ...defaultNotifications, ...data });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = async (patch: Partial<StudentNotificationSettings>) => {
    const previous = settings;
    setSettings(curr => ({ ...curr, ...patch }));
    setSaving(true);
    setError(null);
    try {
      const saved = await saveNotificationSettings(patch);
      setSettings({ ...defaultNotifications, ...saved });
      return true;
    } catch (err) {
      setSettings(previous);
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, error, refresh: load, update };
};

export const useStudentAppSettings = () => {
  const [settings, setSettings] = useState<StudentAppSettings>(defaultApp);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAppSettings();
      setSettings({ ...defaultApp, ...data });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = async (patch: Partial<StudentAppSettings>) => {
    const previous = settings;
    setSettings(curr => ({ ...curr, ...patch }));
    setSaving(true);
    setError(null);
    try {
      const saved = await saveAppSettings(patch);
      setSettings({ ...defaultApp, ...saved });
      return true;
    } catch (err) {
      setSettings(previous);
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, error, refresh: load, update };
};

export const useStudentPrivacySettings = () => {
  const [settings, setSettings] =
    useState<StudentPrivacySettings>(defaultPrivacy);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrivacySettings();
      setSettings({ ...defaultPrivacy, ...data });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = async (patch: Partial<StudentPrivacySettings>) => {
    const previous = settings;
    setSettings(curr => ({ ...curr, ...patch }));
    setSaving(true);
    setError(null);
    try {
      const saved = await savePrivacySettings(patch);
      setSettings({ ...defaultPrivacy, ...saved });
      return true;
    } catch (err) {
      setSettings(previous);
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, error, refresh: load, update };
};
