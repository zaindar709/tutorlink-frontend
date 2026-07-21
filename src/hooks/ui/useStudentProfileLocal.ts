import { useCallback, useEffect, useState } from 'react';
import {
  loadLocalStudentProfile,
  LocalStudentProfile,
  saveLocalStudentProfile,
} from '../../services/profile/studentProfileLocalStore';

export const useStudentProfileLocal = () => {
  const [profile, setProfile] = useState<LocalStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadLocalStudentProfile();
    setProfile(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateProfile = useCallback(
    async (patch: Partial<LocalStudentProfile>) => {
      const next = await saveLocalStudentProfile(patch);
      setProfile(next);
      return next;
    },
    []
  );

  const setAvatarUri = useCallback(
    async (avatarUri: string | null) => updateProfile({ avatarUri }),
    [updateProfile]
  );

  return {
    profile,
    loading,
    refresh,
    updateProfile,
    setAvatarUri,
  };
};
