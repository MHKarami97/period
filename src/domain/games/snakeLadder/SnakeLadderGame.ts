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
  landedCell: number;
  finalCell: number;
  jump: { kind: "snake" | "ladder"; from: number; to: number } | null;
  /** Challenge text with {player}/{partner} already replaced by real names. */
  challengeText: string | null;
  hasWon: boolean;
}

export interface TurnOutcome {
  game: SnakeLadderGame;
  result: TurnResult;
}

const MIN_DICE = 1;
const MAX_DICE = 6;
const MAX_NAME_LENGTH = 30;

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

  public roll(dice: number): TurnOutcome {
    if (this.isFinished) {
      throw new Error("The game is already finished.");
    }
    if (!Number.isInteger(dice) || dice < MIN_DICE || dice > MAX_DICE) {
      throw new RangeError("Dice value must be an integer between 1 and 6.");
    }

    const player = this.currentPlayer;
    const opponent = this.players[this.turnIndex === 0 ? 1 : 0];

    const landedCell = Math.min(player.position + dice, BOARD_SIZE);
    const hasWon = landedCell === BOARD_SIZE;
    const jumpTarget = hasWon ? null : this.board.jumpTarget(landedCell);
    const finalCell = jumpTarget ?? landedCell;

    const template = hasWon ? null : this.board.challengeAt(finalCell);
    const challengeText = template ? SnakeLadderGame.formatChallenge(template, player.name, opponent.name) : null;

    const moved: PlayerState = { ...player, position: finalCell };
    const nextPlayers: [PlayerState, PlayerState] =
      this.turnIndex === 0 ? [moved, this.players[1]] : [this.players[0], moved];
    const nextTurn: 0 | 1 = hasWon ? this.turnIndex : this.turnIndex === 0 ? 1 : 0;

    const result: TurnResult = {
      role: player.role,
      playerName: player.name,
      dice,
      landedCell,
      finalCell,
      jump:
        jumpTarget === null
          ? null
          : { kind: this.board.kindOf(landedCell) === "snake" ? "snake" : "ladder", from: landedCell, to: jumpTarget },
      challengeText,
      hasWon,
    };

    return {
      game: new SnakeLadderGame(this.board, nextPlayers, nextTurn, hasWon ? player.role : null),
      result,
    };
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
