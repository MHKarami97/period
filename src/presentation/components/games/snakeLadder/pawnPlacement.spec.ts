import { describe, expect, it } from "vitest";
import { PlayerRole } from "@domain/games/snakeLadder/SnakeLadderGame";
import { placePawns } from "./boardToken";

const woman = { role: PlayerRole.Woman, position: 4 };
const man = { role: PlayerRole.Man, position: 4 };

function placementOf(placements: ReturnType<typeof placePawns>, role: PlayerRole) {
  const found = placements.find((placement) => placement.role === role);
  if (!found) throw new Error("missing placement");
  return found;
}

describe("placePawns", () => {
  it("centres a lone pawn at full size", () => {
    expect(placePawns([woman])).toEqual([{ role: PlayerRole.Woman, leftPercent: 50, heightPercent: 100, zIndex: 1 }]);
  });

  it("never moves or resizes the resting pawn while the other one walks through its cell", () => {
    const alone = placementOf(placePawns([woman]), PlayerRole.Woman);
    const whileWalkerPasses = placePawns([woman, { ...man, isMoving: true }]);
    const resting = placementOf(whileWalkerPasses, PlayerRole.Woman);
    expect(resting.leftPercent).toBe(alone.leftPercent);
    expect(resting.heightPercent).toBe(alone.heightPercent);

    const walker = placementOf(whileWalkerPasses, PlayerRole.Man);
    expect(walker.leftPercent).toBeGreaterThan(50);
    expect(walker.zIndex).toBeGreaterThan(resting.zIndex);
  });

  it("works the same when the woman is the walker", () => {
    const placements = placePawns([{ ...woman, isMoving: true }, man]);
    expect(placementOf(placements, PlayerRole.Man).leftPercent).toBe(50);
    expect(placementOf(placements, PlayerRole.Woman).leftPercent).toBeLessThan(50);
  });

  it("spreads two resting pawns symmetrically", () => {
    const placements = placePawns([woman, man]);
    expect(placementOf(placements, PlayerRole.Woman).leftPercent + placementOf(placements, PlayerRole.Man).leftPercent).toBe(100);
    expect(placementOf(placements, PlayerRole.Woman).heightPercent).toBeLessThan(100);
  });
});
