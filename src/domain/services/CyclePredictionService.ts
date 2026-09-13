import { Cycle } from "../entities/Cycle";
import { DateOnly } from "../valueObjects/DateOnly";
import { CyclePhase } from "../valueObjects/CyclePhase";

/** Weighted-Moving-Average weights: most recent cycle counts 3x, then 2x, then 1x. */
const WMA_WEIGHTS = [3, 2, 1] as const;

/** Clinically standard luteal-phase length used to back-calculate ovulation day. */
const LUTEAL_PHASE_DAYS = 14;

/** Fallback used only when there is no historical data at all. */
const DEFAULT_CYCLE_LENGTH_DAYS = 28;
const DEFAULT_PERIOD_LENGTH_DAYS = 5;

/** Fertile window is modeled as 5 days before to 1 day after ovulation (sperm survival window). */
const FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5;
const FERTILE_WINDOW_DAYS_AFTER_OVULATION = 1;

export interface CyclePrediction {
  predictedCycleLengthInDays: number;
  predictedPeriodLengthInDays: number;
  nextPeriodStartDate: DateOnly;
  nextPeriodEndDate: DateOnly;
  ovulationDate: DateOnly;
  fertileWindowStart: DateOnly;
  fertileWindowEnd: DateOnly;
}

/**
 * CyclePredictionService - Domain Service.
 *
 * Pure, side-effect-free logic with ZERO dependency on Vue, Pinia or Dexie,
 * so it can be unit-tested in complete isolation and reused from any layer.
 *
 * Algorithm (Weighted Moving Average, as specified):
 *   nextCycleLength = (C1*3 + C2*2 + C3*1) / 6
 *   where C1 is the most recent completed cycle length, C2 the one before, C3 before that.
 *   If fewer than 3 historical cycles exist, weights are re-normalized over
 *   the available data so the formula degrades gracefully instead of
 *   throwing or silently ignoring missing history.
 */
export class CyclePredictionService {
  /**
   * @param cycles Cycles sorted ascending by startDate (oldest first).
   *               Only cycles with a resolved successor are used to derive
   *               a "completed" cycle length; the currently open cycle (if
   *               any) is used purely as the anchor for the next prediction.
   */
  public static predictNextCycle(cycles: readonly Cycle[]): CyclePrediction {
    if (cycles.length === 0) {
      throw new Error("Cannot predict a cycle without at least one logged period.");
    }

    const sorted = [...cycles].sort((a, b) => a.startDate.diffInDays(b.startDate));
    const anchorCycle = sorted[sorted.length - 1];

    const completedLengths = CyclePredictionService.computeCompletedCycleLengths(sorted);
    const predictedCycleLengthInDays = CyclePredictionService.weightedMovingAverage(completedLengths);
    const predictedPeriodLengthInDays = CyclePredictionService.averagePeriodLength(sorted);

    const nextPeriodStartDate = anchorCycle.startDate.addDays(predictedCycleLengthInDays);
    const nextPeriodEndDate = nextPeriodStartDate.addDays(predictedPeriodLengthInDays - 1);

    // Ovulation is always exactly LUTEAL_PHASE_DAYS before the end of the
    // *upcoming* cycle. Since a cycle's end coincides with the day the next
    // period starts, "end of the upcoming cycle" == nextPeriodStartDate.
    const ovulationDate = nextPeriodStartDate.addDays(-LUTEAL_PHASE_DAYS);
    const fertileWindowStart = ovulationDate.addDays(-FERTILE_WINDOW_DAYS_BEFORE_OVULATION);
    const fertileWindowEnd = ovulationDate.addDays(FERTILE_WINDOW_DAYS_AFTER_OVULATION);

    return {
      predictedCycleLengthInDays,
      predictedPeriodLengthInDays,
      nextPeriodStartDate,
      nextPeriodEndDate,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
    };
  }

  public static resolveCurrentPhase(cycles: readonly Cycle[], today: DateOnly = DateOnly.today()): CyclePhase {
    if (cycles.length === 0) {
      return CyclePhase.Follicular;
    }

    const sorted = [...cycles].sort((a, b) => a.startDate.diffInDays(b.startDate));
    const currentCycle = sorted[sorted.length - 1];

    const isBleedingNow = currentCycle.isOngoing
      ? !today.isBefore(currentCycle.startDate)
      : today.isBetweenInclusive(currentCycle.startDate, currentCycle.endDate as DateOnly);

    if (isBleedingNow) {
      return CyclePhase.Menstrual;
    }

    const prediction = CyclePredictionService.predictNextCycle(sorted);

    if (today.isBetweenInclusive(prediction.fertileWindowStart, prediction.fertileWindowEnd)) {
      return CyclePhase.Ovulation;
    }

    return today.isBefore(prediction.ovulationDate) ? CyclePhase.Follicular : CyclePhase.Luteal;
  }

  public static daysUntilNextPeriod(cycles: readonly Cycle[], today: DateOnly = DateOnly.today()): number {
    const prediction = CyclePredictionService.predictNextCycle(cycles);
    return prediction.nextPeriodStartDate.diffInDays(today);
  }

  public static currentCycleDayNumber(cycles: readonly Cycle[], today: DateOnly = DateOnly.today()): number {
    const sorted = [...cycles].sort((a, b) => a.startDate.diffInDays(b.startDate));
    const currentCycle = sorted[sorted.length - 1];
    return today.diffInDays(currentCycle.startDate) + 1;
  }

  private static computeCompletedCycleLengths(sortedAscending: readonly Cycle[]): number[] {
    const lengths: number[] = [];
    for (let i = 0; i < sortedAscending.length - 1; i += 1) {
      lengths.push(sortedAscending[i].lengthUntil(sortedAscending[i + 1]));
    }
    // Most recent completed length first, to line up with WMA_WEIGHTS[0] = latest.
    return lengths.reverse();
  }

  private static weightedMovingAverage(mostRecentFirstLengths: readonly number[]): number {
    if (mostRecentFirstLengths.length === 0) {
      return DEFAULT_CYCLE_LENGTH_DAYS;
    }

    const sampleSize = Math.min(mostRecentFirstLengths.length, WMA_WEIGHTS.length);
    const weights = WMA_WEIGHTS.slice(0, sampleSize);
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

    const weightedSum = weights.reduce(
      (sum, weight, index) => sum + weight * mostRecentFirstLengths[index],
      0,
    );

    return Math.round(weightedSum / weightSum);
  }

  private static averagePeriodLength(sortedAscending: readonly Cycle[]): number {
    const knownLengths = sortedAscending
      .map((cycle) => cycle.periodLengthInDays)
      .filter((length): length is number => length !== null);

    if (knownLengths.length === 0) {
      return DEFAULT_PERIOD_LENGTH_DAYS;
    }

    const sum = knownLengths.reduce((acc, length) => acc + length, 0);
    return Math.round(sum / knownLengths.length);
  }
}
