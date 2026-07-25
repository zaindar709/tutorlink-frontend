import { TutorProfile } from '../../types/api.types';
import { AiTutorCandidate } from '../../types/aiRecommendation.types';
import { enrichTutorFromSearch } from '../../constants/bookingFlowMockData';

const subjectOverlap = (tutorSubjects: string[], interests: string[]) => {
  const normalizedInterests = interests.map(s => s.toLowerCase().trim());
  return tutorSubjects.filter(s =>
    normalizedInterests.some(
      interest =>
        s.toLowerCase().includes(interest) ||
        interest.includes(s.toLowerCase())
    )
  );
};

/** Weighted score: rating, verification, availability, experience, volume proxies. */
export const computeTutorScore = (
  tutor: TutorProfile,
  matchedSubjects: string[]
): number => {
  const enriched = enrichTutorFromSearch(tutor);
  const rating = Number(tutor.rating ?? enriched.rating ?? 4);
  const reviews = Number(enriched.totalReviews || 0);
  const sessions = Number(enriched.completedSessions || 0);
  const success = Number(enriched.successRate || 80);
  const years = Number(
    tutor.experienceYears ?? enriched.experienceYears ?? 0
  );
  const verified = tutor.isVerified !== false && enriched.isVerified !== false;
  const available = tutor.availability !== false;

  let score = 0;
  score += rating * 18;
  score += Math.min(reviews, 200) * 0.08;
  score += Math.min(sessions, 500) * 0.04;
  score += success * 0.25;
  score += Math.min(years, 15) * 2.5;
  score += verified ? 12 : 0;
  score += available ? 14 : -20;
  score += matchedSubjects.length * 10;
  return Math.round(score * 10) / 10;
};

export const toAiCandidate = (
  tutor: TutorProfile,
  interests: string[]
): AiTutorCandidate | null => {
  const matched = subjectOverlap(tutor.subjects || [], interests);
  // Prefer subject match; allow empty interests to still recommend.
  if (interests.length > 0 && matched.length === 0) {
    return null;
  }

  const enriched = enrichTutorFromSearch(tutor);
  const tutorScore = computeTutorScore(tutor, matched);

  return {
    id: tutor._id,
    name: tutor.user?.name || enriched.name || 'Tutor',
    avatarUrl: tutor.user?.avatarUrl || enriched.avatarUrl,
    subjects: tutor.subjects?.length ? tutor.subjects : enriched.subjects,
    rating: Number(tutor.rating ?? enriched.rating ?? 4),
    totalReviews: enriched.totalReviews,
    successRate: enriched.successRate,
    completedSessions: enriched.completedSessions,
    experienceYears: Number(
      tutor.experienceYears ?? enriched.experienceYears ?? 0
    ),
    hourlyRate: Number(tutor.hourlyRate ?? enriched.hourlyRate ?? 0),
    available: tutor.availability !== false,
    isVerified: tutor.isVerified !== false,
    qualification: tutor.qualification || enriched.qualification,
    tutorScore,
    source: tutor,
  };
};

export const buildLocalExplanation = (
  candidate: AiTutorCandidate,
  interests: string[]
): string => {
  const subjectLabel =
    candidate.subjects.find(s =>
      interests.some(i => s.toLowerCase().includes(i.toLowerCase()))
    ) ||
    interests[0] ||
    candidate.subjects[0] ||
    'your subjects';

  const bits = [
    `Based on your interest in ${subjectLabel}, I recommend ${candidate.name}`,
    `because they have a ${candidate.rating.toFixed(1)}★ rating`,
  ];

  if (candidate.completedSessions > 0) {
    bits.push(
      `over ${candidate.completedSessions} completed sessions`
    );
  }
  if (candidate.totalReviews > 0) {
    bits.push(`strong student reviews (${candidate.totalReviews}+)`);
  }
  if (candidate.isVerified) {
    bits.push('verified credentials');
  }
  if (candidate.available) {
    bits.push('and is currently available');
  }

  return `${bits.join(', ')}.`;
};

export const rankCandidates = (
  tutors: TutorProfile[],
  interests: string[],
  excludeTutorIds: string[] = []
): AiTutorCandidate[] => {
  const excluded = new Set(excludeTutorIds);
  const ranked = tutors
    .filter(t => !excluded.has(t._id))
    .map(t => toAiCandidate(t, interests))
    .filter(Boolean) as AiTutorCandidate[];

  ranked.sort((a, b) => b.tutorScore - a.tutorScore);
  return ranked;
};
