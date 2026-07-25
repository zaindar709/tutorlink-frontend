import { useCallback, useEffect, useState } from 'react';
import {
  fetchInterests,
  fetchLinkedParents,
  fetchMyProfile,
  generateParentLinkCode,
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

export const useProfile = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [linkCode, setLinkCode] = useState<LinkCodeData | null>(null);
  const [linkedParents, setLinkedParents] = useState<LinkedParent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      // Prefer parents embedded in GET /api/profile/me — avoid extra 404 noise
      // when GET /api/profile/linked-parents is not deployed yet.
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

  const saveProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await updateProfile(payload);
      setProfile(updated);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(
    async (file: { uri: string; type?: string; name?: string }) => {
      setActionLoading(true);
      setError(null);
      try {
        const avatarUrl = await uploadProfileAvatar(file);
        const updated = await updateProfile({ avatarUrl });
        setProfile(updated);
        return avatarUrl;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    []
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
      setProfile(prev =>
        prev
          ? {
              ...prev,
              interests: result.interests,
              grade: result.grade || prev.grade,
            }
          : prev
      );
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

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
