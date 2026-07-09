import { useCallback, useState } from 'react';
import {
  getTutorOnboardingStatus,
  scheduleTutorOnboardingInterview,
  submitTutorOnboardingStep1,
  uploadTutorDocuments,
} from '../../services/tutor/tutorOnboardingService';
import { TutorOnboardingStatusData } from '../../types/api.types';
import { getApiErrorMessage } from '../../utils/api/errorHandler';

export const useTutorOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TutorOnboardingStatusData | null>(null);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTutorOnboardingStatus();
      setStatus(data);
      return data;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeStep1 = async (subject: string, grades: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await submitTutorOnboardingStep1({ subject, grades });
      setStatus(data);
      return data;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitDocuments = async (files: {
    cnicFrontUri: string;
    cnicBackUri: string;
    degreeUri: string;
    degreeName?: string;
    degreeType?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadTutorDocuments(files);
      setStatus(data);
      return data;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const scheduleInterview = async (interviewDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleTutorOnboardingInterview(interviewDate);
      setStatus(data);
      return data;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    error,
    refreshStatus,
    completeStep1,
    submitDocuments,
    scheduleInterview,
  };
};
