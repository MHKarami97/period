import { describe, expect, it } from "vitest";
import type { IRandomSource } from "../IRandomSource";
import { BoardValidationError } from "./BoardValidationError";
import { SnakeLadderBoard } from "./SnakeLadderBoard";
import { SnakeLadderBoardGenerator } from "./SnakeLadderBoardGenerator";
import { PlayerRole, SnakeLadderGame } from "./SnakeLadderGame";

class SeededRandom implements IRandomSource {
  private state: number;

  public constructor(seed: number) {
    this.state = seed;
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return minInclusive + Math.floor((this.state / 4294967296) * (maxInclusive - minInclusive + 1));
  }
}

describe("SnakeLadderBoard", () => {
  it("rejects a snake that goes up", () => {
    expect(() => SnakeLadderBoard.empty().withSnake(10, 20)).toThrow(BoardValidationError);
  });

  it("rejects chained jumps", () => {
    const board = SnakeLadderBoard.empty().withLadder(5, 30);
    expect(() => board.withSnake(30, 10)).toThrow(BoardValidationError);
  });

  it("replaces a challenge when a snake is placed on the same cell", () => {
    const board = SnakeLadderBoard.empty().withChallenge(40, "x").withSnake(40, 12);
    expect(board.kindOf(40)).toBe("snake");
    expect(board.challengeAt(40)).toBeNull();
  });

  it("round-trips through a JSON snapshot", () => {
    const board = SnakeLadderBoard.empty().withLadder(3, 22).withSnake(50, 7).withChallenge(30, "hello");
    const restored = SnakeLadderBoard.fromSnapshot(JSON.parse(JSON.stringify(board.toSnapshot())));
    expect(restored.jumpTarget(3)).toBe(22);
    expect(restored.jumpTarget(50)).toBe(7);
    expect(restored.challengeAt(30)).toBe("hello");
  });
});

describe("SnakeLadderBoardGenerator", () => {
  it("always produces a valid board with the requested amounts", () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const board = new SnakeLadderBoardGenerator(new SeededRandom(seed)).generate();
      expect(board.ladderCount).toBe(8);
      expect(board.snakeCount).toBe(8);
      expect(board.challengeCount).toBe(22);
    }
  });
});

describe("SnakeLadderGame", () => {
  const board = SnakeLadderBoard.empty().withLadder(4, 20).withSnake(7, 2).withChallenge(20, "{player} و {partner}");

  it("climbs a ladder and resolves challenge placeholders with names", () => {
    const game = SnakeLadderGame.start({ board, womanName: "سارا", manName: "علی", firstRole: PlayerRole.Woman });
    const { game: next, result } = game.roll(4);
    expect(result.finalCell).toBe(20);
    expect(result.jump?.kind).toBe("ladder");
    expect(result.challengeText).toBe("سارا و علی");
    expect(next.currentPlayer.role).toBe(PlayerRole.Man);
  });

  it("slides down a snake", () => {
    const game = SnakeLadderGame.start({ board, womanName: "a", manName: "b" });
    const { result } = game.roll(6).game.roll(1).game.roll(1);
    expect(result.finalCell).toBe(2);
    expect(result.jump?.kind).toBe("snake");
  });

  it("declares a winner on reaching cell 100 and rejects further rolls", () => {
    let game = SnakeLadderGame.start({ board: SnakeLadderBoard.empty(), womanName: "a", manName: "b" });
    for (let i = 0; i < 40 && !game.isFinished; i += 1) {
      game = game.roll(6).game;
    }
    expect(game.winner).not.toBeNull();
    expect(() => game.roll(1)).toThrow();
  });
});
