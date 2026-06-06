import type { QuotaStatus } from "@/types/quota";
import { STATUS_SEVERITY } from "@/features/quota/status";

const NOTIFY_LEVELS: ReadonlySet<QuotaStatus> = new Set([
  "warning",
  "danger",
  "exhausted",
]);

/**
 * Anti-spam decision: notify only when a cycle *worsens into* a
 * warning/danger/exhausted level.
 *
 * - First observation (prev === undefined) never notifies (no startup spam).
 * - Improving (danger → warning) never notifies.
 * - Staying at the same level never notifies.
 * - Recovery notifications are a V1.0 feature (not handled here).
 */
export function shouldNotify(
  prev: QuotaStatus | undefined,
  next: QuotaStatus,
): boolean {
  if (prev === undefined) return false;
  if (!NOTIFY_LEVELS.has(next)) return false;
  return STATUS_SEVERITY[next] > STATUS_SEVERITY[prev];
}
