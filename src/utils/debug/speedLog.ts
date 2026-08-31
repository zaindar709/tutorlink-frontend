const LOG = '[SPEED]';

export type AuthTimingBreakdown = {
  label: string;
  totalMs: number;
  steps: Array<{ name: string; ms: number }>;
  ok: boolean;
  extra?: string;
};

let lastAuthTiming: AuthTimingBreakdown | null = null;

export const getLastAuthTiming = () => lastAuthTiming;

/** Human-readable text for Alert.alert body. */
export const formatAuthTimingForAlert = (
  timing: AuthTimingBreakdown | null = lastAuthTiming
): string => {
  if (!timing) {
    return '';
  }

  const lines = timing.steps.map(s => `• ${s.name}: ${s.ms}ms`);
  const header = timing.ok
    ? `⏱ Total: ${timing.totalMs}ms`
    : `⏱ Failed after ${timing.totalMs}ms`;

  return [header, ...lines, timing.extra].filter(Boolean).join('\n');
};

export const nowMs = () => Date.now();

export const speedLog = (
  step: string,
  detail?: Record<string, unknown>
) => {
  if (!__DEV__) return;
  if (detail) {
    console.log(LOG, step, detail);
    return;
  }
  console.log(LOG, step);
};

/** Returns elapsed ms and logs it. */
export const speedDone = (
  step: string,
  startedAt: number,
  detail?: Record<string, unknown>
) => {
  const ms = Date.now() - startedAt;
  if (__DEV__) {
    console.log(LOG, step, { ms, ...detail });
  }
  return ms;
};

export const createSpeedTimer = (label: string) => {
  const startedAt = Date.now();
  const steps: Array<{ name: string; ms: number }> = [];
  if (__DEV__) {
    console.log(LOG, `${label} START`);
  }

  return {
    step: (name: string, started: number, detail?: Record<string, unknown>) => {
      const ms = speedDone(name, started, detail);
      steps.push({ name, ms });
      return ms;
    },
    mark: (step: string, detail?: Record<string, unknown>) => {
      return speedDone(`${label} › ${step}`, startedAt, detail);
    },
    end: (detail?: Record<string, unknown> & { ok?: boolean; extra?: string }) => {
      const totalMs = speedDone(`${label} TOTAL`, startedAt, detail);
      const ok = detail?.ok !== false && !detail?.failed;
      lastAuthTiming = {
        label,
        totalMs,
        steps,
        ok,
        extra: typeof detail?.extra === 'string' ? detail.extra : undefined,
      };
      return totalMs;
    },
    getSteps: () => steps,
  };
};
