export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export type MessageType =
  | 'text'
  | 'image'
  | 'pdf'
  | 'document'
  | 'voice'
  | 'location'
  | 'homework'
  | 'system'
  | 'session';

export type SystemCardKind =
  | 'homework_shared'
  | 'assignment_received'
  | 'session_reminder'
  | 'ai_summary'
  | 'class_recording'
  | 'booking_confirmed';

export type ChatParticipant = {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'tutor';
  isVerified?: boolean;
  subject?: string;
  isOnline?: boolean;
  lastSeen?: string;
};

export type ReplyPreview = {
  id: string;
  senderName: string;
  text: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  type: MessageType;
  text?: string;
  senderId: string;
  isMine: boolean;
  createdAt: string;
  status?: MessageStatus;
  edited?: boolean;
  reaction?: string;
  replyTo?: ReplyPreview;
  mediaUri?: string;
  fileName?: string;
  fileSize?: string;
  durationSec?: number;
  locationLabel?: string;
  systemKind?: SystemCardKind;
  systemTitle?: string;
  systemSubtitle?: string;
};

export type ChatConversation = {
  id: string;
  participant: ChatParticipant;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  pinned?: boolean;
  archived?: boolean;
  isTyping?: boolean;
  lastStatus?: MessageStatus;
  subject: string;
};

export const MOCK_CURRENT_USER_ID = 'me';

export const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'c1',
    participant: {
      id: 't1',
      name: 'Prof. Ali Ahmed',
      avatar: 'https://i.pravatar.cc/150?u=ali',
      role: 'tutor',
      isVerified: true,
      subject: 'Mathematics',
      isOnline: true,
      lastSeen: 'Online',
    },
    lastMessage: 'Sure — send the homework PDF and I’ll review it tonight.',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    unreadCount: 2,
    pinned: true,
    isTyping: false,
    lastStatus: 'seen',
    subject: 'Mathematics',
  },
  {
    id: 'c2',
    participant: {
      id: 't2',
      name: 'Sara Khan',
      avatar: 'https://i.pravatar.cc/150?u=sara',
      role: 'tutor',
      isVerified: true,
      subject: 'Physics',
      isOnline: false,
      lastSeen: 'Last seen 12m ago',
    },
    lastMessage: 'Typing…',
    lastMessageAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    unreadCount: 0,
    isTyping: true,
    lastStatus: 'delivered',
    subject: 'Physics',
  },
  {
    id: 'c3',
    participant: {
      id: 't3',
      name: 'Dr. Hamza Raza',
      avatar: 'https://i.pravatar.cc/150?u=hamza',
      role: 'tutor',
      isVerified: true,
      subject: 'Chemistry',
      isOnline: true,
      lastSeen: 'Online',
    },
    lastMessage: 'Session reminder: Organic Chemistry in 30 minutes.',
    lastMessageAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    unreadCount: 1,
    lastStatus: 'delivered',
    subject: 'Chemistry',
  },
  {
    id: 'c4',
    participant: {
      id: 't4',
      name: 'Ayesha Malik',
      avatar: 'https://i.pravatar.cc/150?u=ayesha',
      role: 'tutor',
      isVerified: false,
      subject: 'English',
      isOnline: false,
      lastSeen: 'Yesterday',
    },
    lastMessage: 'Great essay draft — a few edits on structure.',
    lastMessageAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    lastStatus: 'seen',
    subject: 'English',
  },
  {
    id: 'c5',
    participant: {
      id: 't5',
      name: 'Usman Tariq',
      avatar: 'https://i.pravatar.cc/150?u=usman',
      role: 'tutor',
      isVerified: true,
      subject: 'Computer Science',
      isOnline: false,
      lastSeen: 'Last seen Mon',
    },
    lastMessage: 'I’ve shared the AI summary of our last class.',
    lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    archived: false,
    lastStatus: 'seen',
    subject: 'Computer Science',
  },
];

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minsAgo = (m: number) =>
  new Date(Date.now() - m * 60 * 1000).toISOString();

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: 'm1',
      chatId: 'c1',
      type: 'system',
      senderId: 'system',
      isMine: false,
      createdAt: hoursAgo(26),
      systemKind: 'booking_confirmed',
      systemTitle: 'Booking Confirmed',
      systemSubtitle: 'Mathematics · Today 6:00 PM · 60 min',
    },
    {
      id: 'm2',
      chatId: 'c1',
      type: 'text',
      text: 'Assalam o Alaikum! Looking forward to our calculus session.',
      senderId: 'me',
      isMine: true,
      createdAt: hoursAgo(5),
      status: 'seen',
    },
    {
      id: 'm3',
      chatId: 'c1',
      type: 'text',
      text: 'Wa Alaikum Assalam! Please revise derivatives before we start.',
      senderId: 't1',
      isMine: false,
      createdAt: hoursAgo(4.8),
      status: 'seen',
      reaction: '👍',
    },
    {
      id: 'm4',
      chatId: 'c1',
      type: 'homework',
      text: 'Homework set for Chapter 4',
      fileName: 'derivatives-practice.pdf',
      fileSize: '1.2 MB',
      senderId: 't1',
      isMine: false,
      createdAt: hoursAgo(4),
      systemKind: 'homework_shared',
      systemTitle: 'Homework Shared',
      systemSubtitle: 'Complete Q1–Q12 before the session',
    },
    {
      id: 'm5',
      chatId: 'c1',
      type: 'voice',
      senderId: 'me',
      isMine: true,
      createdAt: hoursAgo(2),
      status: 'delivered',
      durationSec: 18,
    },
    {
      id: 'm6',
      chatId: 'c1',
      type: 'text',
      text: 'Got it — I’ll send my attempt after Maghrib.',
      senderId: 'me',
      isMine: true,
      createdAt: minsAgo(40),
      status: 'seen',
      replyTo: {
        id: 'm4',
        senderName: 'Prof. Ali Ahmed',
        text: 'Homework set for Chapter 4',
      },
      edited: true,
    },
    {
      id: 'm7',
      chatId: 'c1',
      type: 'system',
      senderId: 'system',
      isMine: false,
      createdAt: minsAgo(20),
      systemKind: 'session_reminder',
      systemTitle: 'Session Reminder',
      systemSubtitle: 'Your Mathematics class starts in 30 minutes',
    },
    {
      id: 'm8',
      chatId: 'c1',
      type: 'text',
      text: 'Sure — send the homework PDF and I’ll review it tonight.',
      senderId: 't1',
      isMine: false,
      createdAt: minsAgo(2),
    },
    {
      id: 'm9',
      chatId: 'c1',
      type: 'session',
      senderId: 't1',
      isMine: false,
      createdAt: minsAgo(1),
      systemTitle: 'Tutor has started your session',
      systemSubtitle: 'Mathematics live class is ready',
    },
  ],
};

export const ATTACHMENT_OPTIONS = [
  { id: 'camera', label: 'Camera', icon: 'camera', color: '#7548F5' },
  { id: 'gallery', label: 'Gallery', icon: 'image-multiple', color: '#8F73FD' },
  { id: 'document', label: 'Document', icon: 'file-document', color: '#5B4FF5' },
  { id: 'homework', label: 'Homework', icon: 'book-education', color: '#A855F7' },
  { id: 'location', label: 'Location', icon: 'map-marker', color: '#22C55E' },
  { id: 'audio', label: 'Audio', icon: 'microphone', color: '#F59E0B' },
] as const;
