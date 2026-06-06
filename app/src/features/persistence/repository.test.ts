import { describe, expect, it } from "vitest";
import { fromPersistedQuota, toPersistedQuota } from "./repository";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { useAppStore } from "@/store/useAppStore";

describe("persisted quota transforms", () => {
  it("round-trips known values (preserving source + lastUpdatedAt)", () => {
    useAppStore.getState().setQuota({
      fiveHourRemainingPercent: 68,
      fiveHourResetAt: new Date(Date.now() + 3600_000).toISOString(),
      weeklyRemainingPercent: 41,
      weeklyResetAt: new Date(Date.now() + 86400_000).toISOString(),
    });
    const q = useAppStore.getState().quota;
    const p = toPersistedQuota(q);
    expect(p.fiveHourRemainingPercent).toBe(68);

    const back = fromPersistedQuota(p, DEFAULT_SETTINGS);
    expect(back.fiveHour.remainingPercent).toBe(68);
    expect(back.fiveHour.status).toBe("normal");
    expect(back.source).toBe(q.source);
    expect(back.lastUpdatedAt).toBe(q.lastUpdatedAt);
  });

  it("maps NaN (unknown) to null and back to unknown", () => {
    useAppStore.getState().setQuota({
      fiveHourRemainingPercent: null,
      fiveHourResetAt: null,
      weeklyRemainingPercent: 50,
      weeklyResetAt: null,
    });
    const p = toPersistedQuota(useAppStore.getState().quota);
    expect(p.fiveHourRemainingPercent).toBeNull();

    const back = fromPersistedQuota(p, DEFAULT_SETTINGS);
    expect(Number.isNaN(back.fiveHour.remainingPercent)).toBe(true);
    expect(back.fiveHour.status).toBe("unknown");
  });
});
