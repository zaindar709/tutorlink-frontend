export type UserRole = 'student' | 'tutor' | 'parent';

export interface ApiUser {
  id?: string;
  _id?: string;
  firebaseUid?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  role?: UserRole;
  avatarUrl?: string;
  uid?: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  success?: false;
  message?: string;
  code?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  results?: number;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthRegisterPayload {
  firebaseUid: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface AuthLoginPayload {
  email: string;
  firebaseUid: string;
}

export interface AuthGoogleLoginPayload {
  name: string;
  email: string;
  firebaseUid: string;
  role: UserRole;
}

export interface AuthLoginResponse {
  message: string;
  user: ApiUser;
}

export interface AuthProfileResponse {
  user: ApiUser;
  details?: Record<string, unknown>;
}

export interface DashboardLesson {
  _id: string;
  subject: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
  tutor?: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  student?: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  meetingLink?: string;
  canJoinRoom?: boolean;
  isNextSession?: boolean;
}

export interface DashboardData {
  todaySchedule: {
    title: string;
    sectionTitle: string;
    date: string;
    results: number;
    currentLessons: DashboardLesson[];
  };
  quickAccess: {
    assignments: { count: number; label: string };
    quizzes: { count: number; label: string };
    tests: { count: number; label: string };
  };
  aiSummaries: unknown[];
  notifications: {
    unreadCount: number;
    hasUnread: boolean;
  };
}

export interface Booking {
  _id: string;
  student: ApiUser | string;
  tutor: ApiUser | string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  hourlyRateAtBooking?: number;
  meetingLink?: string;
  isNextSession?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingPayload {
  tutor: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  studentId?: string;
}

export interface ConfirmBookingPayload {
  meetingLink?: string;
}

export type BookingTab = 'active' | 'pending' | 'past';

export interface TutorSearchPayload {
  subject?: string;
  grade?: string;
  teachingMode?: string;
  minFee?: number;
  maxFee?: number;
  minRating?: number;
  experience?: number;
  gender?: string;
  availability?: boolean;
  isVerified?: boolean;
  studentLat?: number;
  studentLng?: number;
  radiusInKm?: number;
}

export interface TutorProfile {
  _id: string;
  user: ApiUser & { _id: string };
  qualification?: string;
  experience?: string;
  experienceYears?: number;
  hourlyRate?: number;
  subjects?: string[];
  isVerified?: boolean;
  grades?: string[];
  rating?: number;
  availability?: boolean;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  distanceKm?: number;
}

export interface WalletBalance {
  userId: string;
  userType: string;
  totalBalance: number;
  escrowBalance: number;
  currency: string;
  displayTotalBalance: string;
  displayEscrowBalance: string;
  walletExists: boolean;
}

export interface WalletTransaction {
  _id: string;
  transactionId: string;
  amount: number;
  currency: string;
  title: string;
  phoneNumber?: string;
  recipientName?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WalletDepositPayload {
  amount: number;
  paymentMethod: 'jazzcash' | 'easypaisa';
  phoneNumber: string;
}

export interface StudentProfile {
  header?: {
    name?: string;
    grade?: string;
    board?: string;
    avatarUrl?: string;
    publicId?: string;
  };
  parentLinkCard?: Record<string, unknown>;
  menuPreview?: unknown[];
  preferences?: Record<string, unknown>;
  settingsMenu?: unknown[];
  interests?: string[];
  grade?: string;
  board?: string;
  name?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  publicId?: string;
  [key: string]: unknown;
}

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  grade?: string;
  board?: string;
}

export interface UpdateInterestsPayload {
  interests: string[];
}

export interface LinkCodeData {
  code: string;
  expiresAt: string;
  expiresInMinutes: number;
  status: string;
}

export interface RedeemLinkCodePayload {
  code: string;
}

export type TutorOnboardingStatus =
  | 'basic_info'
  | 'documents_uploaded'
  | 'under_review'
  | 'interview_scheduled'
  | 'approved'
  | 'rejected';

export interface TutorOnboardingStatusData {
  onboardingStep?: number;
  onboardingStatus?: TutorOnboardingStatus;
  verificationStatus?: TutorOnboardingStatus | 'pending';
  subjects?: string[];
  grades?: string[];
  isVerified?: boolean;
  rejectionReason?: string;
  interviewScheduledAt?: string;
  documentsSubmittedAt?: string;
  cnicFrontUrl?: string;
  cnicBackUrl?: string;
  degreeCertificateUrl?: string;
}
