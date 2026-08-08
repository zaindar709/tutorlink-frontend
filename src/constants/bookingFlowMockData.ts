import {
  BookingFlowItem,
  TimeSlot,
  TutorBookingProfile,
} from '../types/bookingFlow.types';

const avatar = (id: number) =>
  `https://randomuser.me/api/portraits/${id % 2 === 0 ? 'women' : 'men'}/${id}.jpg`;

/** Preferred session times — 90 min lectures (Mon–Fri schedule rule). */
const DEFAULT_LIVE_SLOTS: TimeSlot[] = [
  { id: 's1', label: '9:00 AM', startTime: '9:00 AM', endTime: '10:30 AM', available: true },
  { id: 's2', label: '10:30 AM', startTime: '10:30 AM', endTime: '12:00 PM', available: true },
  { id: 's3', label: '12:00 PM', startTime: '12:00 PM', endTime: '1:30 PM', available: true },
  { id: 's4', label: '1:30 PM', startTime: '1:30 PM', endTime: '3:00 PM', available: true },
  { id: 's5', label: '3:00 PM', startTime: '3:00 PM', endTime: '4:30 PM', available: true },
  { id: 's6', label: '4:30 PM', startTime: '4:30 PM', endTime: '6:00 PM', available: true },
  { id: 's7', label: '6:00 PM', startTime: '6:00 PM', endTime: '7:30 PM', available: true },
  { id: 's8', label: '7:30 PM', startTime: '7:30 PM', endTime: '9:00 PM', available: true },
];

export const MOCK_TUTOR_PROFILES: TutorBookingProfile[] = [
  {
    id: 'tutor-sara-ahmed',
    name: 'Sara Ahmed',
    avatarUrl: avatar(32),
    rating: 4.9,
    totalReviews: 128,
    hourlyRate: 2500,
    availabilityStatus: 'available',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    experienceYears: 6,
    qualification: 'MSc Physics — LUMS',
    bio: 'I help secondary and A-level students build strong problem-solving habits with clear explanations, weekly goals, and exam-focused practice.',
    languages: ['English', 'Urdu'],
    teachingMode: 'hybrid',
    location: 'Lahore, DHA Phase 5',
    isVerified: true,
    responseTime: 'Usually replies in 20 min',
    completedSessions: 340,
    successRate: 96,
    accountSummary: {
      memberSince: 'Mar 2023',
      teachingStyle: 'Interactive · Exam prep',
      preferredGrades: ['9th', '10th', 'A-Level'],
    },
    certificates: [
      { id: 'c1', title: 'Teaching Excellence', issuer: 'TutorLink', year: '2025' },
      { id: 'c2', title: 'Physics Olympiad Mentor', issuer: 'STEM PK', year: '2024' },
    ],
    reviews: [
      {
        id: 'r1',
        studentName: 'Hamza Ali',
        studentAvatar: avatar(11),
        rating: 5,
        comment: 'Sara made calculus finally click. Highly recommended.',
        createdAt: '2026-07-10T10:00:00.000Z',
        subject: 'Mathematics',
      },
      {
        id: 'r2',
        studentName: 'Ayesha Khan',
        studentAvatar: avatar(44),
        rating: 5,
        comment: 'Very patient and structured. My grades improved in 3 weeks.',
        createdAt: '2026-06-28T14:00:00.000Z',
        subject: 'Physics',
      },
      {
        id: 'r3',
        studentName: 'Bilal Raza',
        studentAvatar: avatar(22),
        rating: 4,
        comment: 'Great online sessions and clear notes after every class.',
        createdAt: '2026-06-02T09:00:00.000Z',
        subject: 'Chemistry',
      },
    ],
    timeSlots: DEFAULT_LIVE_SLOTS,
    similarTutorIds: ['tutor-ali-raza', 'tutor-nina-malik'],
  },
  {
    id: 'tutor-ali-raza',
    name: 'Ali Raza',
    avatarUrl: avatar(15),
    rating: 4.7,
    totalReviews: 86,
    hourlyRate: 2000,
    availabilityStatus: 'available',
    subjects: ['English', 'Urdu', 'Islamiat'],
    experienceYears: 4,
    qualification: 'MA English — PU',
    bio: 'Focused on reading, writing, and spoken confidence for board exams.',
    languages: ['English', 'Urdu'],
    teachingMode: 'online',
    location: 'Online',
    isVerified: true,
    responseTime: 'Usually replies in 35 min',
    completedSessions: 210,
    successRate: 93,
    accountSummary: {
      memberSince: 'Jan 2024',
      teachingStyle: 'Discussion · Writing drills',
      preferredGrades: ['8th', '9th', '10th'],
    },
    certificates: [],
    reviews: [],
    timeSlots: DEFAULT_LIVE_SLOTS,
    similarTutorIds: ['tutor-sara-ahmed'],
  },
];

