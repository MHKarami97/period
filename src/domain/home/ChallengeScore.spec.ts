import { describe, expect, it } from "vitest";
import { ChallengeScorer, type ScoredDay } from "./ChallengeScore";

const day = (date: string, status: string, isOff = false): ScoredDay => ({ date, status, isOff });

describe("ChallengeScorer", () => {
  it("counts consecutive completed days ending today", () => {
    const days = [day("2026-03-18", "completed"), day("2026-03-19", "completed"), day("2026-03-20", "completed")];
    expect(ChallengeScorer.score(days, "2026-03-20").streak).toBe(3);
  });

  it("does not break the streak on a pending today or an off day", () => {
    const days = [day("2026-03-17", "completed"), day("2026-03-18", "off", true), day("2026-03-19", "completed"), day("2026-03-20", "pending")];
    expect(ChallengeScorer.score(days, "2026-03-20").streak).toBe(2);
  });

  it("breaks on a skipped day and keeps the best streak", () => {
    const days = [day("2026-03-16", "completed"), day("2026-03-17", "completed"), day("2026-03-18", "skipped"), day("2026-03-19", "completed")];
    const score = ChallengeScorer.score(days, "2026-03-19");
    expect(score.streak).toBe(1);
    expect(score.bestStreak).toBe(2);
    expect(score.completedTotal).toBe(3);
  });
});
