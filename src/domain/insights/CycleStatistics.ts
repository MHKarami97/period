import type { Cycle } from "../entities/Cycle";
import { DateOnly } from "../valueObjects/DateOnly";

export type Regularity = "unknown" | "regular" | "variable" | "irregular";
export type AlertSeverity = "info" | "warning";

export interface StatAlert {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly text: string;
}

export interface CycleLengthPoint {
  readonly startIso: string;
  readonly length: number;
}

export interface CycleStats {
  readonly cycleCount: number;
  readonly lengths: readonly CycleLengthPoint[];
  readonly averageLength: number | null;
  readonly minLength: number | null;
  readonly maxLength: number | null;
  readonly standardDeviation: number | null;
  readonly averagePeriodLength: number | null;
  readonly regularity: Regularity;
  readonly alerts: readonly StatAlert[];
}

export const REGULARITY_LABELS_FA: Readonly<Record<Regularity, string>> = {
  unknown: "هنوز داده‌ی کافی نیست",
  regular: "منظم",
  variable: "نوسان طبیعی",
  irregular: "نامنظم",
};

/** Reference ranges follow the guide shown in the app (ACOG / Mayo Clinic ranges). */
const SHORT_CYCLE_DAYS = 21;
const LONG_CYCLE_DAYS = 35;
const REGULAR_RANGE_DAYS = 7;
const NORMAL_RANGE_DAYS = 9;
const LONG_PERIOD_DAYS = 7;
const MISSED_MONTHS_DAYS = 90;
const MIN_LENGTHS_FOR_REGULARITY = 3;
const MIN_CYCLES_FOR_ANALYSIS = 4;
const HISTORY_LIMIT = 12;
const RANGE_WINDOW = 6;

function mean(values: readonly number[]): number | null {
  return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Domain Service: descriptive statistics and simple screening alerts over logged cycles. Not a diagnosis. */
export class CycleStatisticsCalculator {
  public static calculate(cycles: readonly Cycle[], today: DateOnly = DateOnly.today()): CycleStats {
    const sorted = [...cycles].sort((left, right) => left.startDate.diffInDays(right.startDate));
    const lengths: CycleLengthPoint[] = sorted
      .slice(0, -1)
      .map((cycle, index) => ({ startIso: cycle.startDate.toIsoString(), length: cycle.lengthUntil(sorted[index + 1]) }))
      .slice(-HISTORY_LIMIT);
    const values = lengths.map((point) => point.length);

    const average = mean(values);
    const variance = average === null ? null : (mean(values.map((value) => (value - average) ** 2)) ?? 0);
    const periodLengths = sorted.map((cycle) => cycle.periodLengthInDays).filter((value): value is number => value !== null);

    const recent = values.slice(-RANGE_WINDOW);
    const range = recent.length === 0 ? 0 : Math.max(...recent) - Math.min(...recent);
    let regularity: Regularity = "unknown";
    if (values.length >= MIN_LENGTHS_FOR_REGULARITY) {
      regularity = range <= REGULAR_RANGE_DAYS ? "regular" : range <= NORMAL_RANGE_DAYS ? "variable" : "irregular";
    }

    const averagePeriod = mean(periodLengths);
    return {
      cycleCount: sorted.length,
      lengths,
      averageLength: average === null ? null : Math.round(average * 10) / 10,
      minLength: values.length ? Math.min(...values) : null,
      maxLength: values.length ? Math.max(...values) : null,
      standardDeviation: variance === null ? null : Math.round(Math.sqrt(variance) * 10) / 10,
      averagePeriodLength: averagePeriod === null ? null : Math.round(averagePeriod * 10) / 10,
      regularity,
      alerts: CycleStatisticsCalculator.alerts(sorted, values, range, averagePeriod, today),
    };
  }

  private static alerts(sorted: readonly Cycle[], values: readonly number[], range: number, averagePeriod: number | null, today: DateOnly): StatAlert[] {
    const alerts: StatAlert[] = [];
    const lastThree = values.slice(-3);

    if (lastThree.some((value) => value < SHORT_CYCLE_DAYS)) {
      alerts.push({ id: "short", severity: "warning", text: "دست‌کم یکی از سه چرخه‌ی اخیر کوتاه‌تر از ۲۱ روز بوده است؛ اگر تکرار شد با پزشک زنان مشورت کنید." });
    }
    if (lastThree.some((value) => value > LONG_CYCLE_DAYS)) {
      alerts.push({ id: "long", severity: "warning", text: "دست‌کم یکی از سه چرخه‌ی اخیر بیشتر از ۳۵ روز بوده است؛ اگر تکرار شد با پزشک زنان مشورت کنید." });
    }
    if (values.length >= MIN_LENGTHS_FOR_REGULARITY && range > NORMAL_RANGE_DAYS) {
      alerts.push({ id: "variation", severity: "warning", text: `اختلاف طول چرخه‌ها در ماه‌های اخیر ${range.toLocaleString("fa-IR")} روز بوده؛ نوسان بیش از ۹ روز معمولاً ارزش بررسی دارد.` });
    }
    if (averagePeriod !== null && averagePeriod > LONG_PERIOD_DAYS) {
      alerts.push({ id: "long-period", severity: "warning", text: "میانگین طول پریود بیشتر از ۷ روز است؛ خونریزی طولانی را با پزشک در میان بگذارید." });
    }

    const last = sorted[sorted.length - 1];
    if (last && !last.isOngoing && today.diffInDays(last.startDate) > MISSED_MONTHS_DAYS) {
      alerts.push({ id: "missed", severity: "warning", text: "بیش از ۳ ماه از شروع آخرین پریود ثبت‌شده گذشته است؛ اگر پریود شده‌اید ثبتش کنید، وگرنه (بدون بارداری) با پزشک مشورت کنید." });
    }
    if (sorted.length < MIN_CYCLES_FOR_ANALYSIS) {
      alerts.push({ id: "few-data", severity: "info", text: "برای تحلیل دقیق‌تر، دست‌کم ۴ پریود ثبت کنید." });
    }
    return alerts;
  }
}