/** Empty — live tutor Requests uses API only. */
export const MOCK_BOOKING_REQUESTS: BookingFlowItem[] = [];

export const getMockTutorById = (id?: string | null): TutorBookingProfile => {
  if (!id) return MOCK_TUTOR_PROFILES[0];
  return (
    MOCK_TUTOR_PROFILES.find(t => t.id === id) ||
    MOCK_TUTOR_PROFILES.find(t =>
      t.name.toLowerCase().includes(String(id).toLowerCase())
    ) ||
    MOCK_TUTOR_PROFILES[0]
  );
};

export const getMockBookingById = (id?: string | null): BookingFlowItem | null => {
  if (!id) return null;
  return MOCK_BOOKING_REQUESTS.find(b => b.id === id) || null;
};

const avatarFallback = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7548F5&color=fff`;

/**
 * Map live search tutor into booking profile shape.
 * Critical: preserves User `_id` for POST /api/bookings — never invent verified/rate from mocks.
 */
export const enrichTutorFromSearch = (tutor: {
  _id?: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    fullName?: string;
    avatarUrl?: string;
  } | string;
  userId?: string;
  subjects?: string[];
  hourlyRate?: number;
  rating?: number;
  experienceYears?: number;
  qualification?: string;
  isVerified?: boolean;
  availability?: boolean;
  distanceKm?: number;
}): TutorBookingProfile => {
  const nestedUser =
    tutor.user && typeof tutor.user === 'object' ? tutor.user : null;
  const userIdFromString =
    typeof tutor.user === 'string' ? tutor.user.trim() : '';
  const userId = String(
    nestedUser?._id ||
      nestedUser?.id ||
      tutor.userId ||
      userIdFromString ||
      ''
  ).trim();

  const name =
    nestedUser?.name ||
    nestedUser?.fullName ||
    (userId ? 'Tutor' : 'Tutor');
  const profileId = String(tutor._id || userId || '').trim();

  return {
    id: profileId || userId,
    userId: userId || undefined,
    name,
    avatarUrl:
      nestedUser?.avatarUrl || avatarFallback(name),
    rating: Number(tutor.rating ?? 0) || 0,
    totalReviews: 0,
    hourlyRate: Number(tutor.hourlyRate ?? 0) || 0,
    availabilityStatus:
      tutor.availability === false ? 'busy' : 'available',
    subjects: tutor.subjects?.length ? tutor.subjects : ['General'],
    experienceYears: Number(tutor.experienceYears ?? 0) || 0,
    qualification: tutor.qualification || '',
    bio: '',
    languages: ['English', 'Urdu'],
    teachingMode: 'online',
    location:
      typeof tutor.distanceKm === 'number'
        ? `${tutor.distanceKm.toFixed(1)} km away`
        : 'Online',
    // Only true when API says so — do not inherit mock verified.
    isVerified: tutor.isVerified === true,
    responseTime: 'Usually replies soon',
    completedSessions: 0,
    successRate: 0,
    accountSummary: {
      memberSince: '',
      teachingStyle: '',
      preferredGrades: [],
    },
    certificates: [],
    reviews: [],
    timeSlots: DEFAULT_LIVE_SLOTS.map(slot => ({ ...slot })),
    similarTutorIds: [],
  };
};
