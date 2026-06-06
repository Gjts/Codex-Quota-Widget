import { describe, expect, it } from "vitest";
import { formatCountdown } from "./countdown";

const NOW = new Date("2026-06-05T12:00:00Z").getTime();

describe("formatCountdown", () => {
  it("returns -- for null or invalid input", () => {
    expect(formatCountdown(null, NOW)).toBe("--");
    expect(formatCountdown("not-a-date", NOW)).toBe("--");
  });

  it("returns 已复苏 once the reset time has passed", () => {
    expect(formatCountdown(new Date(NOW - 1000).toISOString(), NOW)).toBe("已复苏");
    expect(formatCountdown(new Date(NOW).toISOString(), NOW)).toBe("已复苏");
  });

  it("formats less than a day as HH:MM:SS", () => {
    const t = new Date(NOW + (2 * 3600 + 14 * 60 + 32) * 1000).toISOString();
    expect(formatCountdown(t, NOW)).toBe("02:14:32");
    expect(formatCountdown(new Date(NOW + 5000).toISOString(), NOW)).toBe("00:00:05");
    expect(formatCountdown(new Date(NOW + 90 * 60 * 1000).toISOString(), NOW)).toBe(
      "01:30:00",
    );
  });

  it("formats a day or more as N天M时", () => {
    const t = new Date(NOW + (3 * 86400 + 12 * 3600) * 1000).toISOString();
    expect(formatCountdown(t, NOW)).toBe("3天12时");
  });
});
