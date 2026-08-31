import { API_BASE_URL } from '../../config/api';

const LOG = '[ApiWarmup]';

/** Render free tier sleeps after ~15 min idle — ping sooner to keep APIs warm. */
const KEEP_ALIVE_INTERVAL_MS = 8 * 60 * 1000;
const WARMUP_TIMEOUT_MS = 20_000;

let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let inFlight: Promise<boolean> | null = null;
let lastSuccessAt = 0;

/**
 * Hits the backend root so a sleeping Render instance wakes before real API calls.
 * Safe to call often — concurrent callers share one in-flight request.
 */
export const warmupApi = async (): Promise<boolean> => {
  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WARMUP_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      lastSuccessAt = Date.now();
      console.log(LOG, 'ok', {
        status: response.status,
        ms: Date.now() - started,
      });
      return response.ok || response.status < 500;
    } catch (error) {
      console.warn(LOG, 'failed', {
        ms: Date.now() - started,
        message: error instanceof Error ? error.message : String(error),
      });
      return false;
    } finally {
      clearTimeout(timer);
      inFlight = null;
    }
  })();

  return inFlight;
};

/** Start periodic pings so the server stays awake while the app is open. */
export const startApiKeepAlive = () => {
  void warmupApi();

  if (keepAliveTimer) {
    return;
  }

  keepAliveTimer = setInterval(() => {
    void warmupApi();
  }, KEEP_ALIVE_INTERVAL_MS);
};

export const stopApiKeepAlive = () => {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
};

export const getLastApiWarmupAt = () => lastSuccessAt;
