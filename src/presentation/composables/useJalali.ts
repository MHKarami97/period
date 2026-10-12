import { format, addMonths, startOfMonth, endOfMonth, getDay } from "date-fns-jalali";
import { DateOnly } from "@domain/valueObjects/DateOnly";

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
   * Builds a grid for the Jalali month containing `monthAnchor`.
   * It exactly calculates the required grid size (35 or 42 cells) to cover 
   * all days without generating redundant trailing weeks.
   */
  function buildMonthGrid(monthAnchor: Date): DateOnly[] {
    const monthStart = startOfMonth(monthAnchor);
    const monthEnd = endOfMonth(monthAnchor);
    
    // Shift the Gregorian week start (Sun=0) to Jalali week start (Sat=0)
    // Sat(6) -> 0, Sun(0) -> 1, Mon(1) -> 2, ..., Fri(5) -> 6
    const leadingDayCount = (getDay(monthStart) + 1) % 7;

    const gridStart = DateOnly.fromDate(monthStart).addDays(-leadingDayCount);
    
    // Calculate total days in the current Jalali month safely using the domain object
    const daysInMonth = DateOnly.fromDate(monthEnd).diffInDays(DateOnly.fromDate(monthStart)) + 1;
    
    // Mathematically determine if we need 5 weeks (35 days) or 6 weeks (42 days)
    // This entirely removes the O(n) filter loop and heavy date instantiation.
    const totalCells = Math.ceil((leadingDayCount + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => gridStart.addDays(index));
  }

  function isSameJalaliMonth(date: DateOnly, monthAnchor: Date): boolean {
    return format(date.toDate(), "yyyy-MM") === format(monthAnchor, "yyyy-MM");
  }

  return { toJalaliLabel, monthTitle, nextMonth, previousMonth, buildMonthGrid, isSameJalaliMonth };
}