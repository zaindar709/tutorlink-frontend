export type StudentCertificate = {
  id: string;
  title: string;
  subject: string;
  tutorName: string;
  issuedAt: string;
  grade: string;
};

export type StudentSessionHistoryItem = {
  id: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  status: 'completed' | 'cancelled' | 'missed';
  rating?: number;
};

export type StudentNotificationPref = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: string;
};

export type StudentHelpFaq = {
  id: string;
  question: string;
  answer: string;
};

export const DEFAULT_STUDENT_PROFILE = {
  name: 'Ahmed Khan',
  email: 'ahmed.khan@student.com',
  phone: '+92 300 9876543',
  grade: 'Class 10',
  board: 'Federal Board',
  publicId: 'TL-STU-20481',
  bio: 'Focused on Physics and Mathematics. Preparing for board exams.',
  interests: ['Physics', 'Mathematics', 'Chemistry'],
  avatarUri: null as string | null,
};

export const MOCK_CERTIFICATES: StudentCertificate[] = [
  {
    id: 'cert-1',
    title: 'Physics Mastery',
    subject: 'Physics',
    tutorName: 'Prof. Ali Ahmed',
    issuedAt: '2026-06-12',
    grade: 'A',
  },
  {
    id: 'cert-2',
    title: 'Algebra Foundations',
    subject: 'Mathematics',
    tutorName: 'Sara Malik',
    issuedAt: '2026-05-28',
    grade: 'A+',
  },
  {
    id: 'cert-3',
    title: 'Organic Chemistry Basics',
    subject: 'Chemistry',
    tutorName: 'Dr. Hassan Raza',
    issuedAt: '2026-04-15',
    grade: 'B+',
  },
];

export const MOCK_SESSION_HISTORY: StudentSessionHistoryItem[] = [
  {
    id: 'sess-1',
    tutorName: 'Prof. Ali Ahmed',
    subject: 'Physics — Waves',
    date: 'Jul 18, 2026',
    time: '4:00 PM – 5:00 PM',
    duration: '60 min',
    status: 'completed',
    rating: 5,
  },
  {
    id: 'sess-2',
    tutorName: 'Sara Malik',
    subject: 'Mathematics — Calculus',
    date: 'Jul 14, 2026',
    time: '6:00 PM – 7:00 PM',
    duration: '60 min',
    status: 'completed',
    rating: 4,
  },
  {
    id: 'sess-3',
    tutorName: 'Dr. Hassan Raza',
    subject: 'Chemistry — Organic',
    date: 'Jul 10, 2026',
    time: '3:00 PM – 4:00 PM',
    duration: '60 min',
    status: 'completed',
    rating: 5,
  },
  {
    id: 'sess-4',
    tutorName: 'Prof. Ali Ahmed',
    subject: 'Physics — Mechanics',
    date: 'Jul 02, 2026',
    time: '5:00 PM – 6:00 PM',
    duration: '60 min',
    status: 'cancelled',
  },
];

export const MOCK_NOTIFICATION_PREFS: StudentNotificationPref[] = [
  {
    id: 'booking',
    title: 'Booking reminders',
    description: 'Alerts before upcoming sessions',
    enabled: true,
    icon: 'calendar-clock',
  },
  {
    id: 'messages',
    title: 'New messages',
    description: 'When a tutor sends you a message',
    enabled: true,
    icon: 'message-text-outline',
  },
  {
    id: 'promotions',
    title: 'Offers & promotions',
    description: 'Discounts and platform updates',
    enabled: false,
    icon: 'tag-outline',
  },
  {
    id: 'parent',
    title: 'Parent link updates',
    description: 'When a parent links your account',
    enabled: true,
    icon: 'account-group-outline',
  },
];

export const MOCK_HELP_FAQS: StudentHelpFaq[] = [
  {
    id: 'faq-1',
    question: 'How do I book a tutor?',
    answer:
      'Go to Search, pick a subject and tutor, then tap Book Session. Choose a time slot and confirm.',
  },
  {
    id: 'faq-2',
    question: 'How does parent linking work?',
    answer:
      'From Profile → Link Parent Account, generate a code and share it with your parent. They enter it in their app to connect.',
  },
  {
    id: 'faq-3',
    question: 'Can I reschedule a session?',
    answer:
      'Yes. Open Bookings, select your session, and use Reschedule if the tutor allows it.',
  },
  {
    id: 'faq-4',
    question: 'Where are my certificates?',
    answer:
      'Certificates appear under Profile → Certificates after you complete milestone sessions.',
  },
];

export const MOCK_LINKED_PARENTS: { id: string; name: string; email: string; linkedAt: string }[] =
  [];
