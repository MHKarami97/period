import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { SnakeLadderBoard } from "@domain/games/snakeLadder/SnakeLadderBoard";
import {
  DEFAULT_GENERATION_OPTIONS,
  normalizeGenerationOptions,
  SnakeLadderBoardGenerator,
  type BoardGenerationOptions,
} from "@domain/games/snakeLadder/SnakeLadderBoardGenerator";
import { PlayerRole, SnakeLadderGame, type PlayerState, type TurnResult } from "@domain/games/snakeLadder/SnakeLadderGame";
import { LocalStorageSnakeLadderSettingsRepository } from "@infrastructure/repositories/LocalStorageSnakeLadderSettingsRepository";
import { createSnakeLadderGenerationOptionsRepository } from "@infrastructure/repositories/snakeLadderGenerationOptionsRepository";
import { useCouplePlayersStore } from "./couplePlayersStore";
import { MathRandomSource } from "@infrastructure/random/MathRandomSource";

const settingsRepository = new LocalStorageSnakeLadderSettingsRepository();
const generationOptionsRepository = createSnakeLadderGenerationOptionsRepository();
const randomSource = new MathRandomSource();
const boardGenerator = new SnakeLadderBoardGenerator(randomSource);

const STEP_DELAY_MS = 260;
const JUMP_PAUSE_MS = 500;
const SETTLE_DELAY_MS = 350;

type PawnPositions = Readonly<Record<PlayerRole, number>>;

const START_POSITIONS: PawnPositions = { [PlayerRole.Woman]: 0, [PlayerRole.Man]: 0 };

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

/**
 * snakeLadderStore - Application Service orchestrating the board editor,
 * saved settings and the live game. Pinia SETUP store with shallowRef for the
 * same reason documented in cycleStore: domain objects are immutable class
 * instances with private fields and must not be deep-proxied by Vue.
 *
 * Player names live in couplePlayersStore (shared with the other two-player
 * games, persisted on every keystroke); generation counts are persisted on
 * every change. The board layout itself is saved only on request.
 *
 * The domain resolves a whole turn instantly; this store only replays it as a
 * cell-by-cell walk (`pawnPositions`) and reveals the outcome (snake/ladder
 * text, challenge, winner) once the pawn has arrived.
 */
