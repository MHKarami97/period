import { format, getDay } from "date-fns-jalali";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import type {
  ChallengeItem,
  DailyChallengePlan,
  WeeklyChallengeSchedule,
} from "./DailyChallengeTypes";

export const PERSIAN_WEEK_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
] as const;

export class WeeklyChallengeService {
  /**
   * Calculates the Saturday (start of week in Iranian calendar) for any given DateOnly.
   * In Gregorian getDay(): Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6.
   * Shifted to Saturday=0: (getDay + 1) % 7.
   */
  public static getSaturdayWeekStart(date: DateOnly): DateOnly {
    const jsDay = getDay(date.toDate());
    const daysSinceSaturday = (jsDay + 1) % 7;
    return date.addDays(-daysSinceSaturday);
  }

  /** Current week's Saturday */
  public static getCurrentWeekStart(today = DateOnly.today()): DateOnly {
    return this.getSaturdayWeekStart(today);
  }

  /** Next week's Saturday (exactly 7 days after current week start) */
  public static getNextWeekStart(today = DateOnly.today()): DateOnly {
    return this.getCurrentWeekStart(today).addDays(7);
  }

  /**
   * Returns array of 7 DateOnly instances from Saturday to Friday.
   */
  public static getWeekDays(saturdayStart: DateOnly): DateOnly[] {
    return Array.from({ length: 7 }, (_, idx) => saturdayStart.addDays(idx));
  }

  /**
   * Formats a DateOnly into Jalali date label e.g. "۲ آذر ۱۴۰۵"
   */
  public static formatJalaliLabel(date: DateOnly): string {
    return format(date.toDate(), "d MMMM yyyy");
  }

  /**
   * Formats a week title e.g. "شنبه ۲ آذر تا جمعه ۸ آذر ۱۴۰۵"
   */
  public static formatWeekTitle(saturdayStart: DateOnly): string {
    const fridayEnd = saturdayStart.addDays(6);
    const startStr = format(saturdayStart.toDate(), "d MMMM");
    const endStr = format(fridayEnd.toDate(), "d MMMM yyyy");
    return `شنبه ${startStr} تا جمعه ${endStr}`;
  }

  /**
   * Checks if a week start ISO is within the plannable range (current week or next week).
   * Requirement: "برای هفته جاری و هفته بعد نهایت شه برنامه ذخیره کرد"
   */
  public static isWeekPlannable(weekStartIso: string, today = DateOnly.today()): boolean {
    const currentIso = this.getCurrentWeekStart(today).toIsoString();
    const nextIso = this.getNextWeekStart(today).toIsoString();
    return weekStartIso === currentIso || weekStartIso === nextIso;
  }

  /**
   * Checks if a week is strictly in the past (before current week start).
   */
  public static isPastWeek(weekStartIso: string, today = DateOnly.today()): boolean {
    const currentIso = this.getCurrentWeekStart(today).toIsoString();
    return weekStartIso < currentIso;
  }

  /**
   * Generates a random 7-day schedule for the given week from the challenge pool.
   * If existingSchedule is provided, preserves already completed or off days if desired.
   */
  public static generateWeeklyPlan(
    saturdayStart: DateOnly,
    pool: readonly ChallengeItem[],
    preserveCompleted = true,
    existingSchedule?: WeeklyChallengeSchedule,
  ): WeeklyChallengeSchedule {
    if (!pool || pool.length === 0) {
      throw new Error("بانک چالش‌ها خالی است؛ حداقل یک چالش باید وجود داشته باشد.");
    }

    const weekDays = this.getWeekDays(saturdayStart);
    const weekStartIso = saturdayStart.toIsoString();
    const weekEndIso = saturdayStart.addDays(6).toIsoString();
    const weekTitle = this.formatWeekTitle(saturdayStart);

    // Shuffle pool to distribute challenges randomly across days
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    const days: DailyChallengePlan[] = weekDays.map((day, idx) => {
      const dateIso = day.toIsoString();
      const existingDay = existingSchedule?.days.find((d) => d.date === dateIso);

      // If day was already completed or marked off, preserve it if requested
      if (preserveCompleted && existingDay && (existingDay.status === "completed" || existingDay.isOff)) {
        return {
          ...existingDay,
          dayOfWeekIndex: idx,
          dayName: PERSIAN_WEEK_DAYS[idx],
          jalaliDateLabel: this.formatJalaliLabel(day),
        };
      }

      // Pick a challenge from shuffled pool (looping if pool < 7)
      const challenge = shuffled[idx % shuffled.length];

      return {
        date: dateIso,
        dayOfWeekIndex: idx,
        dayName: PERSIAN_WEEK_DAYS[idx],
        jalaliDateLabel: this.formatJalaliLabel(day),
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        challengeDescription: challenge.description,
        isOff: false,
        status: "pending",
      };
    });

    const now = new Date().toISOString();

    return {
      weekStartIso,
      weekEndIso,
      weekTitle,
      days,
      createdAt: existingSchedule?.createdAt ?? now,
      updatedAt: now,
    };
  }

  /**
   * Selects a random challenge for a single day, avoiding currently used challenges in the week.
   */
  public static getRandomChallenge(
    pool: readonly ChallengeItem[],
    excludedIds: readonly string[] = [],
  ): ChallengeItem {
    if (!pool.length) {
      throw new Error("بانک چالش‌ها خالی است.");
    }
    const candidates = pool.filter((item) => !excludedIds.includes(item.id));
    const targetPool = candidates.length > 0 ? candidates : pool;
    const randomIndex = Math.floor(Math.random() * targetPool.length);
    return targetPool[randomIndex];
  }
}
