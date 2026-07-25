import { TutorProfile } from './api.types';

export type AiTutorCandidate = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  subjects: string[];
  rating: number;
  totalReviews: number;
  successRate: number;
  completedSessions: number;
  experienceYears: number;
  hourlyRate: number;
  available: boolean;
  isVerified: boolean;
  qualification?: string;
  /** Local composite score used for ranking before Gemini. */
  tutorScore: number;
  source: TutorProfile;
};

export type AiTutorRecommendation = {
  tutor: AiTutorCandidate;
  explanation: string;
  matchedSubjects: string[];
  generatedBy: 'gemini' | 'local';
  generatedAt: string;
};

export type AiRecommendationRequest = {
  studentInterests: string[];
  studentGrade?: string;
  studentName?: string;
  /** Skip these tutor ids when asking for another recommendation. */
  excludeTutorIds?: string[];
};
