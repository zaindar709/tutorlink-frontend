import { useCallback, useEffect, useState } from 'react';
import {
  fetchInterests,
  fetchLinkedParents,
  fetchMyProfile,
  generateParentLinkCode,
  peekCachedMyProfile,
  redeemParentLinkCode,
  unlinkParent,
  updateInterests,
  updateProfile,
  uploadProfileAvatar,
} from '../../services/profile/profileService';
import {
  LinkCodeData,
  LinkedParent,
  RedeemLinkCodePayload,
  StudentProfile,
  UpdateInterestsPayload,
  UpdateProfilePayload,
} from '../../types/api.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/auth/authSlice';
import { parseProfileCompleted } from '../../services/profile/profileCompletionHintStore';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user);
  const authToken = useAppSelector(state => state.auth.token);
  const authRole = useAppSelector(state => state.auth.role);
  const [profile, setProfile] = useState<StudentProfile | null>(
    () => peekCachedMyProfile()
  );
  const [linkCode, setLinkCode] = useState<LinkCodeData | null>(null);
  const [linkedParents, setLinkedParents] = useState<LinkedParent[]>(
    () => peekCachedMyProfile()?.parentLinkCard?.linkedParents || []
  );
  const [loading, setLoading] = useState(() => !peekCachedMyProfile());
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const cached = peekCachedMyProfile();
    if (cached) {
      setProfile(cached);
      setLinkedParents(cached.parentLinkCard?.linkedParents || []);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      setLinkedParents(data.parentLinkCard?.linkedParents || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const mergeProfileIntoAuth = useCallback(
    (updated: StudentProfile) => {
      if (!authUser || !authRole) return;
      const completed = parseProfileCompleted(updated.profileCompleted);
      dispatch(
        setUser({
          user: {
            ...authUser,
            name: updated.name || authUser.name,
            phoneNumber: updated.phoneNumber || authUser.phoneNumber,
            avatarUrl: updated.avatarUrl || authUser.avatarUrl,
            userId: updated.userId || authUser.userId,
            profileCompleted:
              completed === null ? authUser.profileCompleted : completed,
          },
          token: authToken || '',
          role: authRole,
        })
      );
    },
    [authRole, authToken, authUser, dispatch]
  );

  const saveProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await updateProfile(payload);
      setProfile(updated);
      mergeProfileIntoAuth(updated);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [mergeProfileIntoAuth]);

  const uploadAvatar = useCallback(
    async (file: { uri: string; type?: string; name?: string }) => {
      setActionLoading(true);
      setError(null);
      try {
        const avatarUrl = await uploadProfileAvatar(file);
        const updated = await updateProfile({ avatarUrl });
        setProfile(updated);
        mergeProfileIntoAuth(updated);
        return avatarUrl;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [mergeProfileIntoAuth]
  );

  const loadInterests = useCallback(async () => {
    try {
      return await fetchInterests();
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    }
  }, []);

  const saveInterests = useCallback(async (payload: UpdateInterestsPayload) => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await updateInterests(payload);
      const refreshed = await fetchMyProfile({ force: true }).catch(() => null);
      setProfile(prev => {
        const next = refreshed || prev;
        if (!next) return prev;
        return {
          ...next,
          interests: result.interests,
          grade: result.grade || next.grade,
        };
      });
      if (refreshed) mergeProfileIntoAuth(refreshed);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [mergeProfileIntoAuth]);

  const generateLinkCode = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const code = await generateParentLinkCode();
      setLinkCode(code);
      return code;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const redeemLinkCode = useCallback(async (payload: RedeemLinkCodePayload) => {
    setActionLoading(true);
    setError(null);
    try {
      await redeemParentLinkCode(payload);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const refreshLinkedParents = useCallback(async () => {
    try {
      const parents = await fetchLinkedParents();
      setLinkedParents(parents);
      return parents;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return [];
    }
  }, []);

  const removeLinkedParent = useCallback(async (linkId: string) => {
    setActionLoading(true);
    setError(null);
    try {
      await unlinkParent(linkId);
      setLinkedParents(prev => prev.filter(p => p.id !== linkId));
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    profile,
    linkCode,
    linkedParents,
    loading,
    actionLoading,
    error,
    refresh: loadProfile,
    saveProfile,
    uploadAvatar,
    loadInterests,
    saveInterests,
    generateLinkCode,
    redeemLinkCode,
    refreshLinkedParents,
    removeLinkedParent,
  };
};
