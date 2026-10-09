import type { PlayerRole } from "@domain/games/snakeLadder/SnakeLadderGame";

/** A player's pawn as drawn on the board (0 = not started yet, hidden). */
export interface BoardToken {
  role: PlayerRole;
  position: number;
}
