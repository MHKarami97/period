import { BoardValidationError } from "./BoardValidationError";

export const BOARD_SIZE = 100;
export const FIRST_CELL = 1;
export const MAX_CHALLENGE_LENGTH = 300;

/** Snakes/ladders/challenges may only live on cells 2..99 (start and finish stay clean). */
const MIN_SPECIAL_CELL = FIRST_CELL + 1;
const MAX_SPECIAL_CELL = BOARD_SIZE - 1;

export type CellKind = "empty" | "challenge" | "snake" | "ladder";

/** Plain, JSON-friendly representation used for persistence. */
export interface BoardSnapshot {
  snakes: Record<number, number>;
  ladders: Record<number, number>;
  challenges: Record<number, string>;
}

interface BoardDraft {
  snakes: Map<number, number>;
  ladders: Map<number, number>;
  challenges: Map<number, string>;
}

/**
 * SnakeLadderBoard - immutable Entity holding the rules of one board layout.
 *
 * Invariants (checked on every construction):
 *  - a snake goes strictly DOWN, a ladder strictly UP;
 *  - snake/ladder starts live on cells 2..99, ladder ends on 2..99, snake ends on 1..98;
 *  - one cell hosts at most one snake/ladder start;
 *  - no chains: the end of a jump is never the start of another jump;
 *  - a challenge never shares a cell with a snake/ladder start and is never blank.
 * A challenge placed on the END of a jump is allowed: it fires after the slide/climb.
 */
export class SnakeLadderBoard {
  private constructor(
    private readonly snakes: ReadonlyMap<number, number>,
    private readonly ladders: ReadonlyMap<number, number>,
    private readonly challenges: ReadonlyMap<number, string>,
  ) {
    SnakeLadderBoard.assertValid(snakes, ladders, challenges);
  }

  public static empty(): SnakeLadderBoard {
    return new SnakeLadderBoard(new Map(), new Map(), new Map());
  }

  public static fromSnapshot(snapshot: BoardSnapshot): SnakeLadderBoard {
    return new SnakeLadderBoard(
      SnakeLadderBoard.toMap(snapshot.snakes),
      SnakeLadderBoard.toMap(snapshot.ladders),
      SnakeLadderBoard.toMap(snapshot.challenges),
    );
  }

  public get snakeCount(): number {
    return this.snakes.size;
  }

  public get ladderCount(): number {
    return this.ladders.size;
  }

  public get challengeCount(): number {
    return this.challenges.size;
  }

  public kindOf(cell: number): CellKind {
    if (this.snakes.has(cell)) return "snake";
    if (this.ladders.has(cell)) return "ladder";
    if (this.challenges.has(cell)) return "challenge";
    return "empty";
  }

  /** Where a token landing on `cell` is moved to (snake tail / ladder top), or null. */
  public jumpTarget(cell: number): number | null {
    return this.snakes.get(cell) ?? this.ladders.get(cell) ?? null;
  }

  public challengeAt(cell: number): string | null {
    return this.challenges.get(cell) ?? null;
  }

  public withSnake(from: number, to: number): SnakeLadderBoard {
    return this.mutate((draft) => {
      SnakeLadderBoard.clearCell(draft, from);
      draft.snakes.set(from, to);
    });
  }

  public withLadder(from: number, to: number): SnakeLadderBoard {
    return this.mutate((draft) => {
      SnakeLadderBoard.clearCell(draft, from);
      draft.ladders.set(from, to);
    });
  }

  public withChallenge(cell: number, text: string): SnakeLadderBoard {
    return this.mutate((draft) => {
      SnakeLadderBoard.clearCell(draft, cell);
      draft.challenges.set(cell, text.trim());
    });
  }

  public withClearedCell(cell: number): SnakeLadderBoard {
    return this.mutate((draft) => SnakeLadderBoard.clearCell(draft, cell));
  }

  public toSnapshot(): BoardSnapshot {
    return {
      snakes: Object.fromEntries(this.snakes),
      ladders: Object.fromEntries(this.ladders),
      challenges: Object.fromEntries(this.challenges),
    };
  }

  private mutate(apply: (draft: BoardDraft) => void): SnakeLadderBoard {
    const draft: BoardDraft = {
      snakes: new Map(this.snakes),
      ladders: new Map(this.ladders),
      challenges: new Map(this.challenges),
    };
    apply(draft);
    return new SnakeLadderBoard(draft.snakes, draft.ladders, draft.challenges);
  }

  private static clearCell(draft: BoardDraft, cell: number): void {
    draft.snakes.delete(cell);
    draft.ladders.delete(cell);
    draft.challenges.delete(cell);
  }

  private static toMap<T>(record: Readonly<Record<number, T>>): Map<number, T> {
    return new Map(Object.entries(record).map(([key, value]) => [Number(key), value as T]));
  }

  private static assertValid(
    snakes: ReadonlyMap<number, number>,
    ladders: ReadonlyMap<number, number>,
    challenges: ReadonlyMap<number, string>,
  ): void {
    for (const [from, to] of snakes) {
      SnakeLadderBoard.assertSpecialCell(from, "سر مار");
      if (!Number.isInteger(to) || to < FIRST_CELL || to >= from) {
        throw new BoardValidationError("دُم مار باید یک خانه‌ی پایین‌تر از سر مار (و حداقل خانه ۱) باشد.");
      }
    }

    for (const [from, to] of ladders) {
      SnakeLadderBoard.assertSpecialCell(from, "پایه نردبان");
      if (!Number.isInteger(to) || to <= from || to > MAX_SPECIAL_CELL) {
        throw new BoardValidationError("بالای نردبان باید بالاتر از پایه آن و حداکثر خانه ۹۹ باشد.");
      }
    }

    for (const from of snakes.keys()) {
      if (ladders.has(from)) {
        throw new BoardValidationError("یک خانه نمی‌تواند هم سر مار باشد و هم پایه نردبان.");
      }
    }

    const jumpStarts = new Set<number>([...snakes.keys(), ...ladders.keys()]);
    for (const target of [...snakes.values(), ...ladders.values()]) {
      if (jumpStarts.has(target)) {
        throw new BoardValidationError("مقصد مار یا نردبان نمی‌تواند خودش شروع مار/نردبان دیگری باشد.");
      }
    }

    for (const [cell, text] of challenges) {
      SnakeLadderBoard.assertSpecialCell(cell, "چالش");
      if (jumpStarts.has(cell)) {
        throw new BoardValidationError("روی سر مار یا پایه نردبان نمی‌شود چالش گذاشت.");
      }
      if (text.trim().length === 0) {
        throw new BoardValidationError("متن چالش نمی‌تواند خالی باشد.");
      }
      if (text.length > MAX_CHALLENGE_LENGTH) {
        throw new BoardValidationError(`متن چالش حداکثر ${MAX_CHALLENGE_LENGTH} نویسه می‌تواند باشد.`);
      }
    }
  }

  private static assertSpecialCell(cell: number, label: string): void {
    if (!Number.isInteger(cell) || cell < MIN_SPECIAL_CELL || cell > MAX_SPECIAL_CELL) {
      throw new BoardValidationError(`${label} فقط می‌تواند روی خانه‌های ۲ تا ۹۹ باشد.`);
    }
  }
}
