import { describe, expect, it } from "vitest";
import { Cycle } from "../entities/Cycle";
import { DateOnly } from "../valueObjects/DateOnly";
import { CycleStatusSummarizer } from "./CycleStatusSummary";

const TODAY = DateOnly.fromIsoString("2026-03-20");

describe("CycleStatusSummarizer", () => {
  it("reports no-data when nothing was logged", () => {
    const summary = CycleStatusSummarizer.summarize([], TODAY);
    expect(summary.kind).toBe("no-data");
    expect(summary.progress).toBeNull();
  });

  it("reports bleeding while a period is open", () => {
    const cycle = Cycle.start({ id: "c1", startDate: TODAY.addDays(-2) });
    expect(CycleStatusSummarizer.summarize([cycle], TODAY).kind).toBe("bleeding");
  });

  it("reports the fertile window around the estimated ovulation", () => {
    const cycle = Cycle.start({ id: "c1", startDate: TODAY.addDays(-10) }).endPeriod(TODAY.addDays(-6));
    expect(CycleStatusSummarizer.summarize([cycle], TODAY).kind).toBe("fertile");
  });

  it("counts down to the next period in the luteal phase", () => {
    const cycle = Cycle.start({ id: "c1", startDate: TODAY.addDays(-20) }).endPeriod(TODAY.addDays(-16));
    expect(CycleStatusSummarizer.summarize([cycle], TODAY).kind).toBe("waiting");
  });

  it("flags a late period", () => {
    const cycle = Cycle.start({ id: "c1", startDate: TODAY.addDays(-33) }).endPeriod(TODAY.addDays(-29));
    expect(CycleStatusSummarizer.summarize([cycle], TODAY).kind).toBe("period-late");
  });
});
