export interface ScoredDay {
  readonly date: string;
  readonly status: string;
  readonly isOff: boolean;
}

export interface ChallengeScore {
  readonly streak: number;
  readonly bestStreak: number;
  readonly completedTotal: number;
  readonly points: number;
}

const POINTS_PER_COMPLETION = 10;
const POINTS_PER_BEST_STREAK_DAY = 5;
const MS_PER_DAY = 86_400_000;

function previousDay(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) - MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * Domain Service: streak and points of the daily challenges. Off days neither extend nor break a streak;
 * a pending "today" does not break it yet (the day is not over).
 */
export class ChallengeScorer {
  public static score(days: readonly ScoredDay[], todayIso: string): ChallengeScore {
    const byDate = new Map(days.map((day) => [day.date, day]));
    const completedTotal = days.filter((day) => day.status === "completed").length;

    return {
      streak: ChallengeScorer.currentStreak(byDate, todayIso),
      bestStreak: ChallengeScorer.bestStreak(days),
      completedTotal,
      points: completedTotal * POINTS_PER_COMPLETION + ChallengeScorer.bestStreak(days) * POINTS_PER_BEST_STREAK_DAY,
    };
  }

  private static currentStreak(byDate: ReadonlyMap<string, ScoredDay>, todayIso: string): number {
    let streak = 0;
    let cursor = todayIso;
    let first = true;
    for (let guard = 0; guard < 400; guard += 1) {
      const day = byDate.get(cursor);
      if (day && day.status === "completed") {
        streak += 1;
      } else if (day && (day.isOff || day.status === "off")) {
        // off days are neutral
      } else if (first && day && day.status === "pending") {
        // today is not over yet
      } else {
        break;
      }
      first = false;
      cursor = previousDay(cursor);
    }
    return streak;
  }

  private static bestStreak(days: readonly ScoredDay[]): number {
    const sorted = [...days].sort((left, right) => (left.date < right.date ? -1 : 1));
    let best = 0;
    let run = 0;
    for (const day of sorted) {
      if (day.status === "completed") {
        run += 1;
        best = Math.max(best, run);
      } else if (!day.isOff && day.status !== "off") {
        run = 0;
      }
    }
    return best;
  }
}
