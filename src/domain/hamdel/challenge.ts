import { DateOnly } from "../valueObjects/DateOnly";
import type { HamdelEntry } from "./HamdelEntry";
import { HamdelValidationError } from "./HamdelValidationError";

export interface ChallengeDay {
  readonly iso: string;
  readonly dayNumber: number;
  readonly isDone: boolean;
  readonly isToday: boolean;
  readonly isFuture: boolean;
}

function parseDoneDates(raw: string): Set<string> {
  return new Set(raw.split(",").map((item) => item.trim()).filter((item) => item.length > 0));
}

function serializeDoneDates(dates: ReadonlySet<string>): string {
  return [...dates].sort().join(",");
}

/**
 * ChallengeProgress - read model of one small challenge (e.g. "one compliment a day").
 * The checked days live in the entry's hidden `done` field as comma-separated ISO dates.
 */
export class ChallengeProgress {
  private constructor(
    public readonly days: readonly ChallengeDay[],
    private readonly todayIso: string,
  ) {}

  public static from(entry: HamdelEntry, today: DateOnly): ChallengeProgress {
    const length = Number.parseInt(entry.valueOf("length"), 10) || 0;
    const start = DateOnly.fromIsoString(entry.valueOf("startAt"));
    const done = parseDoneDates(entry.valueOf("done"));
    const todayIso = today.toIsoString();
    const days = Array.from({ length }, (_, index) => {
      const iso = start.addDays(index).toIsoString();
      return { iso, dayNumber: index + 1, isDone: done.has(iso), isToday: iso === todayIso, isFuture: iso > todayIso };
    });
    return new ChallengeProgress(days, todayIso);
  }

  public get length(): number {
    return this.days.length;
  }

  public get doneCount(): number {
    return this.days.filter((day) => day.isDone).length;
  }

  public get isCompleted(): boolean {
    return this.length > 0 && this.doneCount === this.length;
  }

  public get hasStarted(): boolean {
    return this.days.length > 0 && !this.days[0].isFuture;
  }

  public get hasEnded(): boolean {
    return this.days.length > 0 && this.days[this.days.length - 1].iso < this.todayIso;
  }

  /** Consecutive checked days ending today (or yesterday, if today is not checked yet). */
  public get currentStreak(): number {
    const pastDays = this.days.filter((day) => !day.isFuture);
    let index = pastDays.length - 1;
    if (index >= 0 && pastDays[index].isToday && !pastDays[index].isDone) {
      index -= 1;
    }
    let streak = 0;
    while (index >= 0 && pastDays[index].isDone) {
      streak += 1;
      index -= 1;
    }
    return streak;
  }
}

/** Returns the new `done` field value after checking/unchecking `iso`. Future and out-of-range days are rejected. */
export function toggleChallengeDay(entry: HamdelEntry, iso: string, today: DateOnly): string {
  const progress = ChallengeProgress.from(entry, today);
  const day = progress.days.find((candidate) => candidate.iso === iso);
  if (!day) {
    throw new HamdelValidationError("این روز جزو چالش نیست.");
  }
  if (day.isFuture) {
    throw new HamdelValidationError("روزهای آینده را نمی‌شود تیک زد.");
  }
  const done = parseDoneDates(entry.valueOf("done"));
  if (done.has(iso)) {
    done.delete(iso);
  } else {
    done.add(iso);
  }
  return serializeDoneDates(done);
}
