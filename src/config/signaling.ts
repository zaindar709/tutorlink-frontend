import { API_BASE_URL } from './api';

/**
 * Classroom signaling uses the same TutorLink backend host as REST + chat.
 * Handlers are mounted on the existing Socket.IO instance (no separate port).
 *
 * Local standalone `signaling-server/` is demo-only and uses different event
 * names — production FE must talk to Render with backend event names.
 */
export const SIGNALING_BASE_URL = API_BASE_URL;

/** Default Socket.IO path (same as chat). */
export const SIGNALING_PATH = '/socket.io';
