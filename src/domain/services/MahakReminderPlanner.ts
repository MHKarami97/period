import { CyclePredictionService } from "./CyclePredictionService";
import type { Cycle } from "../entities/Cycle";

export type MahakEventKind = "PRE_START" | "START" | "END" | "HAMDEL_DATE" | "HAMDEL_CALL";

export interface PlannedMahakEvent {
  readonly kind: MahakEventKind;
  readonly targetDate: string;
  /** Only for HAMDEL_* events: text shown in the Telegram message. */
  readonly label?: string;
  /** Only for HAMDEL_* events: how many days before `targetDate` the message is sent. */
  readonly leadDays?: number;
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
