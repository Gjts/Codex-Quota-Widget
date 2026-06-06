import { describe, expect, it } from "vitest";
import { snapshotToQuotaInput } from "./codexQuota";

describe("snapshotToQuotaInput", () => {
  it("maps the local Codex quota snapshot into store input", () => {
    const input = snapshotToQuotaInput({
      fiveHourRemainingPercent: 68,
      fiveHourResetAtUnixSeconds: 1780123456,
      weeklyRemainingPercent: 40,
      weeklyResetAtUnixSeconds: 1780999999,
      fetchedAtUnixSeconds: 1780000000,
    });

    expect(input).toEqual({
      fiveHourRemainingPercent: 68,
      fiveHourResetAt: "2026-05-30T06:44:16.000Z",
      weeklyRemainingPercent: 40,
      weeklyResetAt: "2026-06-09T10:13:19.000Z",
      source: "auto",
    });
  });

  it("preserves unknown reset times as null", () => {
    const input = snapshotToQuotaInput({
      fiveHourRemainingPercent: null,
      fiveHourResetAtUnixSeconds: null,
      weeklyRemainingPercent: 90,
      weeklyResetAtUnixSeconds: null,
      fetchedAtUnixSeconds: 1780000000,
    });

    expect(input.fiveHourResetAt).toBeNull();
    expect(input.weeklyResetAt).toBeNull();
  });
});
