/**
 * Google Gemini configuration for TutorLink AI recommendations.
 *
 * Paste your API key below when ready — no UI/business-logic changes needed.
 * Prefer a backend proxy in production; client-side key is OK for FYP demos.
 */
export const GEMINI_CONFIG = {
  /** Paste key here, e.g. 'AIza...' — leave empty to use offline ranking fallback. */
  apiKey: '',
  model: 'gemini-2.0-flash',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  timeoutMs: 20000,
  maxCandidates: 8,
} as const;

export const isGeminiConfigured = (): boolean =>
  typeof GEMINI_CONFIG.apiKey === 'string' && GEMINI_CONFIG.apiKey.trim().length > 10;
