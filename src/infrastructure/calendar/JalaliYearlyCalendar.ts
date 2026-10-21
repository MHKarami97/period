import { addYears, getYear } from "date-fns-jalali";
import type { YearlyCalendar } from "@domain/hamdel/importantDates";
import { DateOnly } from "@domain/valueObjects/DateOnly";

/** DateOnly is UTC-midnight based; date-fns-jalali works on local dates, so convert through y/m/d. */
function toLocalDate(day: DateOnly): Date {
  const [year, month, date] = day.toIsoString().split("-").map(Number);
  return new Date(year, month - 1, date);
}

/**
 * Adapter: year arithmetic in the Jalali calendar (the one users see), so a birthday on
 * 15 Mehr stays on 15 Mehr every year. A leap-day date (30 Esfand) falls back to 29 Esfand.
 */
export const jalaliYearlyCalendar: YearlyCalendar = {
  yearOf: (day) => getYear(toLocalDate(day)),
  addYears: (day, years) => DateOnly.fromDate(addYears(toLocalDate(day), years)),
};
