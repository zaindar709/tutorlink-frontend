/**
 * Feature flags for FYP demo / development.
 *
 * MOCK_WALLET_DEPOSITS — student adds demo funds via Wallet (real API credit).
 * Escrow still runs on tutor accept so the wallet system is demoable live.
 *
 * DEV_SKIP_WALLET_ESCROW — only if backend blocks confirm without funds and
 * mock deposit cannot credit the wallet. Prefer leaving this false for demos.
 */
export const MOCK_WALLET_DEPOSITS = true;

/** Prefer false for FYP: use mock-funded balance + real escrow hold. */
export const DEV_SKIP_WALLET_ESCROW = false;
