import { describe, expect, it } from "vitest";
import type { IRandomSource } from "../IRandomSource";
import { DEFAULT_CHALLENGES } from "./defaultChallenges";
import {
  DEFAULT_GENERATION_OPTIONS,
  GENERATION_LIMITS,
  normalizeGenerationOptions,
  SnakeLadderBoardGenerator,
} from "./SnakeLadderBoardGenerator";

class SeededRandom implements IRandomSource {
  public constructor(private state: number) {}

  public nextInt(minInclusive: number, maxInclusive: number): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return minInclusive + Math.floor((this.state / 4294967296) * (maxInclusive - minInclusive + 1));
  }
}

describe("normalizeGenerationOptions", () => {
  it("clamps and rounds every field", () => {
    expect(normalizeGenerationOptions({ snakeCount: -3, ladderCount: 99, challengeCount: 12.6 })).toEqual({
      snakeCount: 0,
      ladderCount: GENERATION_LIMITS.ladderCount.max,
      challengeCount: 13,
    });
  });

  it("falls back to defaults for missing or non-numeric values", () => {
    expect(normalizeGenerationOptions({ snakeCount: "x", ladderCount: Number.NaN })).toEqual(DEFAULT_GENERATION_OPTIONS);
  });

  it("never allows more challenges than the built-in pool can fill without repeats", () => {
    expect(GENERATION_LIMITS.challengeCount.max).toBeLessThanOrEqual(DEFAULT_CHALLENGES.length);
  });
});

describe("SnakeLadderBoardGenerator with custom counts", () => {
  it.each([1, 7, 42, 2026])("honours the requested counts (seed %i)", (seed) => {
    const board = new SnakeLadderBoardGenerator(new SeededRandom(seed)).generate({
      snakeCount: 12,
      ladderCount: 3,
      challengeCount: 60,
    });
    expect(board.snakeCount).toBe(12);
    expect(board.ladderCount).toBe(3);
    expect(board.challengeCount).toBe(60);
  });

  it("can produce a board without snakes, ladders or challenges", () => {
    const board = new SnakeLadderBoardGenerator(new SeededRandom(5)).generate({ snakeCount: 0, ladderCount: 0, challengeCount: 0 });
    expect([board.snakeCount, board.ladderCount, board.challengeCount]).toEqual([0, 0, 0]);
  });

  it("defaults to more challenges than before", () => {
    expect(DEFAULT_GENERATION_OPTIONS.challengeCount).toBe(30);
  });
});
