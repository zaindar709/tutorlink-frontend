import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  loadLocalStudentProfile,
  LocalStudentProfile,
  saveLocalStudentProfile,
} from '../../services/profile/studentProfileLocalStore';
import { getDisplayName } from '../../utils/api/bookingHelpers';
import { ApiUser } from '../../types/api.types';

const mergeAuthIntoProfile = (
  local: LocalStudentProfile,
  authUser: ApiUser | null
): LocalStudentProfile => {
  if (!authUser) return local;

  const authName = getDisplayName(authUser);
  const authEmail = authUser.email?.trim() || '';
  const authPhone =
    (authUser.phoneNumber || authUser.phone || '').toString().trim();
  const authAvatar = authUser.avatarUrl || null;

  // Prefer auth identity for name/email when local still has default mock values,
  // or when auth has a real name.
  const isDefaultMockName =
    !local.name ||
    local.name === 'Ahmed Khan' ||
    local.name === 'Student' ||
    local.name === 'User';

  return {
    ...local,
    name:
      authName && authName !== 'User' && isDefaultMockName
        ? authName
        : local.name || authName,
    email:
      local.email === 'ahmed.khan@student.com' && authEmail
        ? authEmail
        : local.email || authEmail,
    phone:
      local.phone === '+92 300 9876543' && authPhone
        ? authPhone
        : local.phone || authPhone,
    avatarUri: local.avatarUri || authAvatar,
  };
};

export const useStudentProfileLocal = () => {
  const authUser = useSelector((state: any) => state.auth.user as ApiUser | null);
  const [profile, setProfile] = useState<LocalStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadLocalStudentProfile();
    const merged = mergeAuthIntoProfile(data, authUser);
    // Persist auth name once so Edit Profile / Profile stay in sync
    if (
      merged.name !== data.name ||
      merged.email !== data.email ||
      merged.phone !== data.phone
    ) {
      await saveLocalStudentProfile({
        name: merged.name,
        email: merged.email,
        phone: merged.phone,
        avatarUri: merged.avatarUri,
      });
    }
    setProfile(merged);
    setLoading(false);
  }, [authUser]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateProfile = useCallback(
    async (patch: Partial<LocalStudentProfile>) => {
      const next = await saveLocalStudentProfile(patch);
      const merged = mergeAuthIntoProfile(next, authUser);
      setProfile(merged);
      return merged;
    },
    [authUser]
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
