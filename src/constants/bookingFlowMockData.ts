import {
  BookingFlowItem,
  TutorBookingProfile,
} from '../types/bookingFlow.types';

const avatar = (id: number) =>
  `https://randomuser.me/api/portraits/${id % 2 === 0 ? 'women' : 'men'}/${id}.jpg`;

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
    timeSlots: [
      { id: 's1', label: '4:00 PM', startTime: '16:00', endTime: '17:00', available: true },
      { id: 's2', label: '5:00 PM', startTime: '17:00', endTime: '18:00', available: true },
      { id: 's3', label: '6:00 PM', startTime: '18:00', endTime: '19:00', available: false },
      { id: 's4', label: '7:00 PM', startTime: '19:00', endTime: '20:00', available: true },
      { id: 's5', label: '8:00 PM', startTime: '20:00', endTime: '21:00', available: true },
    ],
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
    subjects: ['English', 'IELTS', 'Literature'],
    experienceYears: 4,
    qualification: 'MA English — PU',
    bio: 'Focused on speaking confidence, writing structure, and IELTS band improvement with practical weekly drills.',
    languages: ['English', 'Urdu'],
    teachingMode: 'online',
    location: 'Online · Pakistan',
    isVerified: true,
    responseTime: 'Usually replies in 35 min',
    completedSessions: 210,
    successRate: 93,
    accountSummary: {
      memberSince: 'Aug 2023',
      teachingStyle: 'Conversation-first',
      preferredGrades: ['O-Level', 'A-Level', 'University'],
    },
    certificates: [
      { id: 'c3', title: 'IELTS Trainer', issuer: 'British Council Prep', year: '2024' },
    ],
    reviews: [
      {
        id: 'r4',
        studentName: 'Sana Iqbal',
        studentAvatar: avatar(48),
        rating: 5,
        comment: 'Improved my speaking fluency a lot.',
        createdAt: '2026-07-01T12:00:00.000Z',
        subject: 'IELTS',
      },
    ],
    timeSlots: [
      { id: 's1', label: '3:00 PM', startTime: '15:00', endTime: '16:00', available: true },
      { id: 's2', label: '4:30 PM', startTime: '16:30', endTime: '17:30', available: true },
      { id: 's3', label: '6:00 PM', startTime: '18:00', endTime: '19:00', available: true },
    ],
    similarTutorIds: ['tutor-sara-ahmed'],
  },
  {
    id: 'tutor-nina-malik',
    name: 'Nina Malik',
    avatarUrl: avatar(65),
    rating: 4.8,
    totalReviews: 64,
    hourlyRate: 2200,
    availabilityStatus: 'busy',
    subjects: ['Computer Science', 'Programming', 'Mathematics'],
    experienceYears: 5,
    qualification: 'BS CS — FAST',
    bio: 'Project-based teaching for coding fundamentals, OOP, and exam prep with real coding exercises.',
    languages: ['English', 'Urdu'],
    teachingMode: 'online',
    location: 'Islamabad · Online',
    isVerified: true,
    responseTime: 'Usually replies in 45 min',
    completedSessions: 175,
    successRate: 94,
    accountSummary: {
      memberSince: 'Jan 2024',
      teachingStyle: 'Hands-on coding',
      preferredGrades: ['9th–12th', 'University'],
    },
    certificates: [],
    reviews: [],
    timeSlots: [
      { id: 's1', label: '5:00 PM', startTime: '17:00', endTime: '18:00', available: true },
      { id: 's2', label: '8:00 PM', startTime: '20:00', endTime: '21:00', available: true },
    ],
    similarTutorIds: ['tutor-sara-ahmed', 'tutor-ali-raza'],
  },
];

