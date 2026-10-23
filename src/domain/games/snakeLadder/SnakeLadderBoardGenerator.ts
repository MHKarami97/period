import type { IRandomSource } from "../IRandomSource";
import { BOARD_SIZE, FIRST_CELL, SnakeLadderBoard } from "./SnakeLadderBoard";
import { DEFAULT_CHALLENGES } from "./defaultChallenges";

export interface BoardGenerationOptions {
  snakeCount: number;
  ladderCount: number;
  challengeCount: number;
}

export const DEFAULT_GENERATION_OPTIONS: BoardGenerationOptions = {
  snakeCount: 8,
  ladderCount: 8,
  challengeCount: 30,
};

/**
 * Upper bounds keep a board playable and always placeable: 12 + 12 jumps use
 * at most 48 of the 98 usable cells, and 60 challenges never exceed the size
 * of the built-in challenge pool (so a generated board has no repeated text).
 */
export const GENERATION_LIMITS: Readonly<Record<keyof BoardGenerationOptions, { min: number; max: number }>> = {
  snakeCount: { min: 0, max: 12 },
  ladderCount: { min: 0, max: 12 },
  challengeCount: { min: 0, max: 60 },
};

/** Rounds and clamps every field; missing or non-numeric fields fall back to the defaults. */
export function normalizeGenerationOptions(raw: Partial<Record<keyof BoardGenerationOptions, unknown>>): BoardGenerationOptions {
  const read = (key: keyof BoardGenerationOptions): number => {
    const value = raw[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return DEFAULT_GENERATION_OPTIONS[key];
    }
    const { min, max } = GENERATION_LIMITS[key];
    return Math.min(max, Math.max(min, Math.round(value)));
  };
  return { snakeCount: read("snakeCount"), ladderCount: read("ladderCount"), challengeCount: read("challengeCount") };
}

const MIN_JUMP_LENGTH = 8;
const MAX_JUMP_LENGTH = 40;
const MAX_PLACEMENT_ATTEMPTS = 1000;
const LOWEST_SPECIAL_CELL = FIRST_CELL + 1;
const HIGHEST_SPECIAL_CELL = BOARD_SIZE - 1;

/**
 * SnakeLadderBoardGenerator - Domain Service producing a fresh random layout.
 * Randomness is injected (IRandomSource) so tests can make it deterministic.
 * Every used cell (start AND end of a jump) is reserved, which guarantees
 * the no-chain / no-overlap invariants without needing a retry loop on validation.
 */
export class SnakeLadderBoardGenerator {
  public constructor(
    private readonly random: IRandomSource,
    private readonly challengePool: readonly string[] = DEFAULT_CHALLENGES,
  ) {}

  public generate(requested: BoardGenerationOptions = DEFAULT_GENERATION_OPTIONS): SnakeLadderBoard {
    const options = normalizeGenerationOptions(requested);
    const reserved = new Set<number>([FIRST_CELL, BOARD_SIZE]);
    const ladders: Record<number, number> = {};
    const snakes: Record<number, number> = {};

    this.placeJumps(options.ladderCount, reserved, ladders, "up");
    this.placeJumps(options.snakeCount, reserved, snakes, "down");

    const challenges = this.pickChallenges(options.challengeCount, new Set([...Object.keys(ladders), ...Object.keys(snakes)].map(Number)));

    return SnakeLadderBoard.fromSnapshot({ snakes, ladders, challenges });
  }

  private placeJumps(
    count: number,
    reserved: Set<number>,
    target: Record<number, number>,
    direction: "up" | "down",
  ): void {
    let placed = 0;
    let attempts = 0;

    while (placed < count && attempts < MAX_PLACEMENT_ATTEMPTS) {
      attempts += 1;
      const length = this.random.nextInt(MIN_JUMP_LENGTH, MAX_JUMP_LENGTH);
      const start =
        direction === "up"
          ? this.random.nextInt(LOWEST_SPECIAL_CELL, HIGHEST_SPECIAL_CELL - MIN_JUMP_LENGTH)
          : this.random.nextInt(LOWEST_SPECIAL_CELL + MIN_JUMP_LENGTH, HIGHEST_SPECIAL_CELL);
      const end =
        direction === "up"
          ? Math.min(start + length, HIGHEST_SPECIAL_CELL)
          : Math.max(start - length, LOWEST_SPECIAL_CELL);

      if (Math.abs(end - start) < MIN_JUMP_LENGTH || reserved.has(start) || reserved.has(end)) {
        continue;
      }

      reserved.add(start);
      reserved.add(end);
      target[start] = end;
      placed += 1;
    }
  }

  private pickChallenges(count: number, jumpStarts: ReadonlySet<number>): Record<number, string> {
    const candidates: number[] = [];
    for (let cell = LOWEST_SPECIAL_CELL; cell <= HIGHEST_SPECIAL_CELL; cell += 1) {
      if (!jumpStarts.has(cell)) {
        candidates.push(cell);
      }
    }

    const cells = this.shuffle(candidates).slice(0, Math.min(count, candidates.length));
    const texts = this.shuffle([...this.challengePool]);
    const result: Record<number, string> = {};

    if (texts.length === 0) {
      return result;
    }

    cells.forEach((cell, index) => {
      result[cell] = texts[index % texts.length];
    });
    return result;
  }

  /** Fisher-Yates shuffle returning a new array. */
  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = this.random.nextInt(0, index);
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }
}
