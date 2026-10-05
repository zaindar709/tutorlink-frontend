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
    ? `Total: ${timing.totalMs}ms`
    : `Failed after ${timing.totalMs}ms`;

  return [header, ...lines, timing.extra].filter(Boolean).join('\n');
};

export const nowMs = () => Date.now();

export const speedLog = (
  _step: string,
  _detail?: Record<string, unknown>
) => {
  /* debug logging disabled */
};

/** Returns elapsed ms. */
export const speedDone = (
  _step: string,
  startedAt: number,
  _detail?: Record<string, unknown>
) => Date.now() - startedAt;

export const createSpeedTimer = (label: string) => {
  const startedAt = Date.now();
  const steps: Array<{ name: string; ms: number }> = [];

  return {
    step: (name: string, started: number, detail?: Record<string, unknown>) => {
      const ms = speedDone(name, started, detail);
      steps.push({ name, ms });
      return ms;
    },
    mark: (step: string, detail?: Record<string, unknown>) =>
      speedDone(`${label} › ${step}`, startedAt, detail),
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
