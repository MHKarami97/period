import { describe, expect, it } from "vitest";
import { DateOnly } from "../valueObjects/DateOnly";
import { PregnancyCalculator } from "./PregnancyProgress";

const LMP = DateOnly.fromIsoString("2026-01-01");

describe("PregnancyCalculator", () => {
  it("computes weeks, days and trimester", () => {
    const progress = PregnancyCalculator.fromLastPeriod(LMP, LMP.addDays(100));
    expect(progress?.weeks).toBe(14);
    expect(progress?.extraDays).toBe(2);
    expect(progress?.trimester).toBe(2);
  });

  it("estimates the due date 280 days after the last period", () => {
    const progress = PregnancyCalculator.fromLastPeriod(LMP, LMP.addDays(10));
    expect(progress?.dueDate.toIsoString()).toBe(LMP.addDays(280).toIsoString());
    expect(progress?.daysLeft).toBe(270);
  });

  it("rejects dates before the last period or far beyond term", () => {
    expect(PregnancyCalculator.fromLastPeriod(LMP, LMP.addDays(-1))).toBeNull();
    expect(PregnancyCalculator.fromLastPeriod(LMP, LMP.addDays(400))).toBeNull();
  });
});
