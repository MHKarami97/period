import { DateOnly } from "../valueObjects/DateOnly";
import { ChallengeProgress } from "./challenge";
import type { HamdelEntry } from "./HamdelEntry";
import { HAMDEL_SECTIONS, getHamdelSection } from "./hamdelSections";

export type TrendGranularity = "week" | "month";

/** Calendar-specific bucketing (Jalali weeks/months), injected so the domain stays calendar-agnostic. */
export interface PeriodBucketer {
  keyOf(day: DateOnly, granularity: TrendGranularity): string;
  labelOf(day: DateOnly, granularity: TrendGranularity): string;
}

export interface TrendPoint {
  readonly key: string;
  readonly label: string;
  readonly happiness: number;
  readonly sadness: number;
}

export interface CountItem {
  readonly value: string;
  readonly label: string;
  readonly count: number;
}

export interface SectionCount {
  readonly section: string;
  readonly title: string;
  readonly icon: string;
  readonly count: number;
}

export interface MoodSummary {
  readonly happiness: number;
  readonly sadness: number;
  /** Share of happy days among happy + sad days (0..1); null when nothing was logged. */
  readonly positiveRatio: number | null;
  readonly averageHappinessIntensity: number | null;
  readonly averageSadnessIntensity: number | null;
}

export interface HamdelStats {
  readonly totalEntries: number;
  readonly sectionCounts: readonly SectionCount[];
  readonly mood: MoodSummary;
  readonly reactions: readonly CountItem[];
  readonly promises: readonly CountItem[];
  readonly gifts: readonly CountItem[];
  readonly wishlist: readonly CountItem[];
  readonly hints: readonly CountItem[];
  readonly messagesSaid: number;
  readonly messagesSaidLast30Days: number;
  readonly challenges: { readonly active: number; readonly completed: number; readonly ended: number };
  readonly pendingCalls: number;
}

export const MOOD_WINDOW_DAYS = 30;

function entriesOf(entries: readonly HamdelEntry[], section: string): HamdelEntry[] {
  return entries.filter((entry) => entry.section === section);
}

function isWithinLastDays(dateIso: string | null, today: DateOnly, days: number): boolean {
  if (!dateIso) return false;
  const age = today.diffInDays(DateOnly.fromIsoString(dateIso));
  return age >= 0 && age < days;
}

function average(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function intensities(list: readonly HamdelEntry[]): number[] {
  return list.map((entry) => Number(entry.valueOf("intensity"))).filter((value) => Number.isInteger(value) && value >= 1 && value <= 5);
}

/** How many entries of `section` have each option of select field `fieldKey` (declared option order, empty ones kept). */
export function distribution(entries: readonly HamdelEntry[], sectionId: string, fieldKey: string): CountItem[] {
  const field = getHamdelSection(sectionId).fields.find((candidate) => candidate.key === fieldKey);
  const list = entriesOf(entries, sectionId);
  return (field?.options ?? []).map((option) => ({
    value: option.value,
    label: option.label,
    count: list.filter((entry) => entry.valueOf(fieldKey) === option.value).length,
  }));
}

/** Happy vs sad entries per week or month, oldest first, with empty periods kept so the chart has no gaps. */
export function buildTrend(
  entries: readonly HamdelEntry[],
  today: DateOnly,
  bucketer: PeriodBucketer,
  granularity: TrendGranularity,
  count: number,
): TrendPoint[] {
  const buckets: { key: string; label: string }[] = [];
  const seen = new Set<string>();
  for (let back = 0; buckets.length < count && back < count * 32; back += 1) {
    const day = today.addDays(-back);
    const key = bucketer.keyOf(day, granularity);
    if (!seen.has(key)) {
      seen.add(key);
      buckets.push({ key, label: bucketer.labelOf(day, granularity) });
    }
  }
  buckets.reverse();

  const happiness = new Map<string, number>();
  const sadness = new Map<string, number>();
  for (const entry of entries) {
    const target = entry.section === "happiness" ? happiness : entry.section === "sadness" ? sadness : null;
    if (!target || !entry.dateIso) continue;
    const key = bucketer.keyOf(DateOnly.fromIsoString(entry.dateIso), granularity);
    target.set(key, (target.get(key) ?? 0) + 1);
  }
  return buckets.map((bucket) => ({
    ...bucket,
    happiness: happiness.get(bucket.key) ?? 0,
    sadness: sadness.get(bucket.key) ?? 0,
  }));
}

export function buildHamdelStats(entries: readonly HamdelEntry[], today: DateOnly): HamdelStats {
  const recentHappy = entriesOf(entries, "happiness").filter((entry) => isWithinLastDays(entry.dateIso, today, MOOD_WINDOW_DAYS));
  const recentSad = entriesOf(entries, "sadness").filter((entry) => isWithinLastDays(entry.dateIso, today, MOOD_WINDOW_DAYS));
  const moodTotal = recentHappy.length + recentSad.length;

  const messages = entriesOf(entries, "messages").filter((entry) => entry.valueOf("status") === "said");
  const progresses = entriesOf(entries, "challenges").map((entry) => ChallengeProgress.from(entry, today));

  return {
    totalEntries: entries.length,
    sectionCounts: HAMDEL_SECTIONS.map((section) => ({
      section: section.id,
      title: section.title,
      icon: section.icon,
      count: entriesOf(entries, section.id).length,
    })),
    mood: {
      happiness: recentHappy.length,
      sadness: recentSad.length,
      positiveRatio: moodTotal === 0 ? null : recentHappy.length / moodTotal,
      averageHappinessIntensity: average(intensities(recentHappy)),
      averageSadnessIntensity: average(intensities(recentSad)),
    },
    reactions: distribution(entries, "reactions", "reaction"),
    promises: distribution(entries, "promises", "status"),
    gifts: distribution(entries, "gifts", "status"),
    wishlist: distribution(entries, "wishlist", "status"),
    hints: distribution(entries, "hints", "status"),
    messagesSaid: messages.length,
    messagesSaidLast30Days: messages.filter((entry) => isWithinLastDays(entry.valueOf("saidAt") || null, today, MOOD_WINDOW_DAYS)).length,
    challenges: {
      completed: progresses.filter((progress) => progress.isCompleted).length,
      ended: progresses.filter((progress) => !progress.isCompleted && progress.hasEnded).length,
      active: progresses.filter((progress) => !progress.isCompleted && !progress.hasEnded).length,
    },
    pendingCalls: entriesOf(entries, "calls").filter((entry) => entry.valueOf("status") !== "done").length,
  };
}
