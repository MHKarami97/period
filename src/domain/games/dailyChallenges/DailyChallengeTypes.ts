export interface ChallengeItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly category?: string;
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
