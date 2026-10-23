import { BOARD_SIZE, type CellKind } from "@domain/games/snakeLadder/SnakeLadderBoard";

export type BoardIconKind = "snake" | "ladder" | "challenge" | "finish";

/** Which icon a board cell shows (null = plain number only). */
export function iconKindOfCell(kind: CellKind, cell: number): BoardIconKind | null {
  if (kind !== "empty") {
    return kind;
  }
  return cell === BOARD_SIZE ? "finish" : null;
}
