export type ChallengeTimeTag = "day" | "night" | "weekend" | "holiday" | "any";

export interface ChallengeTimeTagOption {
  readonly key: ChallengeTimeTag;
  readonly label: string;
  readonly iconName: string;
  readonly badgeClass: string;
}

export const CHALLENGE_TIME_TAGS: readonly ChallengeTimeTagOption[] = [
  {
    key: "any",
    label: "هر زمان",
    iconName: "sparkles",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
  {
    key: "day",
    label: "روز",
    iconName: "sun",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
  {
    key: "night",
    label: "شب",
    iconName: "moon",
    badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  {
    key: "weekend",
    label: "آخر هفته",
    iconName: "calendar",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  {
    key: "holiday",
    label: "روز تعطیل",
    iconName: "beach",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
] as const;

export function getChallengeTimeTags(item: ChallengeItem): ChallengeTimeTag[] {
  if (item.timeTags && item.timeTags.length > 0) {
    return [...item.timeTags];
  }
  if (item.timeTag) {
    return [item.timeTag];
  }
  return ["any"];
}

export function getTimeTagOption(tag: ChallengeTimeTag): ChallengeTimeTagOption {
  return CHALLENGE_TIME_TAGS.find((t) => t.key === tag) ?? CHALLENGE_TIME_TAGS[0];
}

export interface ChallengeItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly category?: string;
  readonly timeTag?: ChallengeTimeTag;
  readonly timeTags?: readonly ChallengeTimeTag[];
  readonly isDefault?: boolean;
}

export type ChallengeDayStatus = "pending" | "completed" | "skipped" | "off";

export interface DailyChallengePlan {
  readonly date: string; // ISO date string YYYY-MM-DD
  readonly dayOfWeekIndex: number; // 0 (شنبه) to 6 (جمعه)
  readonly dayName: string; // "شنبه", "یکشنبه", ..., "جمعه"
  readonly jalaliDateLabel: string; // e.g. "۱ آذر ۱۴۰۵"
  challengeId?: string;
  challengeTitle: string;
  challengeDescription?: string;
  challengeTimeTags?: ChallengeTimeTag[];
  isOff: boolean;
  offReason?: string;
  status: ChallengeDayStatus;
  completionNote?: string;
  completedAt?: string;
}

export interface WeeklyChallengeSchedule {
  readonly weekStartIso: string; // Saturday ISO date (YYYY-MM-DD)
  readonly weekEndIso: string; // Friday ISO date (YYYY-MM-DD)
  readonly weekTitle: string; // e.g. "شنبه ۱ آذر تا جمعه ۷ آذر"
  days: DailyChallengePlan[]; // exactly 7 days
  readonly createdAt: string;
  updatedAt: string;
}

export interface DailyChallengesSettings {
  customPool: ChallengeItem[];
  schedules: Record<string, WeeklyChallengeSchedule>; // keyed by weekStartIso
  selectedWeekIso?: string;
}
