/** Result of validating a single percentage field. */
export interface PercentResult {
  ok: boolean;
  /** Parsed value, or null when the field was left blank (= unknown). */
  value: number | null;
  error?: string;
}

/** Validate a remaining-percent input string. Blank → null (unknown). */
export function validatePercent(raw: string): PercentResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return { ok: false, value: null, error: "请输入数字" };
  if (n < 0 || n > 100)
    return { ok: false, value: null, error: "百分比需在 0–100 之间" };
  return { ok: true, value: n };
}

/** Danger threshold must be a valid percent and strictly below the warning one. */
export function validateThresholds(
  warning: number,
  danger: number,
): { ok: boolean; error?: string } {
  if (!Number.isFinite(warning) || !Number.isFinite(danger))
    return { ok: false, error: "阈值必须是数字" };
  if (warning < 0 || warning > 100 || danger < 0 || danger > 100)
    return { ok: false, error: "阈值需在 0–100 之间" };
  if (danger >= warning)
    return { ok: false, error: "危险阈值必须小于警告阈值" };
  return { ok: true };
}

/** ISO string -> value for <input type="datetime-local"> (local time, no tz). */
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value -> ISO string (or null when blank). */
export function localInputToIso(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
