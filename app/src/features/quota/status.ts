import type { QuotaStatus } from "@/types/quota";

/**
 * Bucket a remaining-percentage into a {@link QuotaStatus}.
 *
 * Order matters — most severe checks first:
 *   <= 0            → exhausted
 *   <= danger       → danger
 *   <= warning      → warning
 *   >= 80           → excellent
 *   otherwise       → normal
 *
 * `NaN` (quota not entered yet) maps to "unknown".
 */
export function getQuotaStatus(
  remainingPercent: number,
  warningThreshold = 30,
  dangerThreshold = 15,
): QuotaStatus {
  if (Number.isNaN(remainingPercent)) return "unknown";
  if (remainingPercent <= 0) return "exhausted";
  if (remainingPercent <= dangerThreshold) return "danger";
  if (remainingPercent <= warningThreshold) return "warning";
  if (remainingPercent >= 80) return "excellent";
  return "normal";
}

/** Severity ranking; higher = worse. `unknown` is special-cased in {@link moreSevere}. */
export const STATUS_SEVERITY: Record<QuotaStatus, number> = {
  unknown: -1,
  excellent: 0,
  normal: 1,
  warning: 2,
  danger: 3,
  exhausted: 4,
};

/**
 * Pick the more severe of two statuses (used to derive one overall widget
 * status from the 5-hour and weekly cycles). A known status always wins over
 * `unknown`.
 */
export function moreSevere(a: QuotaStatus, b: QuotaStatus): QuotaStatus {
  if (a === "unknown") return b;
  if (b === "unknown") return a;
  return STATUS_SEVERITY[a] >= STATUS_SEVERITY[b] ? a : b;
}
