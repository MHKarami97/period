import { format, addMonths, startOfMonth, endOfMonth, getDay } from "date-fns-jalali";
import { DateOnly } from "@domain/valueObjects/DateOnly";

/**
 * useJalali - thin wrapper around date-fns-jalali so every Jalali-specific
 * formatting/navigation call is centralized in one composable. The domain
 * layer never imports this; only presentation components do.
 */
export function useJalali() {
  function toJalaliLabel(date: DateOnly, pattern = "yyyy/MM/dd"): string {
    return format(date.toDate(), pattern);
  }

  function monthTitle(monthAnchor: Date): string {
    return format(monthAnchor, "MMMM yyyy");
  }

  function nextMonth(monthAnchor: Date): Date {
    return addMonths(monthAnchor, 1);
  }

  function previousMonth(monthAnchor: Date): Date {
    return addMonths(monthAnchor, -1);
  }

  /**
   * Builds a 6-week (42-day) grid for the Jalali month containing
   * `monthAnchor`, including the leading/trailing days of adjacent months
   * so the calendar always renders full weeks.
   */
  function buildMonthGrid(monthAnchor: Date): DateOnly[] {
    const monthStart = startOfMonth(monthAnchor);
    const monthEnd = endOfMonth(monthAnchor);
    const leadingDayCount = getDay(monthStart);

    const gridStart = DateOnly.fromDate(monthStart).addDays(-leadingDayCount);
    const totalCells = 42;

    return Array.from({ length: totalCells }, (_, index) => gridStart.addDays(index)).filter((_, index) => {
      const cellDate = gridStart.addDays(index);
      const daysFromEnd = cellDate.diffInDays(DateOnly.fromDate(monthEnd));
      return daysFromEnd < 14; // trims a redundant trailing week when the month only needs 5 weeks
    });
  }

  function isSameJalaliMonth(date: DateOnly, monthAnchor: Date): boolean {
    return format(date.toDate(), "yyyy-MM") === format(monthAnchor, "yyyy-MM");
  }

  return { toJalaliLabel, monthTitle, nextMonth, previousMonth, buildMonthGrid, isSameJalaliMonth };
}
