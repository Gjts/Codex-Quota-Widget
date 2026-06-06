import { describe, expect, it } from "vitest";
import {
  isoToLocalInput,
  localInputToIso,
  validatePercent,
  validateThresholds,
} from "./validation";

describe("validatePercent", () => {
  it("accepts 0-100 and blank", () => {
    expect(validatePercent("68")).toEqual({ ok: true, value: 68 });
    expect(validatePercent("0")).toEqual({ ok: true, value: 0 });
    expect(validatePercent("100")).toEqual({ ok: true, value: 100 });
    expect(validatePercent("   ")).toEqual({ ok: true, value: null });
  });

  it("rejects out-of-range and non-numeric", () => {
    expect(validatePercent("101").ok).toBe(false);
    expect(validatePercent("-1").ok).toBe(false);
    expect(validatePercent("abc").ok).toBe(false);
  });
});

describe("validateThresholds", () => {
  it("requires danger < warning, both in range", () => {
    expect(validateThresholds(30, 15).ok).toBe(true);
    expect(validateThresholds(15, 15).ok).toBe(false);
    expect(validateThresholds(15, 30).ok).toBe(false);
    expect(validateThresholds(120, 15).ok).toBe(false);
  });
});

describe("datetime-local round trip", () => {
  it("converts ISO -> local input -> ISO consistently", () => {
    const iso = new Date("2026-06-06T01:30:00").toISOString();
    const local = isoToLocalInput(iso);
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(localInputToIso(local)).toBe(iso);
  });

  it("handles blank/null", () => {
    expect(isoToLocalInput(null)).toBe("");
    expect(localInputToIso("")).toBeNull();
  });
});
