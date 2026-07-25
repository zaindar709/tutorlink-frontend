import { useCallback, useEffect, useRef, useState } from 'react';
import { AiTutorRecommendation } from '../../types/aiRecommendation.types';
import {
  getAiTutorRecommendation,
  resolveStudentInterests,
} from '../../services/ai/tutorRecommendationService';
import {
  hasSeenAiAssistantIntro,
  markAiAssistantIntroSeen,
} from '../../services/ai/aiOnboardingStorage';

export type AiGuideMode = 'match' | 'no_match' | null;

export const useAiTutorRecommendation = () => {
  const [recommendation, setRecommendation] =
    useState<AiTutorRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideMode, setGuideMode] = useState<AiGuideMode>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const userIdRef = useRef('guest');
  const excludeRef = useRef<string[]>([]);
  const introCheckedRef = useRef(false);

  const finishGuide = useCallback(async () => {
    setGuideMode(null);
    await markAiAssistantIntroSeen(userIdRef.current);
  }, []);

  const load = useCallback(async (opts?: { another?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const resolved = await resolveStudentInterests();
      setInterests(resolved.interests);
      userIdRef.current = resolved.userId;

      const exclude = opts?.another ? [...excludeRef.current] : [];
      const result = await getAiTutorRecommendation({
        studentInterests: resolved.interests,
        studentGrade: resolved.grade,
        studentName: resolved.name,
        excludeTutorIds: exclude,
      });

      excludeRef.current = Array.from(
        new Set([...excludeRef.current, result.tutor.id])
      );
      setRecommendation(result);

      if (!opts?.another && !introCheckedRef.current) {
        introCheckedRef.current = true;
        const seen = await hasSeenAiAssistantIntro(resolved.userId);
        if (!seen) setGuideMode('match');
      }
    } catch (err: any) {
      setRecommendation(null);
      const isNoMatch =
        err?.code === 'NO_INTEREST_MATCH' ||
        err?.message === 'NO_INTEREST_MATCH';
      setError(isNoMatch ? null : err?.message || 'Recommendation failed');

      if (!opts?.another && !introCheckedRef.current) {
        introCheckedRef.current = true;
        const resolved = await resolveStudentInterests().catch(() => null);
        if (resolved?.userId) userIdRef.current = resolved.userId;
        const seen = await hasSeenAiAssistantIntro(userIdRef.current);
        if (!seen) setGuideMode(isNoMatch ? 'no_match' : null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => load({ another: false }), [load]);
  const requestAnother = useCallback(() => load({ another: true }), [load]);

  return {
    recommendation,
    loading,
    error,
    interests,
    guideMode,
    finishGuide,
    refresh,
    requestAnother,
  };
};
