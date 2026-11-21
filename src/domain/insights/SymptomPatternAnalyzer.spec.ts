import { describe, expect, it } from "vitest";
import { Cycle } from "../entities/Cycle";
import { Symptom } from "../entities/Symptom";
import { DateOnly } from "../valueObjects/DateOnly";
import { SymptomPatternAnalyzer } from "./SymptomPatternAnalyzer";

const FIRST = DateOnly.fromIsoString("2026-01-01");
const cycles = [0, 28, 56, 84].map((offset, index) => Cycle.start({ id: `c${index}`, startDate: FIRST.addDays(offset) }));
const TODAY = FIRST.addDays(90);

describe("SymptomPatternAnalyzer", () => {
  it("detects a premenstrual pattern for a repeated tag", () => {
    const symptoms = [27, 55, 83].map((day, index) =>
      Symptom.create({ id: `s${index}`, date: FIRST.addDays(day - 2), tags: ["headache"] }),
    );
    const analysis = SymptomPatternAnalyzer.analyze(cycles, symptoms, TODAY);
    expect(analysis.insights.map((insight) => insight.id)).toContain("pms-headache");
  });

  it("ignores tags that are too rare", () => {
    const symptoms = [Symptom.create({ id: "s", date: FIRST.addDays(5), tags: ["acne"] })];
    expect(SymptomPatternAnalyzer.analyze(cycles, symptoms, TODAY).insights).toEqual([]);
  });

  it("averages sleep over the last two weeks", () => {
    const symptoms = [Symptom.create({ id: "a", date: TODAY.addDays(-1), sleepHours: 6 }), Symptom.create({ id: "b", date: TODAY.addDays(-2), sleepHours: 8 })];
    expect(SymptomPatternAnalyzer.analyze(cycles, symptoms, TODAY).averageSleep).toBe(7);
  });
});
