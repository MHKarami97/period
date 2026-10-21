import { PlayerRole } from "@domain/games/snakeLadder/SnakeLadderGame";

/** A player's pawn as drawn on the board (0 = not started yet, hidden). */
export interface BoardToken {
  role: PlayerRole;
  position: number;
  /** True while this pawn is walking its turn (it is passing through, or arriving at, a cell). */
  isMoving?: boolean;
}

export interface PawnPlacement {
  readonly role: PlayerRole;
  /** Horizontal centre inside the cell, in percent of the cell width. */
  readonly leftPercent: number;
  readonly heightPercent: number;
  readonly zIndex: number;
}

const CENTER_PERCENT = 50;
const FULL_HEIGHT_PERCENT = 100;
/** Pawns that stay together on one cell sit side by side and a little smaller. */
const SHARED_OFFSET_PERCENT = 24;
const SHARED_HEIGHT_PERCENT = 92;
/** A pawn walking past a resting one is drawn beside it, so the resting pawn never has to move. */
const PASSING_OFFSET_PERCENT = 34;

function sideOf(role: PlayerRole): -1 | 1 {
  return role === PlayerRole.Woman ? -1 : 1;
}

/**
 * Decides where each pawn on ONE cell is drawn.
 *  - alone: centred, full size;
 *  - someone is walking through: the resting pawn stays exactly where it was (centred, full size)
 *    and only the walking pawn is shifted to its side and drawn on top;
 *  - nobody is walking and several pawns share the cell: they spread symmetrically.
 */
export function placePawns(tokens: readonly BoardToken[]): PawnPlacement[] {
  if (tokens.length <= 1) {
    return tokens.map((token) => ({ role: token.role, leftPercent: CENTER_PERCENT, heightPercent: FULL_HEIGHT_PERCENT, zIndex: 1 }));
  }
  const hasWalker = tokens.some((token) => token.isMoving);
  return tokens.map((token) => {
    if (hasWalker) {
      return token.isMoving
        ? { role: token.role, leftPercent: CENTER_PERCENT + sideOf(token.role) * PASSING_OFFSET_PERCENT, heightPercent: FULL_HEIGHT_PERCENT, zIndex: 2 }
        : { role: token.role, leftPercent: CENTER_PERCENT, heightPercent: FULL_HEIGHT_PERCENT, zIndex: 1 };
    }
    return { role: token.role, leftPercent: CENTER_PERCENT + sideOf(token.role) * SHARED_OFFSET_PERCENT, heightPercent: SHARED_HEIGHT_PERCENT, zIndex: 1 };
  });
}
