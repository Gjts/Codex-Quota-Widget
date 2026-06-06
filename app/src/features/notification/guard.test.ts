import { describe, expect, it } from "vitest";
import { shouldNotify } from "./guard";
import { messageFor } from "./messages";

describe("shouldNotify", () => {
  it("never notifies on the first observation", () => {
    expect(shouldNotify(undefined, "danger")).toBe(false);
    expect(shouldNotify(undefined, "warning")).toBe(false);
  });

  it("notifies when worsening into an alert level", () => {
    expect(shouldNotify("normal", "warning")).toBe(true);
    expect(shouldNotify("warning", "danger")).toBe(true);
    expect(shouldNotify("danger", "exhausted")).toBe(true);
    expect(shouldNotify("excellent", "danger")).toBe(true);
  });

  it("does not notify on improvement or unchanged level", () => {
    expect(shouldNotify("danger", "warning")).toBe(false);
    expect(shouldNotify("danger", "danger")).toBe(false);
    expect(shouldNotify("danger", "normal")).toBe(false);
    expect(shouldNotify("warning", "excellent")).toBe(false);
  });

  it("does not notify into non-alert levels", () => {
    expect(shouldNotify("warning", "normal")).toBe(false);
    expect(shouldNotify("normal", "excellent")).toBe(false);
  });
});

describe("messageFor", () => {
  it("returns xianxia copy for alert levels", () => {
    expect(messageFor("fiveHour", "danger")?.title).toContain("道基不稳");
    expect(messageFor("weekly", "exhausted")?.title).toContain("道蕴耗尽");
  });

  it("returns null for non-alert levels", () => {
    expect(messageFor("fiveHour", "normal")).toBeNull();
    expect(messageFor("weekly", "excellent")).toBeNull();
  });
});
