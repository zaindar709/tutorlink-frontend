/**
 * Feature flags for FYP demo / development.
 *
 * MOCK_WALLET_DEPOSITS — student adds demo funds via Wallet (real API credit).
 * Escrow still runs on tutor accept so the wallet system is demoable live.
 *
 * DEV_SKIP_WALLET_ESCROW — only if backend blocks confirm without funds and
 * mock deposit cannot credit the wallet. Prefer leaving this false for demos.
 *
 * PANEL_DEMO_SESSION_MINUTES — treat each accepted session as ending this many
 * minutes after startTime (instead of booking.endTime). Set to `null` for real
 * 90‑min slots. Use `1` so the panel can Complete → see tutor Earnings quickly.
 */
export const MOCK_WALLET_DEPOSITS = true;

/** Prefer false for FYP: use mock-funded balance + real escrow hold. */
export const DEV_SKIP_WALLET_ESCROW = false;

/** Panel demo: session “ends” 1 minute after start so Complete + escrow release is quick. */
export const PANEL_DEMO_SESSION_MINUTES: number | null = 1;
