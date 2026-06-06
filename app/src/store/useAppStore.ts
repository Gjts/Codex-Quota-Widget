import { create } from "zustand";
import type {
  QuotaCycle,
  QuotaInput,
  QuotaState,
  QuotaStatus,
} from "@/types/quota";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { getQuotaStatus, moreSevere } from "@/features/quota/status";
import { formatCountdown } from "@/features/quota/countdown";
import { createMockQuota } from "@/features/quota/mock";

function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, n));
}

/** Build a quota cycle from a raw remaining value (`null` → unknown). */
export function buildCycle(
  remaining: number | null,
  resetAt: string | null,
  settings: AppSettings,
  now: number,
): QuotaCycle {
  const hasValue = remaining !== null && !Number.isNaN(remaining);
  const remainingPercent = hasValue ? clampPercent(remaining) : NaN;
  return {
    remainingPercent,
    usedPercent: hasValue ? 100 - remainingPercent : NaN,
    resetAt,
    resetCountdownText: formatCountdown(resetAt, now),
    status: hasValue
      ? getQuotaStatus(
          remainingPercent,
          settings.warningThreshold,
          settings.dangerThreshold,
        )
      : "unknown",
  };
}

/** Recompute only the status bucket (after thresholds change). */
function recomputeCycleStatus(
  cycle: QuotaCycle,
  settings: AppSettings,
): QuotaCycle {
  if (Number.isNaN(cycle.remainingPercent)) {
    return { ...cycle, status: "unknown" };
  }
  return {
    ...cycle,
    status: getQuotaStatus(
      cycle.remainingPercent,
      settings.warningThreshold,
      settings.dangerThreshold,
    ),
  };
}

export interface AppStore {
  quota: QuotaState;
  settings: AppSettings;
  /** Set quota from raw input (manual form / parser / auto detect). */
  setQuota: (input: QuotaInput) => void;
  /** Merge a settings patch; recomputes statuses if thresholds changed. */
  updateSettings: (patch: Partial<AppSettings>) => void;
  /** Refresh countdown text for both cycles (called ~once per second). */
  tick: () => void;
  /** Replace state from persistence (Phase 5). */
  hydrate: (data: { quota?: QuotaState; settings?: AppSettings }) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  quota: createMockQuota(),
  settings: DEFAULT_SETTINGS,

  setQuota: (input) => {
    const now = Date.now();
    const { settings } = get();
    set({
      quota: {
        fiveHour: buildCycle(
          input.fiveHourRemainingPercent,
          input.fiveHourResetAt,
          settings,
          now,
        ),
        weekly: buildCycle(
          input.weeklyRemainingPercent,
          input.weeklyResetAt,
          settings,
          now,
        ),
        source: input.source ?? "manual",
        lastUpdatedAt: new Date(now).toISOString(),
      },
    });
  },

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    const { quota } = get();
    set({
      settings,
      quota: {
        ...quota,
        fiveHour: recomputeCycleStatus(quota.fiveHour, settings),
        weekly: recomputeCycleStatus(quota.weekly, settings),
      },
    });
  },

  tick: () => {
    const now = Date.now();
    const { quota } = get();
    set({
      quota: {
        ...quota,
        fiveHour: {
          ...quota.fiveHour,
          resetCountdownText: formatCountdown(quota.fiveHour.resetAt, now),
        },
        weekly: {
          ...quota.weekly,
          resetCountdownText: formatCountdown(quota.weekly.resetAt, now),
        },
      },
    });
  },

  hydrate: ({ quota, settings }) => {
    set((state) => ({
      quota: quota ?? state.quota,
      settings: settings ? { ...DEFAULT_SETTINGS, ...settings } : state.settings,
    }));
  },
}));

/** Derive one overall widget status from both cycles (worse one wins). */
export function selectOverallStatus(quota: QuotaState): QuotaStatus {
  return moreSevere(quota.fiveHour.status, quota.weekly.status);
}
