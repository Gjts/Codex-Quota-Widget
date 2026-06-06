import { describe, expect, it } from "vitest";
import { getQuotaStatus, moreSevere } from "./status";

describe("getQuotaStatus", () => {
  it("maps boundaries with default thresholds (warning 30, danger 15)", () => {
    expect(getQuotaStatus(0)).toBe("exhausted");
    expect(getQuotaStatus(-5)).toBe("exhausted");
    expect(getQuotaStatus(10)).toBe("danger");
    expect(getQuotaStatus(15)).toBe("danger");
    expect(getQuotaStatus(16)).toBe("warning");
    expect(getQuotaStatus(30)).toBe("warning");
    expect(getQuotaStatus(31)).toBe("normal");
    expect(getQuotaStatus(79)).toBe("normal");
    expect(getQuotaStatus(80)).toBe("excellent");
    expect(getQuotaStatus(100)).toBe("excellent");
  });

  it("returns unknown for NaN", () => {
    expect(getQuotaStatus(NaN)).toBe("unknown");
  });

  it("honours custom thresholds", () => {
    expect(getQuotaStatus(20, 40, 20)).toBe("danger"); // <= danger(20)
    expect(getQuotaStatus(21, 40, 20)).toBe("warning"); // <= warning(40)
    expect(getQuotaStatus(41, 40, 20)).toBe("normal");
  });
});

describe("moreSevere", () => {
  it("prefers the worse status", () => {
    expect(moreSevere("excellent", "danger")).toBe("danger");
    expect(moreSevere("normal", "warning")).toBe("warning");
    expect(moreSevere("exhausted", "danger")).toBe("exhausted");
    expect(moreSevere("warning", "warning")).toBe("warning");
  });

  it("lets a known status beat unknown", () => {
    expect(moreSevere("unknown", "normal")).toBe("normal");
    expect(moreSevere("warning", "unknown")).toBe("warning");
    expect(moreSevere("unknown", "unknown")).toBe("unknown");
  });
});
