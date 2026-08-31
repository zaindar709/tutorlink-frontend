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
  packageId?: string;
  mode?: string;
}

export interface DashboardQuickAccessItem {
  count: number;
  label: string;
}

export interface DashboardAiSummary {
  _id: string;
  title: string;
  subject: string;
  excerpt: string;
  createdAt: string;
  /** Display name when backend populates tutor / tutorName. */
  tutorName?: string;
  /** Session calendar day (YYYY-MM-DD or ISO) when provided. */
  sessionDate?: string;
  icon?: string;
  bookingId?: string;
  sessionId?: string;
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
    assignments: DashboardQuickAccessItem;
    quizzes: DashboardQuickAccessItem;
    tests: DashboardQuickAccessItem;
  };
  aiSummaries: DashboardAiSummary[];
  notifications: {
    unreadCount: number;
    hasUnread: boolean;
  };
  /** True when student has at least one accepted session/package with a tutor. */
  hasActiveTutor?: boolean;
  upcomingSessionCount?: number;
}

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'missed';

export type RescheduleProposalStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface RescheduleProposal {
  date: string;
  startTime: string;
  endTime: string;
  proposedBy: 'tutor' | 'student';
  status: RescheduleProposalStatus;
}

export type BookingKind = 'package' | 'session' | string;

export interface Booking {
  _id: string;
  student: ApiUser | string;
  tutor: ApiUser | string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  hourlyRateAtBooking?: number;
  meetingLink?: string;
  mode?: string;
  /** `package` = pending/accepted monthly parent; `session` = one weekday class. */
  kind?: BookingKind;
  /** Shared id when this session belongs to a monthly_weekdays package. */
  packageId?: string;
  parentBookingId?: string;
  /** Calendar-day window for monthly_weekdays packages (usually 30). */
  durationDays?: number;
  /** 1..N index within an accepted monthly package. */
  sessionIndex?: number;
  canReschedule?: boolean;
  rescheduleProposal?: RescheduleProposal | null;
  isNextSession?: boolean;
  studentRating?: number;
  studentReview?: string;
  ratedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WeekdayName =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface ScheduleTimeWindow {
  startTime: string;
  endTime: string;
}

export interface TutorScheduleSummary {
  sessionsCount: number;
  totalMinutes: number;
  displayTotalHours: string;
  freeSlotsCount: number;
}

export interface TutorScheduleBookedItem {
  kind: 'booked';
  bookingId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  student: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  subject: string;
  mode?: string;
  meetingLink?: string;
  status: BookingStatus;
  hourlyRateAtBooking?: number;
  canReschedule?: boolean;
  rescheduleProposal?: RescheduleProposal | null;
}

export interface TutorScheduleFreeItem {
  kind: 'free';
  label: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export type TutorScheduleItem =
  | TutorScheduleBookedItem
  | TutorScheduleFreeItem;

export interface TutorDaySchedule {
  date: string;
  weekday: WeekdayName | string;
  isWeekend: boolean;
  lectureSlotMinutes: number;
  summary: TutorScheduleSummary;
  items: TutorScheduleItem[];
}

export interface TutorAvailabilityDay {
  day: WeekdayName | string;
  windows: ScheduleTimeWindow[];
}

export interface TutorAvailability {
  lectureSlotMinutes: number;
  allowedDays: Array<WeekdayName | string>;
  usingDefault: boolean;
  days: TutorAvailabilityDay[];
}

export interface UpdateTutorAvailabilityPayload {
  days: TutorAvailabilityDay[];
}

export interface ProposeReschedulePayload {
  date: string;
  startTime: string;
  endTime: string;
}

export interface RescheduleMutationResult {
  booking: Booking;
  message?: string;
  rescheduleProposal?: RescheduleProposal | null;
  escrowUnchanged?: boolean;
}

export interface CreateBookingPayload {
  /** User _id of the tutor (not TutorProfile _id). */
  tutor: string;
  /** Alias some backends expect instead of / alongside `tutor`. */
  tutorId?: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  studentId?: string;
  /**
   * `monthly_weekdays` = Mon–Fri classes for ~durationDays (Sat/Sun off).
   * Backend expands to session bookings on tutor confirm.
   */
  mode?: 'monthly_weekdays' | 'single' | string;
  /** Calendar-day window for monthly_weekdays (default 30). */
  durationDays?: number;
}

export interface ConfirmBookingPayload {
  meetingLink?: string;
  /** Development: ask backend to skip wallet escrow hold on confirm. */
  skipEscrow?: boolean;
  bypassPayment?: boolean;
}

export interface BookingMutationResult {
  /** Primary booking: first generated session, or legacy single booking / package doc. */
  booking: Booking;
  sessionAmount?: number;
  escrowRefunded?: boolean;
  message?: string;
  /** Present when tutor confirms a monthly_weekdays package. */
  kind?: BookingKind;
  packageId?: string;
  sessionCount?: number;
  escrowBookingId?: string;
  sessions?: Booking[];
  idempotent?: boolean;
}

export type BookingTab = 'active' | 'pending' | 'past';

export interface RaiseDisputePayload {
  transactionId: string;
  reason: string;
}

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

export interface TutorBookingRelationFlags {
  hasPending: boolean;
  hasActive: boolean;
  canRequest: boolean;
  hasPendingPackage?: boolean;
  hasActivePackage?: boolean;
}

/** GET /api/bookings/with-tutor/:tutorId */
export interface BookingsWithTutorResult {
  tutorId: string;
  hasPending: boolean;
  hasActive: boolean;
  canRequest: boolean;
  hasPendingPackage?: boolean;
  hasActivePackage?: boolean;
  pendingBooking?: Booking | null;
  activeBooking?: Booking | null;
  pendingPackage?: Booking | null;
  activePackage?: Booking | null;
  nextSession?: Booking | null;
  upcomingSessionCount?: number;
  packageSessions?: Booking[];
  openBookings?: Booking[];
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
  /** From POST /api/tutors/search when student is authenticated. */
  relation?: TutorBookingRelationFlags;
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
  /** FYP / demo: mark deposit as mock so backend (or FE) can detect it. */
  isMock?: boolean;
  mock?: boolean;
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
  /** Tutor profile fields (PATCH /api/profile/me when role=tutor). */
  hourlyRate?: number;
  qualification?: string;
  experience?: string;
  experienceYears?: number;
  availability?: boolean;
  subjects?: string[];
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