export const useSnakeLadderStore = defineStore("snakeLadder", () => {
  const couple = useCouplePlayersStore();
  const board = shallowRef<SnakeLadderBoard>(SnakeLadderBoard.empty());
  const generationOptions = shallowRef<BoardGenerationOptions>(
    generationOptionsRepository.load() ?? DEFAULT_GENERATION_OPTIONS,
  );
  const womanName = computed({
    get: () => couple.womanName,
    set: (name: string) => couple.setWomanName(name),
  });
  const manName = computed({
    get: () => couple.manName,
    set: (name: string) => couple.setManName(name),
  });
  const hasSavedSettings = ref(false);
  const isInitialized = ref(false);

  const game = shallowRef<SnakeLadderGame | null>(null);
  const lastTurn = shallowRef<TurnResult | null>(null);
  const pendingChallenge = shallowRef<TurnResult | null>(null);
  const pawnPositions = shallowRef<PawnPositions>(START_POSITIONS);
  const actingRole = shallowRef<PlayerRole | null>(null);
  const rolledDice = ref<number | null>(null);
  const isAnimating = ref(false);
  let playbackId = 0;

  const isPlaying = computed(() => game.value !== null);
  const winner = computed(() => (isAnimating.value ? null : (game.value?.winner ?? null)));
  const players = computed(() => game.value?.playerStates ?? []);
  const displayedPlayers = computed<PlayerState[]>(() =>
    players.value.map((player) => ({ ...player, position: pawnPositions.value[player.role] })),
  );
  const currentPlayer = computed(() => {
    const current = game.value?.currentPlayer ?? null;
    if (actingRole.value === null) {
      return current;
    }
    return players.value.find((player) => player.role === actingRole.value) ?? current;
  });
  const canStart = computed(() => womanName.value.trim().length > 0 && manName.value.trim().length > 0);
  const canRoll = computed(
    () => isPlaying.value && !isAnimating.value && winner.value === null && pendingChallenge.value === null,
  );

  function initialize(): void {
    if (isInitialized.value) {
      return;
    }
    const saved = settingsRepository.load();
    if (saved) {
      board.value = saved.board;
      adoptLegacyNames(saved.womanName, saved.manName);
    } else {
      board.value = boardGenerator.generate(generationOptions.value);
    }
    hasSavedSettings.value = saved !== null;
    isInitialized.value = true;
  }

  /** Names saved by older versions inside the game settings are moved to the shared store once. */
  function adoptLegacyNames(legacyWoman: string, legacyMan: string): void {
    if (womanName.value.trim().length === 0 && legacyWoman.length > 0) {
      womanName.value = legacyWoman;
    }
    if (manName.value.trim().length === 0 && legacyMan.length > 0) {
      manName.value = legacyMan;
    }
  }

  function setGenerationOption(key: keyof BoardGenerationOptions, value: number): void {
    generationOptions.value = normalizeGenerationOptions({ ...generationOptions.value, [key]: value });
    generationOptionsRepository.save(generationOptions.value);
  }

  function regenerateBoard(): void {
    board.value = boardGenerator.generate(generationOptions.value);
  }

  function setChallenge(cell: number, text: string): void {
    board.value = board.value.withChallenge(cell, text);
  }

  function setSnake(from: number, to: number): void {
    board.value = board.value.withSnake(from, to);
  }

  function setLadder(from: number, to: number): void {
    board.value = board.value.withLadder(from, to);
  }

  function clearCell(cell: number): void {
    board.value = board.value.withClearedCell(cell);
  }

  function saveSettings(): void {
    settingsRepository.save({ board: board.value, womanName: womanName.value.trim(), manName: manName.value.trim() });
    hasSavedSettings.value = true;
  }

  /** @returns false when nothing (valid) is saved. */
  function restoreSavedSettings(): boolean {
    const saved = settingsRepository.load();
    if (!saved) {
      hasSavedSettings.value = false;
      return false;
    }
    board.value = saved.board;
    return true;
  }

  function resetPlayback(): void {
    playbackId += 1;
    isAnimating.value = false;
    actingRole.value = null;
    rolledDice.value = null;
    pawnPositions.value = START_POSITIONS;
    lastTurn.value = null;
    pendingChallenge.value = null;
  }

  function startGame(): void {
    if (!canStart.value) {
      throw new Error("Both player names are required.");
    }
    resetPlayback();
    game.value = SnakeLadderGame.start({
      board: board.value,
      womanName: womanName.value,
      manName: manName.value,
      firstRole: randomSource.nextInt(0, 1) === 0 ? PlayerRole.Woman : PlayerRole.Man,
    });
  }

  function movePawn(role: PlayerRole, cell: number): void {
    pawnPositions.value = { ...pawnPositions.value, [role]: cell };
  }

  /** @returns false when the playback was cancelled (quit / restart) midway. */
  async function playTurn(result: TurnResult, id: number): Promise<boolean> {
    for (const cell of result.path) {
      movePawn(result.role, cell);
      await sleep(STEP_DELAY_MS);
      if (id !== playbackId) {
        return false;
      }
    }
    if (result.jump) {
      await sleep(JUMP_PAUSE_MS);
      if (id !== playbackId) {
        return false;
      }
      movePawn(result.role, result.jump.to);
      await sleep(SETTLE_DELAY_MS);
    }
    return id === playbackId;
  }

  async function rollDice(): Promise<void> {
    if (!game.value || !canRoll.value) {
      return;
    }
    const outcome = game.value.roll(game.value.pickDice(randomSource));
    const id = playbackId;

    actingRole.value = outcome.result.role;
    rolledDice.value = outcome.result.dice;
    isAnimating.value = true;
    game.value = outcome.game;

    const completed = await playTurn(outcome.result, id);
    if (!completed) {
      return;
    }
    isAnimating.value = false;
    actingRole.value = null;
    lastTurn.value = outcome.result;
    pendingChallenge.value = outcome.result.challengeText ? outcome.result : null;
  }

  function acknowledgeChallenge(): void {
    pendingChallenge.value = null;
  }

  function quitGame(): void {
    resetPlayback();
    game.value = null;
  }

  return {
    board,
    generationOptions,
    womanName,
    manName,
    hasSavedSettings,
    game,
    lastTurn,
    pendingChallenge,
    rolledDice,
    isAnimating,
    isPlaying,
    winner,
    currentPlayer,
    players,
    displayedPlayers,
    canStart,
    canRoll,
    initialize,
    setGenerationOption,
    regenerateBoard,
    setChallenge,
    setSnake,
    setLadder,
    clearCell,
    saveSettings,
    restoreSavedSettings,
    startGame,
    rollDice,
    acknowledgeChallenge,
    quitGame,
  };
});
