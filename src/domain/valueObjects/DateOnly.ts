/**
 * DateOnly - Immutable Value Object wrapping a calendar day with no time
 * component. All domain-level date arithmetic (diffs, additions, ordering)
 * flows through this type so the rest of the domain never touches the raw
 * `Date` API directly, and stays independent from any calendar system
 * (Gregorian vs. Jalali). Presentation layer is responsible for formatting
 * a DateOnly into a Jalali string via date-fns-jalali.
 */
export class DateOnly {
  private readonly timestampUtcMidnight: number;

  private constructor(timestampUtcMidnight: number) {
    this.timestampUtcMidnight = timestampUtcMidnight;
  }

  public static fromDate(date: Date): DateOnly {
    const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return new DateOnly(utcMidnight);
  }

  public static fromIsoString(isoDate: string): DateOnly {
    const [year, month, day] = isoDate.split("-").map(Number);
    if (!year || !month || !day) {
      throw new Error(`Invalid ISO date string: ${isoDate}`);
    }
    return new DateOnly(Date.UTC(year, month - 1, day));
  }

  public static today(): DateOnly {
    return DateOnly.fromDate(new Date());
  }

  public addDays(days: number): DateOnly {
    const oneDayMs = 24 * 60 * 60 * 1000;
    return new DateOnly(this.timestampUtcMidnight + days * oneDayMs);
  }

  public diffInDays(other: DateOnly): number {
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Math.round((this.timestampUtcMidnight - other.timestampUtcMidnight) / oneDayMs);
  }

  public isBefore(other: DateOnly): boolean {
    return this.timestampUtcMidnight < other.timestampUtcMidnight;
  }

  public isAfter(other: DateOnly): boolean {
    return this.timestampUtcMidnight > other.timestampUtcMidnight;
  }

  public isSameDay(other: DateOnly): boolean {
    return this.timestampUtcMidnight === other.timestampUtcMidnight;
  }

  public isBetweenInclusive(start: DateOnly, end: DateOnly): boolean {
    return !this.isBefore(start) && !this.isAfter(end);
  }

  public toDate(): Date {
    return new Date(this.timestampUtcMidnight);
  }

  public toIsoString(): string {
    return this.toDate().toISOString().slice(0, 10);
  }
}
