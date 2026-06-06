/** Status buckets for a quota cycle, from best to worst (+ unknown). */
export type QuotaStatus =
  | "excellent"
  | "normal"
  | "warning"
  | "danger"
  | "exhausted"
  | "unknown";

/** Where a quota reading came from. */
export type QuotaSource = "manual" | "parser" | "auto" | "mock";

/** One quota cycle (either the 5-hour window or the weekly window). */
export interface QuotaCycle {
  /** Remaining quota 0-100. `NaN` means "not entered yet" (status === "unknown"). */
  remainingPercent: number;
  /** Used quota 0-100, derived as 100 - remaining. `NaN` when unknown. */
  usedPercent: number;
  /** ISO timestamp when the cycle resets, or null if unknown. */
  resetAt: string | null;
  /** Human-readable countdown text, refreshed every tick. */
  resetCountdownText: string;
  /** Derived status bucket. */
  status: QuotaStatus;
}

/** Full quota snapshot shown by the widget. */
export interface QuotaState {
  /** 5小时额度 → 小周天灵力 */
  fiveHour: QuotaCycle;
  /** 每周额度 → 大周天道蕴 */
  weekly: QuotaCycle;
  source: QuotaSource;
  /** ISO timestamp of the last update. */
  lastUpdatedAt: string;
}

/** Raw user/parser input before it is turned into a {@link QuotaState}. */
export interface QuotaInput {
  fiveHourRemainingPercent: number | null;
  fiveHourResetAt: string | null;
  weeklyRemainingPercent: number | null;
  weeklyResetAt: string | null;
  source?: QuotaSource;
}
