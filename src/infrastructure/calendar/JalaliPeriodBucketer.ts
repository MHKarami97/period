import { format } from "date-fns-jalali";
import type { PeriodBucketer, TrendGranularity } from "@domain/hamdel/hamdelStats";
import { DateOnly } from "@domain/valueObjects/DateOnly";

function toLocalDate(day: DateOnly): Date {
  const [year, month, date] = day.toIsoString().split("-").map(Number);
  return new Date(year, month - 1, date);
}

/** Saturday is the first day of the Iranian week. DateOnly is UTC-based, so getUTCDay is exact. */
function weekStart(day: DateOnly): DateOnly {
  return day.addDays(-((day.toDate().getUTCDay() + 1) % 7));
}

/** Adapter: Jalali months and Saturday-based weeks for the Hamdel charts. */
export const jalaliPeriodBucketer: PeriodBucketer = {
  keyOf: (day: DateOnly, granularity: TrendGranularity) =>
    granularity === "month" ? format(toLocalDate(day), "yyyy-MM") : weekStart(day).toIsoString(),
  labelOf: (day: DateOnly, granularity: TrendGranularity) =>
    granularity === "month" ? format(toLocalDate(day), "MMMM") : format(toLocalDate(weekStart(day)), "d MMM"),
};
