import { isTauri } from "@/lib/tauri";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { QuotaSource, QuotaState } from "@/types/quota";
import { buildCycle } from "@/store/useAppStore";

const FILE = "codex-quota-widget.json";

/**
 * Persisted quota shape — only the raw inputs, never the derived/stale fields
 * (status, countdown text). `NaN` "unknown" is stored as `null` so it survives
 * JSON, and rebuilt on load.
 */
export interface PersistedQuota {
  fiveHourRemainingPercent: number | null;
  fiveHourResetAt: string | null;
  weeklyRemainingPercent: number | null;
  weeklyResetAt: string | null;
  source: QuotaSource;
  lastUpdatedAt: string;
}

export function toPersistedQuota(q: QuotaState): PersistedQuota {
  const nz = (n: number) => (Number.isNaN(n) ? null : n);
  return {
    fiveHourRemainingPercent: nz(q.fiveHour.remainingPercent),
    fiveHourResetAt: q.fiveHour.resetAt,
    weeklyRemainingPercent: nz(q.weekly.remainingPercent),
    weeklyResetAt: q.weekly.resetAt,
    source: q.source,
    lastUpdatedAt: q.lastUpdatedAt,
  };
}

export function fromPersistedQuota(
  p: PersistedQuota,
  settings: AppSettings,
  now = Date.now(),
): QuotaState {
  return {
    fiveHour: buildCycle(p.fiveHourRemainingPercent, p.fiveHourResetAt, settings, now),
    weekly: buildCycle(p.weeklyRemainingPercent, p.weeklyResetAt, settings, now),
    source: p.source,
    lastUpdatedAt: p.lastUpdatedAt,
  };
}

async function getStore() {
  const { load } = await import("@tauri-apps/plugin-store");
  // `defaults: {}` = no seeded values; existing file contents are preserved.
  return load(FILE, { autoSave: false, defaults: {} });
}

/** Load persisted settings + quota. Returns {} outside Tauri or on any error. */
export async function loadPersisted(): Promise<{
  settings?: AppSettings;
  quota?: PersistedQuota;
}> {
  if (!isTauri()) return {};
  try {
    const store = await getStore();
    const settings = (await store.get("settings")) as AppSettings | undefined;
    const quota = (await store.get("quota")) as PersistedQuota | undefined;
    return {
      // Merge over defaults so newly-added settings keys are never missing.
      settings: settings ? { ...DEFAULT_SETTINGS, ...settings } : undefined,
      quota: quota ?? undefined,
    };
  } catch (e) {
    console.error("[persistence] load failed", e);
    return {};
  }
}

/** Persist settings + quota to disk. No-op outside Tauri; never throws. */
export async function persist(
  settings: AppSettings,
  quota: QuotaState,
): Promise<void> {
  if (!isTauri()) return;
  try {
    const store = await getStore();
    await store.set("settings", settings);
    await store.set("quota", toPersistedQuota(quota));
    await store.save();
  } catch (e) {
    console.error("[persistence] save failed", e);
  }
}
