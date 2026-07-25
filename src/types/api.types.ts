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
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  grade?: string;
  board?: string;
  bio?: string;
  avatarUrl?: string;
  publicId?: string;
  interests?: string[];
  role?: string;
  displayGrade?: string;
  displayStudentId?: string;
  header?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    displayGrade?: string;
    displayStudentId?: string;
    grade?: string;
    board?: string;
    bio?: string;
  };
  parentLinkCard?: {
    title?: string;
    subtitle?: string;
    isLinked?: boolean;
    linkedParents?: LinkedParent[];
    hasActiveCode?: boolean;
    activeCode?: string | null;
    activeCodeExpiresAt?: string | null;
  };
  menuPreview?: {
    interestsCount?: number;
    certificatesCount?: number;
    sessionHistoryCount?: number;
  };
  preferences?: {
    notifications?: StudentNotificationSettings;
    privacy?: StudentPrivacySettings;
    app?: StudentAppSettings;
    notificationsEnabled?: boolean;
  };
  settingsMenu?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    route?: string;
    count?: number;
  }>;
  screen?: {
    header?: StudentProfile['header'];
    parentLinkCard?: StudentProfile['parentLinkCard'];
    menuPreview?: StudentProfile['menuPreview'];
    preferences?: StudentProfile['preferences'];
    settingsMenu?: StudentProfile['settingsMenu'];
  };
  [key: string]: unknown;
}

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  grade?: string;
  board?: string;
  bio?: string;
}

export interface UpdateInterestsPayload {
  interests: string[];
  grade?: string;
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

export interface LinkedParent {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  linkedAt?: string;
}

export interface StudentSessionHistoryItem {
  id: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  status: 'completed' | 'cancelled' | 'missed' | string;
  dateISO?: string;
  startTime?: string;
  endTime?: string;
  rating?: number;
}

export interface StudentCertificateItem {
  id: string;
  title: string;
  subject: string;
  tutorName: string;
  issuedAt: string;
  grade: string;
  fileUrl?: string;
}

export interface StudentNotificationSettings {
  booking: boolean;
  messages: boolean;
  promotions: boolean;
  parent: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface StudentAppSettings {
  language: 'en' | 'ur' | string;
  appearance: 'system' | 'light' | 'dark' | string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  autoPlayPreviews: boolean;
}

export interface StudentPrivacySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  profileVisibleToTutors: boolean;
}

export interface StudentSettingsBundle {
  notifications: StudentNotificationSettings;
  app: StudentAppSettings;
  privacy: StudentPrivacySettings;
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
