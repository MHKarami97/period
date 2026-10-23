import { describe, expect, it } from "vitest";
import {
  AUTO_ADVANCE_MAX_SECONDS,
  AUTO_ADVANCE_MIN_SECONDS,
  AutoAdvanceSettings,
  DEFAULT_AUTO_ADVANCE_SECONDS,
} from "./AutoAdvanceSettings";

describe("AutoAdvanceSettings", () => {
  it("starts disabled with the default interval", () => {
    expect(AutoAdvanceSettings.disabled().toSnapshot()).toEqual({ enabled: false, seconds: DEFAULT_AUTO_ADVANCE_SECONDS });
  });

  it("clamps and rounds the interval", () => {
    expect(AutoAdvanceSettings.disabled().withSeconds(1).seconds).toBe(AUTO_ADVANCE_MIN_SECONDS);
    expect(AutoAdvanceSettings.disabled().withSeconds(99999).seconds).toBe(AUTO_ADVANCE_MAX_SECONDS);
    expect(AutoAdvanceSettings.disabled().withSeconds(44.6).seconds).toBe(45);
  });

  it("survives a round trip and corrupted storage", () => {
    const original = AutoAdvanceSettings.disabled().withEnabled(true).withSeconds(90);
    expect(AutoAdvanceSettings.fromSnapshot(original.toSnapshot()).toSnapshot()).toEqual({ enabled: true, seconds: 90 });
    expect(AutoAdvanceSettings.fromSnapshot({ enabled: "yes", seconds: "x" }).toSnapshot()).toEqual({
      enabled: false,
      seconds: DEFAULT_AUTO_ADVANCE_SECONDS,
    });
    expect(AutoAdvanceSettings.fromSnapshot(null).enabled).toBe(false);
  });
});
