import { DateOnly } from "../valueObjects/DateOnly";

export interface PregnancyProgress {
  readonly totalDays: number;
  readonly weeks: number;
  readonly extraDays: number;
  readonly trimester: 1 | 2 | 3;
  readonly dueDate: DateOnly;
  readonly daysLeft: number;
  readonly percent: number;
  readonly isOverdue: boolean;
}

const PREGNANCY_DAYS = 280;
const FIRST_TRIMESTER_END_WEEK = 14;
const SECOND_TRIMESTER_END_WEEK = 28;
const DAYS_PER_WEEK = 7;
const MAX_TRACKED_DAYS = 301;

/** Naegele's rule: estimated due date = first day of last menstrual period + 280 days (40 weeks). */
export class PregnancyCalculator {
  public static fromLastPeriod(lastPeriod: DateOnly, today: DateOnly): PregnancyProgress | null {
    const totalDays = today.diffInDays(lastPeriod);
    if (totalDays < 0 || totalDays > MAX_TRACKED_DAYS) {
      return null;
    }
    const weeks = Math.floor(totalDays / DAYS_PER_WEEK);
    const dueDate = lastPeriod.addDays(PREGNANCY_DAYS);
    return {
      totalDays,
      weeks,
      extraDays: totalDays % DAYS_PER_WEEK,
      trimester: weeks < FIRST_TRIMESTER_END_WEEK ? 1 : weeks < SECOND_TRIMESTER_END_WEEK ? 2 : 3,
      dueDate,
      daysLeft: dueDate.diffInDays(today),
      percent: Math.min(100, Math.round((totalDays / PREGNANCY_DAYS) * 100)),
      isOverdue: totalDays > PREGNANCY_DAYS,
    };
  }

  public static fromDueDate(dueDate: DateOnly, today: DateOnly): PregnancyProgress | null {
    return PregnancyCalculator.fromLastPeriod(dueDate.addDays(-PREGNANCY_DAYS), today);
  }
}
