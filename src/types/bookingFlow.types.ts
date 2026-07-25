export type TeachingMode = 'online' | 'physical' | 'hybrid';
export type BookingFlowStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'unavailable';

export type TimeSlot = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  available: boolean;
};

export type TutorReview = {
  id: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  subject?: string;
};

export type TutorCertificate = {
  id: string;
  title: string;
  issuer: string;
  year: string;
};

export type TutorBookingProfile = {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  availabilityStatus: 'available' | 'busy' | 'offline';
  subjects: string[];
  experienceYears: number;
  qualification: string;
  bio: string;
  languages: string[];
  teachingMode: TeachingMode;
  location: string;
  isVerified: boolean;
  responseTime: string;
  completedSessions: number;
  successRate: number;
  accountSummary: {
    memberSince: string;
    teachingStyle: string;
    preferredGrades: string[];
  };
  certificates: TutorCertificate[];
  reviews: TutorReview[];
  timeSlots: TimeSlot[];
  similarTutorIds: string[];
};

export type StudentBookingProfile = {
  id: string;
  name: string;
  avatarUrl: string;
  rating?: number;
  grade?: string;
  subjects: string[];
  notes?: string;
};

export type BookingFlowItem = {
  id: string;
  status: BookingFlowStatus;
  tutor: TutorBookingProfile;
  student: StudentBookingProfile;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalCost: number;
  teachingMode: TeachingMode;
  location: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'held' | 'paid' | 'refunded';
  notes?: string;
  createdAt: string;
  estimatedResponseMinutes: number;
};

export type BookingDraft = {
  tutorId: string;
  subject: string;
  date: string;
  slotId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  teachingMode: TeachingMode;
  notes?: string;
  ctaLabel: 'Hire Tutor' | 'Book Now';
};
