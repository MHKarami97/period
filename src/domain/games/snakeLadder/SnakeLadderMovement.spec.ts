import { describe, expect, it } from "vitest";
import type { IRandomSource } from "../IRandomSource";
import { SnakeLadderBoard } from "./SnakeLadderBoard";
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

describe("SnakeLadderGame movement", () => {
  it("reports every cell walked over, before any jump", () => {
    const board = SnakeLadderBoard.empty().withLadder(4, 20);
    const game = SnakeLadderGame.start({ board, womanName: "a", manName: "b", firstRole: PlayerRole.Woman });
    const { result } = game.roll(4);
    expect(result.path).toEqual([1, 2, 3, 4]);
    expect(result.landedCell).toBe(4);
    expect(result.finalCell).toBe(20);
  });

  it("walks only from the current position on the next turn", () => {
    const first = SnakeLadderGame.start({ board: SnakeLadderBoard.empty(), womanName: "a", manName: "b", firstRole: PlayerRole.Woman });
    const afterWoman = first.roll(3).game;
    const afterMan = afterWoman.roll(2).game;
    expect(afterMan.roll(5).result.path).toEqual([4, 5, 6, 7, 8]);
  });

  it("never picks a die that lands on the opponent's cell when another face exists", () => {
    const start = SnakeLadderGame.start({ board: SnakeLadderBoard.empty(), womanName: "a", manName: "b", firstRole: PlayerRole.Woman });
    const manToMove = start.roll(3).game;
    for (let seed = 1; seed <= 200; seed += 1) {
      expect(manToMove.pickDice(new SeededRandom(seed))).not.toBe(3);
    }
  });

  it("still covers every other face", () => {
    const start = SnakeLadderGame.start({ board: SnakeLadderBoard.empty(), womanName: "a", manName: "b", firstRole: PlayerRole.Woman });
    const manToMove = start.roll(3).game;
    const random = new SeededRandom(42);
    const seen = new Set<number>();
    for (let index = 0; index < 300; index += 1) {
      seen.add(manToMove.pickDice(random));
    }
    expect([...seen].sort()).toEqual([1, 2, 4, 5, 6]);
  });
});
