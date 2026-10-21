import { DateOnly } from "../valueObjects/DateOnly";
import type { HamdelEntry } from "./HamdelEntry";

/** Calendar-specific year arithmetic, injected so the domain stays independent of Jalali/Gregorian details. */
export interface YearlyCalendar {
  yearOf(day: DateOnly): number;
  addYears(day: DateOnly, years: number): DateOnly;
}

export type RepeatMode = "yearly" | "once";

/** The occurrence of a (possibly yearly) date that falls in the same calendar year as `anchor`. */
export function occurrenceInYearOf(original: DateOnly, anchor: DateOnly, repeat: RepeatMode, calendar: YearlyCalendar): DateOnly {
  return repeat === "yearly" ? calendar.addYears(original, calendar.yearOf(anchor) - calendar.yearOf(original)) : original;
}

/** First occurrence on or after `today`, or null when a one-time date is already past. */
export function nextOccurrence(original: DateOnly, today: DateOnly, repeat: RepeatMode, calendar: YearlyCalendar): DateOnly | null {
  if (!original.isBefore(today)) {
    return original;
  }
  if (repeat === "once") {
    return null;
  }
  const yearsApart = calendar.yearOf(today) - calendar.yearOf(original);
  const sameYear = calendar.addYears(original, yearsApart);
  return sameYear.isBefore(today) ? calendar.addYears(original, yearsApart + 1) : sameYear;
}

export interface DateCountdown {
  readonly entry: HamdelEntry;
  /** Next occurrence; null for a one-time date that has passed. */
  readonly target: DateOnly | null;
  readonly daysLeft: number | null;
}

/** Upcoming dates first (nearest first), then past one-time dates (most recent first). */
export function buildCountdowns(entries: readonly HamdelEntry[], today: DateOnly, calendar: YearlyCalendar): DateCountdown[] {
  const countdowns = entries.map((entry): DateCountdown => {
    const repeat: RepeatMode = entry.valueOf("repeat") === "once" ? "once" : "yearly";
    const target = nextOccurrence(DateOnly.fromIsoString(entry.valueOf("date")), today, repeat, calendar);
    return { entry, target, daysLeft: target ? target.diffInDays(today) : null };
  });
  const upcoming = countdowns.filter((item) => item.daysLeft !== null).sort((left, right) => (left.daysLeft ?? 0) - (right.daysLeft ?? 0));
  const past = countdowns.filter((item) => item.daysLeft === null).sort((left, right) => (left.entry.valueOf("date") < right.entry.valueOf("date") ? 1 : -1));
  return [...upcoming, ...past];
}

const DAYS_PER_MONTH = 30;
const MAX_DAYS_SHOWN_AS_DAYS = 45;

/** Persian wording for a countdown: "امروز", "فردا", "۱۲ روز دیگر", "۴ ماه و ۳ روز دیگر". */
export function describeDaysLeft(daysLeft: number): string {
  const format = (value: number): string => value.toLocaleString("fa-IR");
  if (daysLeft <= 0) return "امروز";
  if (daysLeft === 1) return "فردا";
  if (daysLeft <= MAX_DAYS_SHOWN_AS_DAYS) return `${format(daysLeft)} روز دیگر`;
  const months = Math.floor(daysLeft / DAYS_PER_MONTH);
  const days = daysLeft % DAYS_PER_MONTH;
  return days === 0 ? `${format(months)} ماه دیگر` : `${format(months)} ماه و ${format(days)} روز دیگر`;
}
