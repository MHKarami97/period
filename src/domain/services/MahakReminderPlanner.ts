import { CyclePredictionService } from "./CyclePredictionService";
import type { Cycle } from "../entities/Cycle";

export type MahakEventKind = "PRE_START" | "START" | "END";

export interface PlannedMahakEvent {
  readonly kind: MahakEventKind;
  readonly targetDate: string;
}

export class MahakReminderPlanner {
  public static plan(cycles: readonly Cycle[]): readonly PlannedMahakEvent[] {
    if (cycles.length === 0) return [];
    const prediction = CyclePredictionService.predictNextCycle(cycles);
    return [
      { kind: "PRE_START", targetDate: prediction.nextPeriodStartDate.toIsoString() },
      { kind: "START", targetDate: prediction.nextPeriodStartDate.toIsoString() },
      { kind: "END", targetDate: prediction.nextPeriodEndDate.toIsoString() },
    ];
  }
}
