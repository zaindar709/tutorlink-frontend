import { GEMINI_CONFIG, isGeminiConfigured } from '../../config/gemini';
import { searchTutors } from '../tutors/tutorsService';
import { getAuthSession } from '../storage';
import { fetchInterests } from '../profile/profileService';
import { TutorProfile } from '../../types/api.types';
import {
  AiRecommendationRequest,
  AiTutorRecommendation,
} from '../../types/aiRecommendation.types';
import { generateGeminiText } from './geminiClient';
import {
  buildLocalExplanation,
  rankCandidates,
} from './tutorScoring';

const LOG = '[AiRecommend]';

const dedupeTutors = (list: TutorProfile[]): TutorProfile[] => {
  const map = new Map<string, TutorProfile>();
  list.forEach(t => {
    if (!map.has(t._id)) map.set(t._id, t);
  });
  return Array.from(map.values());
};

const fetchTutorPool = async (
  interests: string[]
): Promise<TutorProfile[]> => {
  const pools: TutorProfile[] = [];

  try {
    // Unfiltered first — matches previous working student search.
    const broad = await searchTutors({});
    pools.push(...broad);
  } catch (error) {
    console.warn(LOG, 'broad tutor search failed', error);
  }

  try {
    if (interests.length > 0) {
      const results = await Promise.all(
        interests.slice(0, 4).map(subject =>
          searchTutors({
            subject,
          }).catch(() => [] as TutorProfile[])
        )
      );
      results.forEach(batch => pools.push(...batch));
    }
  } catch (error) {
    console.warn(LOG, 'subject tutor search failed', error);
  }

  const live = dedupeTutors(pools);

  // Interest match is ONLY for the AI recommendation card.
  // If none match interests → empty (robot shows "oops" + points to Search).
  // Home "Top Tutors" / Search / Map use searchTutors() separately and show ALL.
  if (interests.length > 0) {
    return live.filter(t =>
      (t.subjects || []).some(s =>
        interests.some(
          i =>
            s.toLowerCase().includes(i.toLowerCase()) ||
            i.toLowerCase().includes(s.toLowerCase())
        )
      )
    );
  }

  return live;
};

const parseGeminiPick = (
  text: string,
  allowedIds: string[]
): { tutorId?: string; explanation: string } => {
  const cleaned = text.trim();
  try {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        tutorId?: string;
        explanation?: string;
      };
      if (parsed.tutorId && allowedIds.includes(parsed.tutorId)) {
        return {
          tutorId: parsed.tutorId,
          explanation:
            parsed.explanation?.trim() ||
            cleaned.replace(jsonMatch[0], '').trim(),
        };
      }
      if (parsed.explanation) {
        return { explanation: parsed.explanation.trim() };
      }
    }
  } catch {
    // fall through
  }

  const idHit = allowedIds.find(id => cleaned.includes(id));
  return {
    tutorId: idHit,
    explanation: cleaned.replace(/```json|```/g, '').trim(),
  };
};

const askGeminiForRecommendation = async (
  candidates: ReturnType<typeof rankCandidates>,
  interests: string[],
  studentName?: string
): Promise<{ tutorId?: string; explanation: string } | null> => {
  if (!isGeminiConfigured() || candidates.length === 0) {
    return null;
  }

  const payload = candidates.slice(0, GEMINI_CONFIG.maxCandidates).map(c => ({
    id: c.id,
    name: c.name,
    subjects: c.subjects,
    rating: c.rating,
    totalReviews: c.totalReviews,
    successRate: c.successRate,
    completedSessions: c.completedSessions,
    experienceYears: c.experienceYears,
    hourlyRate: c.hourlyRate,
    available: c.available,
    isVerified: c.isVerified,
    tutorScore: c.tutorScore,
  }));

  const system = `You are TutorLink's AI Tutor Assistant. Recommend ONE tutor from the given candidates for a student. Prefer verified, available, high-rated tutors whose subjects match the student interests. Never invent tutors. Reply with JSON only: {"tutorId":"<id>","explanation":"<1-2 friendly sentences explaining why>"}.`;

  const prompt = [
    studentName ? `Student name: ${studentName}` : null,
    `Student interests/subjects: ${interests.join(', ') || 'not specified'}`,
    `Candidates JSON: ${JSON.stringify(payload)}`,
    'Pick the best tutorId from the list and write a warm, concise explanation.',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const { text } = await generateGeminiText(prompt, system);
    return parseGeminiPick(
      text,
      candidates.map(c => c.id)
    );
  } catch (error) {
    console.warn(LOG, 'Gemini failed, using local ranking', error);
    return null;
  }
};

export const resolveStudentInterests = async (): Promise<{
  interests: string[];
  grade?: string;
  name?: string;
  userId: string;
}> => {
  const session = await getAuthSession();
  const userId = String(
    session?.user?.uid ||
      session?.user?.id ||
      session?.user?._id ||
      session?.user?.email ||
      'guest'
  );
  const name =
    session?.user?.fullName ||
    session?.user?.name ||
    undefined;
  const grade =
    session?.user?.grade ||
    session?.user?.selectedClass ||
    undefined;

  let interests: string[] = [];
  try {
    const fromApi = await fetchInterests();
    if (Array.isArray(fromApi.interests) && fromApi.interests.length) {
      interests = fromApi.interests.map(String);
    }
  } catch {
    // ignore
  }

  if (!interests.length) {
    const fromSession =
      (session?.user?.interests as string[]) ||
      (session?.user?.subjects as string[]) ||
      [];
    interests = Array.isArray(fromSession) ? fromSession.map(String) : [];
  }

  return { interests, grade, name, userId };
};

/**
 * Main entry: rank tutors (local) + polish explanation with Gemini when configured.
 */
export const getAiTutorRecommendation = async (
  request: AiRecommendationRequest = { studentInterests: [] }
): Promise<AiTutorRecommendation> => {
  const resolved =
    request.studentInterests.length > 0
      ? {
          interests: request.studentInterests,
          grade: request.studentGrade,
          name: request.studentName,
        }
      : await resolveStudentInterests();

  const interests = resolved.interests;
  const pool = await fetchTutorPool(interests);
  const ranked = rankCandidates(
    pool,
    interests,
    request.excludeTutorIds || []
  );

  if (ranked.length === 0) {
    const err = new Error('NO_INTEREST_MATCH') as Error & { code?: string };
    err.code = 'NO_INTEREST_MATCH';
    throw err;
  }

  const gemini = await askGeminiForRecommendation(
    ranked,
    interests,
    resolved.name || request.studentName
  );

  const picked =
    ranked.find(c => c.id === gemini?.tutorId) || ranked[0];

  const explanation =
    gemini?.explanation?.trim() ||
    buildLocalExplanation(picked, interests);

  const matchedSubjects = picked.subjects.filter(s =>
    interests.some(
      i =>
        s.toLowerCase().includes(i.toLowerCase()) ||
        i.toLowerCase().includes(s.toLowerCase())
    )
  );

  return {
    tutor: picked,
    explanation,
    matchedSubjects:
      matchedSubjects.length > 0 ? matchedSubjects : interests.slice(0, 2),
    generatedBy: gemini?.explanation ? 'gemini' : 'local',
    generatedAt: new Date().toISOString(),
  };
};