export const MOCK_BOOKING_REQUESTS: BookingFlowItem[] = [
  {
    id: 'bk-req-1001',
    status: 'pending',
    tutor: MOCK_TUTOR_PROFILES[0],
    student: {
      id: 'stu-01',
      name: 'Zain Malik',
      avatarUrl: avatar(12),
      rating: 4.6,
      grade: 'A-Level',
      subjects: ['Mathematics', 'Physics'],
      notes: 'Need help with integration and past papers before midterms.',
    },
    subject: 'Mathematics',
    date: '2026-07-28',
    startTime: '17:00',
    endTime: '18:00',
    durationHours: 1,
    totalCost: 2500,
    teachingMode: 'online',
    location: 'Google Meet',
    paymentMethod: 'TutorLink Wallet',
    paymentStatus: 'held',
    notes: 'Prefer evening slots on weekdays.',
    createdAt: new Date().toISOString(),
    estimatedResponseMinutes: 25,
  },
  {
    id: 'bk-req-1002',
    status: 'accepted',
    tutor: MOCK_TUTOR_PROFILES[1],
    student: {
      id: 'stu-02',
      name: 'Hira Noor',
      avatarUrl: avatar(47),
      rating: 4.8,
      grade: 'O-Level',
      subjects: ['English'],
    },
    subject: 'IELTS Speaking',
    date: '2026-07-29',
    startTime: '16:30',
    endTime: '17:30',
    durationHours: 1,
    totalCost: 2000,
    teachingMode: 'online',
    location: 'Zoom',
    paymentMethod: 'Card •••• 4242',
    paymentStatus: 'held',
    createdAt: '2026-07-24T08:00:00.000Z',
    estimatedResponseMinutes: 30,
  },
];

export const MOCK_PAYMENT_METHODS = [
  { id: 'wallet', label: 'TutorLink Wallet', detail: 'Balance PKR 12,400' },
  { id: 'card', label: 'Visa •••• 4242', detail: 'Expires 08/28' },
  { id: 'jazzcash', label: 'JazzCash', detail: '03XX-XXXXXXX' },
];

export const MOCK_BOOKING_NOTIFICATIONS = [
  {
    id: 'bn1',
    title: 'New booking request',
    body: 'Zain Malik requested a Mathematics session.',
    type: 'booking',
  },
  {
    id: 'bn2',
    title: 'Booking accepted',
    body: 'Sara Ahmed accepted your booking request.',
    type: 'booking',
  },
  {
    id: 'bn3',
    title: 'Booking rejected',
    body: 'Your requested slot is no longer available.',
    type: 'booking',
  },
  {
    id: 'bn4',
    title: 'Session reminder',
    body: 'Your session starts in 30 minutes.',
    type: 'reminder',
  },
  {
    id: 'bn5',
    title: 'Booking completed',
    body: 'Rate your session with Sara Ahmed.',
    type: 'booking',
  },
];

export const getMockTutorById = (id?: string | null) => {
  if (!id) return MOCK_TUTOR_PROFILES[0];
  return (
    MOCK_TUTOR_PROFILES.find(t => t.id === id) ||
    MOCK_TUTOR_PROFILES.find(t => t.name.toLowerCase().includes(String(id).toLowerCase())) ||
    MOCK_TUTOR_PROFILES[0]
  );
};

export const getMockBookingById = (id?: string | null) => {
  if (!id) return MOCK_BOOKING_REQUESTS[0];
  return MOCK_BOOKING_REQUESTS.find(b => b.id === id) || MOCK_BOOKING_REQUESTS[0];
};

/** Map live search tutor into booking profile shape (mock enrichment). */
export const enrichTutorFromSearch = (tutor: {
  _id?: string;
  user?: { name?: string; fullName?: string; avatarUrl?: string };
  subjects?: string[];
  hourlyRate?: number;
  rating?: number;
  experienceYears?: number;
  qualification?: string;
  isVerified?: boolean;
  availability?: boolean;
  distanceKm?: number;
}): TutorBookingProfile => {
  const base = getMockTutorById(tutor._id);
  const name =
    tutor.user?.name || tutor.user?.fullName || base.name;
  return {
    ...base,
    id: tutor._id || base.id,
    name,
    avatarUrl: tutor.user?.avatarUrl || base.avatarUrl,
    subjects: tutor.subjects?.length ? tutor.subjects : base.subjects,
    hourlyRate: tutor.hourlyRate ?? base.hourlyRate,
    rating: tutor.rating ?? base.rating,
    experienceYears: tutor.experienceYears ?? base.experienceYears,
    qualification: tutor.qualification || base.qualification,
    isVerified: tutor.isVerified ?? base.isVerified,
    availabilityStatus: tutor.availability === false ? 'busy' : 'available',
    location:
      typeof tutor.distanceKm === 'number'
        ? `${tutor.distanceKm.toFixed(1)} km away`
        : base.location,
  };
};
