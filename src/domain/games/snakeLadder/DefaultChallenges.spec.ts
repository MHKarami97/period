import { describe, expect, it } from "vitest";
import { MAX_CHALLENGE_LENGTH } from "./SnakeLadderBoard";
import { DEFAULT_GENERATION_OPTIONS } from "./SnakeLadderBoardGenerator";
import { DEFAULT_CHALLENGES } from "./defaultChallenges";

describe("DEFAULT_CHALLENGES", () => {
  it("has no duplicate entries", () => {
    expect(new Set(DEFAULT_CHALLENGES).size).toBe(DEFAULT_CHALLENGES.length);
  });

  it("is large enough to fill a generated board without repeating", () => {
    expect(DEFAULT_CHALLENGES.length).toBeGreaterThanOrEqual(DEFAULT_GENERATION_OPTIONS.challengeCount);
  });

  it("fits the board's length limit and mentions the acting player", () => {
    for (const text of DEFAULT_CHALLENGES) {
      expect(text.length).toBeLessThanOrEqual(MAX_CHALLENGE_LENGTH);
      expect(text).toContain("{player}");
    }
  });
});
