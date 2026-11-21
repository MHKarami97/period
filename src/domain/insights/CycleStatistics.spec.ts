import { describe, expect, it } from "vitest";
import { Cycle } from "../entities/Cycle";
import { DateOnly } from "../valueObjects/DateOnly";
import { CycleStatisticsCalculator } from "./CycleStatistics";

const TODAY = DateOnly.fromIsoString("2026-06-01");

function cyclesWithGaps(gaps: readonly number[]): Cycle[] {
  let start = TODAY.addDays(-gaps.reduce((sum, gap) => sum + gap, 0) - 5);
  const list = [Cycle.start({ id: "c0", startDate: start }).endPeriod(start.addDays(4))];
  gaps.forEach((gap, index) => {
    start = start.addDays(gap);
    list.push(Cycle.start({ id: `c${index + 1}`, startDate: start }).endPeriod(start.addDays(4)));
  });
  return list;
}

describe("CycleStatisticsCalculator", () => {
  it("is empty without cycles", () => {
    const stats = CycleStatisticsCalculator.calculate([], TODAY);
    expect(stats.averageLength).toBeNull();
    expect(stats.regularity).toBe("unknown");
  });

  it("calls a steady history regular", () => {
    const stats = CycleStatisticsCalculator.calculate(cyclesWithGaps([28, 29, 28, 27]), TODAY);
    expect(stats.regularity).toBe("regular");
    expect(stats.averageLength).toBe(28);
    expect(stats.alerts.some((alert) => alert.severity === "warning")).toBe(false);
  });

  it("flags a very irregular history", () => {
    const stats = CycleStatisticsCalculator.calculate(cyclesWithGaps([24, 38, 26, 40]), TODAY);
    expect(stats.regularity).toBe("irregular");
    expect(stats.alerts.map((alert) => alert.id)).toContain("long");
  });

  it("warns when no period was logged for three months", () => {
    const old = Cycle.start({ id: "c", startDate: TODAY.addDays(-120) }).endPeriod(TODAY.addDays(-116));
    expect(CycleStatisticsCalculator.calculate([old], TODAY).alerts.map((alert) => alert.id)).toContain("missed");
  });
});
