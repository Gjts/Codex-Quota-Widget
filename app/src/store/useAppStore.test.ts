import { beforeEach, describe, expect, it, vi } from "vitest";
import { selectOverallStatus, useAppStore } from "./useAppStore";
import { DEFAULT_SETTINGS } from "@/types/settings";

const future5h = new Date(Date.now() + 2 * 3600_000).toISOString();
const futureWeek = new Date(Date.now() + 3 * 86400_000).toISOString();

beforeEach(() => {
  // Reset thresholds to defaults between tests (store is a singleton).
  useAppStore.getState().updateSettings(DEFAULT_SETTINGS);
});

describe("setQuota", () => {
  it("derives used%, status and source", () => {
    useAppStore.getState().setQuota({
      fiveHourRemainingPercent: 68,
      fiveHourResetAt: future5h,
      weeklyRemainingPercent: 12,
      weeklyResetAt: futureWeek,
    });
    const { quota } = useAppStore.getState();
    expect(quota.fiveHour.remainingPercent).toBe(68);
    expect(quota.fiveHour.usedPercent).toBe(32);
    expect(quota.fiveHour.status).toBe("normal");
    expect(quota.weekly.status).toBe("danger"); // 12 <= 15
    expect(quota.source).toBe("manual");
  });

  it("treats null remaining as unknown", () => {
    useAppStore.getState().setQuota({
      fiveHourRemainingPercent: null,
      fiveHourResetAt: null,
      weeklyRemainingPercent: 50,
      weeklyResetAt: futureWeek,
    });
    const { quota } = useAppStore.getState();
    expect(quota.fiveHour.status).toBe("unknown");
    expect(Number.isNaN(quota.fiveHour.remainingPercent)).toBe(true);
    expect(quota.weekly.status).toBe("normal");
  });

  it("clamps out-of-range percentages", () => {
    useAppStore.getState().setQuota({
      fiveHourRemainingPercent: 150,
      fiveHourResetAt: future5h,
      weeklyRemainingPercent: -10,
      weeklyResetAt: futureWeek,
    });
    const { quota } = useAppStore.getState();
    expect(quota.fiveHour.remainingPercent).toBe(100);
    expect(quota.weekly.remainingPercent).toBe(0);
    expect(quota.weekly.status).toBe("exhausted");
  });
});

describe("selectOverallStatus", () => {
  it("reflects the worse of the two cycles", () => {
    useAppStore.getState().setQuota({
      fiveHourRemainingPercent: 90,
      fiveHourResetAt: future5h,
      weeklyRemainingPercent: 10,
      weeklyResetAt: futureWeek,
    });
    expect(selectOverallStatus(useAppStore.getState().quota)).toBe("danger");
  });
});

describe("updateSettings", () => {
  it("recomputes status when thresholds change", () => {
    useAppStore.getState().setQuota({
      fiveHourRemainingPercent: 25,
      fiveHourResetAt: future5h,
      weeklyRemainingPercent: 50,
      weeklyResetAt: futureWeek,
    });
    expect(useAppStore.getState().quota.fiveHour.status).toBe("warning"); // 25 <= 30
    useAppStore.getState().updateSettings({ warningThreshold: 20 });
    expect(useAppStore.getState().quota.fiveHour.status).toBe("normal"); // 25 > 20 now
  });
});

describe("tick", () => {
  it("refreshes countdown text deterministically", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T12:00:00Z"));

    const resetAt = new Date(Date.now() + 90 * 60 * 1000).toISOString(); // +1h30m
    useAppStore.getState().setQuota({
      fiveHourRemainingPercent: 50,
      fiveHourResetAt: resetAt,
      weeklyRemainingPercent: 50,
      weeklyResetAt: resetAt,
    });

    useAppStore.getState().tick();
    expect(useAppStore.getState().quota.fiveHour.resetCountdownText).toBe("01:30:00");

    vi.advanceTimersByTime(60 * 1000); // +1 minute
    useAppStore.getState().tick();
    expect(useAppStore.getState().quota.fiveHour.resetCountdownText).toBe("01:29:00");

    vi.useRealTimers();
  });
});
