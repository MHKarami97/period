import { describe, expect, it } from "vitest";
import { Cycle } from "../entities/Cycle";
import { DateOnly } from "../valueObjects/DateOnly";
import { CyclePhase } from "../valueObjects/CyclePhase";
import { CyclePredictionService } from "./CyclePredictionService";

function cycleStartingOn(iso: string, id = iso): Cycle {
  return Cycle.start({ id, startDate: DateOnly.fromIsoString(iso) });
}

describe("CyclePredictionService.predictNextCycle", () => {
  it("applies the 3/2/1 weighted moving average with three historical cycles", () => {
    const cycles = [
      cycleStartingOn("2024-01-01"),
      cycleStartingOn("2024-01-29"), // C3 = 28 days
      cycleStartingOn("2024-02-28"), // C2 = 30 days
      cycleStartingOn("2024-03-27"), // C1 = 28 days (anchor)
    ];

    const prediction = CyclePredictionService.predictNextCycle(cycles);

    // WMA = (28*3 + 30*2 + 28*1) / 6 = (84 + 60 + 28) / 6 = 172 / 6 = 28.67 -> rounds to 29
    expect(prediction.predictedCycleLengthInDays).toBe(29);
    expect(prediction.nextPeriodStartDate.toIsoString()).toBe(
      DateOnly.fromIsoString("2024-03-27").addDays(29).toIsoString(),
    );
  });

  it("falls back to the clinical default of 28 days with no historical data", () => {
    const cycles = [cycleStartingOn("2024-01-01")];
    const prediction = CyclePredictionService.predictNextCycle(cycles);
    expect(prediction.predictedCycleLengthInDays).toBe(28);
  });

  it("re-normalizes weights when only two completed cycles exist", () => {
    const cycles = [
      cycleStartingOn("2024-01-01"),
      cycleStartingOn("2024-01-29"), // C2 = 28 days
      cycleStartingOn("2024-02-28"), // C1 = 30 days (anchor)
    ];

    const prediction = CyclePredictionService.predictNextCycle(cycles);

    // WMA (2 samples) = (30*2 + 28*1) / 3 = 88 / 3 = 29.33 -> rounds to 29
    expect(prediction.predictedCycleLengthInDays).toBe(29);
  });

  it("computes ovulation as exactly 14 days before the next predicted period start", () => {
    const cycles = [cycleStartingOn("2024-01-01"), cycleStartingOn("2024-01-29")];
    const prediction = CyclePredictionService.predictNextCycle(cycles);

    const expectedOvulation = prediction.nextPeriodStartDate.addDays(-14);
    expect(prediction.ovulationDate.toIsoString()).toBe(expectedOvulation.toIsoString());
  });

  it("throws when there is no cycle history at all", () => {
    expect(() => CyclePredictionService.predictNextCycle([])).toThrow();
  });
});

describe("CyclePredictionService.resolveCurrentPhase", () => {
  it("returns MENSTRUAL while a cycle is ongoing and today is within the bleeding window", () => {
    const cycles = [cycleStartingOn("2024-01-01")];
    const today = DateOnly.fromIsoString("2024-01-03");
    expect(CyclePredictionService.resolveCurrentPhase(cycles, today)).toBe(CyclePhase.Menstrual);
  });

  it("returns LUTEAL after ovulation but before the next period", () => {
    const cycles = [cycleStartingOn("2024-01-01"), cycleStartingOn("2024-01-29")].map((cycle, index) =>
      index === 1 ? cycle.endPeriod(DateOnly.fromIsoString("2024-02-03")) : cycle.endPeriod(DateOnly.fromIsoString("2024-01-05")),
    );
    const today = DateOnly.fromIsoString("2024-02-20");
    expect(CyclePredictionService.resolveCurrentPhase(cycles, today)).toBe(CyclePhase.Luteal);
  });
});
