import type { QuotaState } from "@/types/quota";
import { getQuotaStatus } from "@/features/quota/status";
import { formatCountdown } from "@/features/quota/countdown";

/** Demo data so the widget shows something before the user enters real quota. */
export function createMockQuota(now: number = Date.now()): QuotaState {
  const fiveHourReset = new Date(now + (2 * 3600 + 14 * 60) * 1000).toISOString();
  const weeklyReset = new Date(now + (3 * 86400 + 12 * 3600) * 1000).toISOString();
  return {
    fiveHour: {
      remainingPercent: 68,
      usedPercent: 32,
      resetAt: fiveHourReset,
      resetCountdownText: formatCountdown(fiveHourReset, now),
      status: getQuotaStatus(68),
    },
    weekly: {
      remainingPercent: 41,
      usedPercent: 59,
      resetAt: weeklyReset,
      resetCountdownText: formatCountdown(weeklyReset, now),
      status: getQuotaStatus(41),
    },
    source: "mock",
    lastUpdatedAt: new Date(now).toISOString(),
  };
}
