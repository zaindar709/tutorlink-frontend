/** 1920×1080 · 30fps · ~86s cinematic promo with educational soundtrack. */

export const FPS = 30;
export const DURATION = 86;
export const STAGE_W = 1920;
export const STAGE_H = 1080;

export type SceneId =
  | 'intro'
  | 'problem'
  | 'home'
  | 'search'
  | 'profile'
  | 'booking'
  | 'live'
  | 'ai'
  | 'schedule'
  | 'wallet'
  | 'chat'
  | 'tutor'
  | 'parent'
  | 'rating'
  | 'admin'
  | 'tech'
  | 'montage'
  | 'outro';

export type Scene = {
  id: SceneId;
  start: number;
  end: number;
  caption: string;
  sub?: string;
};

export const SCENES: Scene[] = [
  { id: 'intro', start: 0, end: 5.4, caption: 'TutorLink', sub: 'Learn with Ease' },
  {
    id: 'problem',
    start: 5.2,
    end: 9.6,
    caption: 'Finding the right tutor shouldn’t be complicated.',
  },
  {
    id: 'home',
    start: 9.3,
    end: 13.6,
    caption: 'TutorLink brings it all together.',
    sub: 'Everything you need, in one platform.',
  },
  {
    id: 'search',
    start: 13.3,
    end: 18.6,
    caption: 'Find the right tutor for your learning goals.',
  },
  {
    id: 'profile',
    start: 18.3,
    end: 23.1,
    caption: 'Choose tutors based on skills, experience and availability.',
  },
  {
    id: 'booking',
    start: 22.8,
    end: 28.1,
    caption: 'Book one-on-one learning sessions with ease.',
  },
  {
    id: 'live',
    start: 27.8,
    end: 33.6,
    caption: 'Learn face-to-face with live one-on-one sessions.',
  },
  {
    id: 'ai',
    start: 33.3,
    end: 40.2,
    caption: 'AI-powered summaries turn every session into useful learning insights.',
  },
  {
    id: 'schedule',
    start: 39.9,
    end: 43.6,
    caption: 'Stay organized with simple scheduling and bookings.',
  },
  {
    id: 'wallet',
    start: 43.3,
    end: 47.2,
    caption: 'Simple and transparent in-app payments.',
  },
  {
    id: 'chat',
    start: 46.9,
    end: 51.2,
    caption: 'Stay connected with secure in-app communication.',
  },
  {
    id: 'tutor',
    start: 50.9,
    end: 57.6,
    caption: 'And for tutors.',
    sub: 'Manage requests, schedules and earnings from one place.',
  },
  {
    id: 'parent',
    start: 57.3,
    end: 62.8,
    caption: 'Parents stay connected with their child’s learning journey.',
  },
  {
    id: 'rating',
    start: 62.5,
    end: 65.8,
    caption: 'Every session helps build a better learning experience.',
  },
  {
    id: 'admin',
    start: 65.5,
    end: 70.4,
    caption: 'Powerful tools for managing the entire learning ecosystem.',
  },
  {
    id: 'tech',
    start: 70.1,
    end: 73.8,
    caption: 'Built with modern technologies for a connected learning experience.',
  },
  { id: 'montage', start: 73.5, end: 78.4, caption: 'Everything you need, in one platform.' },
  {
    id: 'outro',
    start: 78.1,
    end: 86,
    caption: 'Learn smarter. Teach better. Connect easier.',
    sub: 'TutorLink — Learn with Ease',
  },
];

export const SFX_CUES: { t: number; kind: 'tap' | 'whoosh' | 'success' | 'notify' | 'click' }[] = [
  { t: 9.55, kind: 'whoosh' },
  { t: 13.7, kind: 'tap' },
  { t: 15.15, kind: 'click' },
  { t: 17.05, kind: 'tap' },
  { t: 18.55, kind: 'whoosh' },
  { t: 22.4, kind: 'tap' },
  { t: 24.35, kind: 'tap' },
  { t: 25.45, kind: 'tap' },
  { t: 26.7, kind: 'success' },
  { t: 29.15, kind: 'tap' },
  { t: 33.7, kind: 'whoosh' },
  { t: 36.6, kind: 'notify' },
  { t: 44.2, kind: 'click' },
  { t: 48.55, kind: 'tap' },
  { t: 49.35, kind: 'success' },
  { t: 51.2, kind: 'whoosh' },
  { t: 54.4, kind: 'tap' },
  { t: 55.15, kind: 'success' },
  { t: 57.5, kind: 'whoosh' },
  { t: 63.85, kind: 'tap' },
  { t: 64.7, kind: 'success' },
  { t: 65.7, kind: 'whoosh' },
  { t: 73.7, kind: 'whoosh' },
  { t: 78.3, kind: 'whoosh' },
];

export const MONTAGE_SHOTS: { id: SceneId; label: string }[] = [
  { id: 'search', label: 'Search Tutors' },
  { id: 'profile', label: 'Tutor Profiles' },
  { id: 'booking', label: 'Booking' },
  { id: 'live', label: 'Live Sessions' },
  { id: 'ai', label: 'AI Summaries' },
  { id: 'chat', label: 'Chat' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'parent', label: 'Parent Dashboard' },
  { id: 'admin', label: 'Admin Dashboard' },
];

export function clamp(n: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, n));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInCubic(t: number) {
  return t * t * t;
}

export function sceneOpacity(t: number, start: number, end: number, fade = 0.38) {
  if (t < start || t > end) return 0;
  if (t < start + fade) return easeInOut((t - start) / fade);
  if (t > end - fade) return easeInOut((end - t) / fade);
  return 1;
}

export function localT(t: number, start: number, end: number) {
  return clamp((t - start) / Math.max(0.001, end - start));
}

export function activeScenes(t: number) {
  return SCENES.filter(s => sceneOpacity(t, s.start, s.end) > 0.01);
}
