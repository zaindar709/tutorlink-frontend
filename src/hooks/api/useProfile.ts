import { useCallback, useEffect, useState } from 'react';
import {
  fetchMyProfile,
  generateParentLinkCode,
  redeemParentLinkCode,
  updateInterests,
  updateProfile,
} from '../../services/profile/profileService';
import {
  LinkCodeData,
  RedeemLinkCodePayload,
  StudentProfile,
  UpdateInterestsPayload,
  UpdateProfilePayload,
} from '../../types/api.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export const useProfile = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [linkCode, setLinkCode] = useState<LinkCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyProfile();
      setProfile(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async (payload: UpdateProfilePayload) => {
    setActionLoading(true);
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
  };

  const saveInterests = async (payload: UpdateInterestsPayload) => {
    setActionLoading(true);
    try {
      const result = await updateInterests(payload);
      setProfile(prev =>
        prev ? { ...prev, interests: result.interests } : prev
      );
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const generateLinkCode = async () => {
    setActionLoading(true);
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
  };

  const redeemLinkCode = async (payload: RedeemLinkCodePayload) => {
    setActionLoading(true);
    try {
      await redeemParentLinkCode(payload);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    profile,
    linkCode,
    loading,
    actionLoading,
    error,
    refresh: loadProfile,
    saveProfile,
    saveInterests,
    generateLinkCode,
    redeemLinkCode,
  };
};
