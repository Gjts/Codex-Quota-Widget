/**
 * Format the time left until `resetAt` as a compact countdown string.
 *
 *   null / invalid      → "--"
 *   already past        → "已复苏" (the spiritual vein has recovered)
 *   >= 1 day            → "3天12时"
 *   < 1 day             → "HH:MM:SS"
 *
 * `now` is injectable so tests stay deterministic.
 */
export function formatCountdown(
  resetAt: string | null,
  now: number = Date.now(),
): string {
  if (!resetAt) return "--";

  const target = new Date(resetAt).getTime();
  if (Number.isNaN(target)) return "--";

  const diff = target - now;
  if (diff <= 0) return "已复苏";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}天${hours}时`;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
