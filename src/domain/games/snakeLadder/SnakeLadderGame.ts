import type { IRandomSource } from "../IRandomSource";
import { BOARD_SIZE, SnakeLadderBoard } from "./SnakeLadderBoard";

export enum PlayerRole {
  Woman = "WOMAN",
  Man = "MAN",
}

export interface PlayerState {
  readonly role: PlayerRole;
  readonly name: string;
  readonly position: number;
}

export interface TurnResult {
  role: PlayerRole;
  playerName: string;
  dice: number;
  /** Cell the pawn lands on before any snake/ladder is applied. */
  landedCell: number;
  finalCell: number;
  /** Every cell the pawn walks over, one step at a time, ending at `landedCell`. */
  path: readonly number[];
  jump: { kind: "snake" | "ladder"; from: number; to: number } | null;
  /** Challenge text with {player}/{partner} already replaced by real names. */
  challengeText: string | null;
  hasWon: boolean;
}

export interface TurnOutcome {
  game: SnakeLadderGame;
  result: TurnResult;
}

interface Move {
  readonly landedCell: number;
  readonly path: readonly number[];
  readonly jumpTarget: number | null;
  readonly finalCell: number;
  readonly hasWon: boolean;
}

const MIN_DICE = 1;
const MAX_DICE = 6;
const MAX_NAME_LENGTH = 30;
const DICE_FACES: readonly number[] = Array.from({ length: MAX_DICE - MIN_DICE + 1 }, (_, index) => MIN_DICE + index);

/**
 * SnakeLadderGame - Aggregate Root for one play session between two players.
 * Immutable: `roll` returns a NEW game plus the TurnResult, matching the
 * convention used by Cycle (safe with shallowRef-based Pinia stores).
 * Rule: reaching or passing cell 100 wins (no exact-roll requirement).
 */
export class SnakeLadderGame {
  private constructor(
    private readonly board: SnakeLadderBoard,
    private readonly players: readonly [PlayerState, PlayerState],
    private readonly turnIndex: 0 | 1,
    private readonly winnerRole: PlayerRole | null,
  ) {}

  public static start(input: {
    board: SnakeLadderBoard;
    womanName: string;
    manName: string;
    firstRole?: PlayerRole;
  }): SnakeLadderGame {
    const woman = SnakeLadderGame.createPlayer(PlayerRole.Woman, input.womanName);
    const man = SnakeLadderGame.createPlayer(PlayerRole.Man, input.manName);
    const turnIndex = input.firstRole === PlayerRole.Man ? 1 : 0;
    return new SnakeLadderGame(input.board, [woman, man], turnIndex, null);
  }

  public get currentPlayer(): PlayerState {
    return this.players[this.turnIndex];
  }

  public get playerStates(): readonly PlayerState[] {
    return this.players;
  }

  public get winner(): PlayerState | null {
    return this.players.find((player) => player.role === this.winnerRole) ?? null;
  }

  public get isFinished(): boolean {
    return this.winnerRole !== null;
  }

  /**
   * Picks a die value for the current player. Faces that would leave both
   * pawns on the same final cell are excluded (when at least one other face
   * exists), so the pawns rarely end up sharing a square. The pick among the
   * remaining faces is uniform, and the rule applies equally to both players.
   */
  public pickDice(random: IRandomSource): number {
    const opponent = this.players[this.turnIndex === 0 ? 1 : 0];
    const from = this.currentPlayer.position;
    const sharesCell = (move: Move): boolean => !move.hasWon && opponent.position > 0 && move.finalCell === opponent.position;

    const safeFaces = DICE_FACES.filter((dice) => !sharesCell(this.resolveMove(from, dice)));
    const faces = safeFaces.length > 0 ? safeFaces : DICE_FACES;
    return faces[random.nextInt(0, faces.length - 1)];
  }

  public roll(dice: number): TurnOutcome {
    if (this.isFinished) {
      throw new Error("The game is already finished.");
    }
    if (!Number.isInteger(dice) || dice < MIN_DICE || dice > MAX_DICE) {
      throw new RangeError("Dice value must be an integer between 1 and 6.");
    }

    const player = this.currentPlayer;
    const opponent = this.players[this.turnIndex === 0 ? 1 : 0];
    const move = this.resolveMove(player.position, dice);

    const template = move.hasWon ? null : this.board.challengeAt(move.finalCell);
    const challengeText = template ? SnakeLadderGame.formatChallenge(template, player.name, opponent.name) : null;

    const moved: PlayerState = { ...player, position: move.finalCell };
    const nextPlayers: [PlayerState, PlayerState] =
      this.turnIndex === 0 ? [moved, this.players[1]] : [this.players[0], moved];
    const nextTurn: 0 | 1 = move.hasWon ? this.turnIndex : this.turnIndex === 0 ? 1 : 0;

    const result: TurnResult = {
      role: player.role,
      playerName: player.name,
      dice,
      landedCell: move.landedCell,
      finalCell: move.finalCell,
      path: move.path,
      jump:
        move.jumpTarget === null
          ? null
          : {
              kind: this.board.kindOf(move.landedCell) === "snake" ? "snake" : "ladder",
              from: move.landedCell,
              to: move.jumpTarget,
            },
      challengeText,
      hasWon: move.hasWon,
    };

    return {
      game: new SnakeLadderGame(this.board, nextPlayers, nextTurn, move.hasWon ? player.role : null),
      result,
    };
  }

  private resolveMove(from: number, dice: number): Move {
    const landedCell = Math.min(from + dice, BOARD_SIZE);
    const hasWon = landedCell === BOARD_SIZE;
    const jumpTarget = hasWon ? null : this.board.jumpTarget(landedCell);
    const path = Array.from({ length: landedCell - from }, (_, index) => from + index + 1);
    return { landedCell, path, jumpTarget, finalCell: jumpTarget ?? landedCell, hasWon };
  }

  private static createPlayer(role: PlayerRole, rawName: string): PlayerState {
    const name = rawName.trim();
    if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
      throw new Error(`Player name must be 1-${MAX_NAME_LENGTH} characters.`);
    }
    return { role, name, position: 0 };
  }

  private static formatChallenge(template: string, playerName: string, partnerName: string): string {
    return template.replaceAll("{player}", playerName).replaceAll("{partner}", partnerName);
  }
}
