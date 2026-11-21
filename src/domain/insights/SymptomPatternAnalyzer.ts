import type { Cycle } from "../entities/Cycle";
import type { Symptom } from "../entities/Symptom";
import { DateOnly } from "../valueObjects/DateOnly";
import { tagLabel } from "./SymptomTags";

export interface SymptomInsight {
  readonly id: string;
  readonly icon: string;
  readonly text: string;
}

export interface TagCount {
  readonly tag: string;
  readonly count: number;
}

export interface TemperaturePoint {
  readonly dateIso: string;
  readonly value: number;
}

export interface SymptomAnalysis {
  readonly insights: readonly SymptomInsight[];
  readonly topTags: readonly TagCount[];
  readonly averageSleep: number | null;
  readonly temperatures: readonly TemperaturePoint[];
}

const MIN_OCCURRENCES = 3;
const MIN_DISTINCT_CYCLES = 2;
const PATTERN_SHARE = 0.6;
const PREMENSTRUAL_WINDOW_DAYS = 7;
const PERIOD_WINDOW_DAYS = 5;
const OVULATION_FROM_DAY = 12;
const OVULATION_TO_DAY = 16;
const MAX_CYCLE_DAY = 45;
const SLEEP_WINDOW_DAYS = 14;
const TEMPERATURE_WINDOW_DAYS = 45;
const MAX_INSIGHTS = 4;
const TOP_TAGS = 5;
const SEVERE_PAIN = 3;

interface Placed {
  readonly symptom: Symptom;
  readonly cycleStartIso: string | null;
  readonly cycleDay: number | null;
  readonly daysBeforeNext: number | null;
}

/**
 * Domain Service: finds simple, explainable patterns ("headache usually shows up in the 7 days before the period").
 * Counts only - no medical claims; the UI states that these are observations of the user's own data.
 */
export class SymptomPatternAnalyzer {
  public static analyze(cycles: readonly Cycle[], symptoms: readonly Symptom[], today: DateOnly = DateOnly.today()): SymptomAnalysis {
    const starts = [...cycles].map((cycle) => cycle.startDate).sort((left, right) => left.diffInDays(right));
    const placed = symptoms.map((symptom) => SymptomPatternAnalyzer.place(symptom, starts));

    return {
      insights: SymptomPatternAnalyzer.insights(placed),
      topTags: SymptomPatternAnalyzer.topTags(symptoms),
      averageSleep: SymptomPatternAnalyzer.averageSleep(symptoms, today),
      temperatures: SymptomPatternAnalyzer.temperatures(symptoms, today),
    };
  }

  private static place(symptom: Symptom, starts: readonly DateOnly[]): Placed {
    const current = [...starts].reverse().find((start) => !start.isAfter(symptom.date));
    const next = starts.find((start) => start.isAfter(symptom.date));
    const cycleDay = current ? symptom.date.diffInDays(current) + 1 : null;
    return {
      symptom,
      cycleStartIso: current ? current.toIsoString() : null,
      cycleDay: cycleDay !== null && cycleDay <= MAX_CYCLE_DAY ? cycleDay : null,
      daysBeforeNext: next ? next.diffInDays(symptom.date) : null,
    };
  }

  private static insights(placed: readonly Placed[]): SymptomInsight[] {
    const tags = new Set(placed.flatMap((item) => item.symptom.tags));
    const result: SymptomInsight[] = [];

    for (const tag of tags) {
      const items = placed.filter((item) => item.symptom.tags.includes(tag));
      if (items.length < MIN_OCCURRENCES || new Set(items.map((item) => item.cycleStartIso)).size < MIN_DISTINCT_CYCLES) continue;

      const share = (predicate: (item: Placed) => boolean): number => items.filter(predicate).length / items.length;
      const label = tagLabel(tag);
      const count = (predicate: (item: Placed) => boolean): string => `${items.filter(predicate).length.toLocaleString("fa-IR")} از ${items.length.toLocaleString("fa-IR")} بار`;

      const premenstrual = (item: Placed): boolean => item.daysBeforeNext !== null && item.daysBeforeNext >= 1 && item.daysBeforeNext <= PREMENSTRUAL_WINDOW_DAYS;
      const period = (item: Placed): boolean => item.cycleDay !== null && item.cycleDay <= PERIOD_WINDOW_DAYS;
      const ovulation = (item: Placed): boolean => item.cycleDay !== null && item.cycleDay >= OVULATION_FROM_DAY && item.cycleDay <= OVULATION_TO_DAY;

      if (share(premenstrual) >= PATTERN_SHARE) {
        result.push({ id: `pms-${tag}`, icon: "🌙", text: `«${label}» معمولاً در ۷ روز قبل از پریود ثبت شده (${count(premenstrual)}).` });
      } else if (share(period) >= PATTERN_SHARE) {
        result.push({ id: `period-${tag}`, icon: "🩸", text: `«${label}» بیشتر در روزهای اول پریود ثبت شده (${count(period)}).` });
      } else if (share(ovulation) >= PATTERN_SHARE) {
        result.push({ id: `ovulation-${tag}`, icon: "🥚", text: `«${label}» بیشتر نزدیک تخمک‌گذاری (روز ۱۲ تا ۱۶ چرخه) ثبت شده (${count(ovulation)}).` });
      }
    }

    const severe = placed.filter((item) => item.symptom.painLevel >= SEVERE_PAIN && item.cycleDay !== null);
    if (severe.length >= MIN_OCCURRENCES) {
      const days = severe.map((item) => item.cycleDay as number).sort((left, right) => left - right);
      const median = days[Math.floor(days.length / 2)];
      result.push({ id: "pain-median", icon: "⚠️", text: `درد شدید (۳ یا ۴) معمولاً حوالی روز ${median.toLocaleString("fa-IR")} چرخه ثبت شده است.` });
    }
    return result.slice(0, MAX_INSIGHTS);
  }

  private static topTags(symptoms: readonly Symptom[]): TagCount[] {
    const counts = new Map<string, number>();
    for (const symptom of symptoms) {
      for (const tag of symptom.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, TOP_TAGS);
  }

  private static averageSleep(symptoms: readonly Symptom[], today: DateOnly): number | null {
    const since = today.addDays(-SLEEP_WINDOW_DAYS);
    const values = symptoms.filter((item) => item.sleepHours !== null && !item.date.isBefore(since)).map((item) => item.sleepHours as number);
    return values.length === 0 ? null : Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  }

  private static temperatures(symptoms: readonly Symptom[], today: DateOnly): TemperaturePoint[] {
    const since = today.addDays(-TEMPERATURE_WINDOW_DAYS);
    return symptoms
      .filter((item) => item.temperatureC !== null && !item.date.isBefore(since))
      .sort((left, right) => left.date.diffInDays(right.date))
      .map((item) => ({ dateIso: item.date.toIsoString(), value: item.temperatureC as number }));
  }
}
