import { isTauri } from "@/lib/tauri";
import type { QuotaInput } from "@/types/quota";

export interface CodexQuotaSnapshot {
  fiveHourRemainingPercent: number | null;
  fiveHourResetAtUnixSeconds: number | null;
  weeklyRemainingPercent: number | null;
  weeklyResetAtUnixSeconds: number | null;
  fetchedAtUnixSeconds: number;
}

export function snapshotToQuotaInput(snapshot: CodexQuotaSnapshot): QuotaInput {
  return {
    fiveHourRemainingPercent: snapshot.fiveHourRemainingPercent,
    fiveHourResetAt: unixSecondsToIso(snapshot.fiveHourResetAtUnixSeconds),
    weeklyRemainingPercent: snapshot.weeklyRemainingPercent,
    weeklyResetAt: unixSecondsToIso(snapshot.weeklyResetAtUnixSeconds),
    source: "auto",
  };
}

export async function readCodexQuota(): Promise<QuotaInput | null> {
  if (!isTauri()) return null;
  const { invoke } = await import("@tauri-apps/api/core");
  const snapshot = await invoke<CodexQuotaSnapshot>("read_codex_quota");
  return snapshotToQuotaInput(snapshot);
}

function unixSecondsToIso(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
}
