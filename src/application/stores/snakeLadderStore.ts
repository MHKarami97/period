import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { SnakeLadderBoard } from "@domain/games/snakeLadder/SnakeLadderBoard";
import { SnakeLadderBoardGenerator } from "@domain/games/snakeLadder/SnakeLadderBoardGenerator";
import { PlayerRole, SnakeLadderGame, type TurnResult } from "@domain/games/snakeLadder/SnakeLadderGame";
import { LocalStorageSnakeLadderSettingsRepository } from "@infrastructure/repositories/LocalStorageSnakeLadderSettingsRepository";
import { MathRandomSource } from "@infrastructure/random/MathRandomSource";

const settingsRepository = new LocalStorageSnakeLadderSettingsRepository();
const randomSource = new MathRandomSource();
const boardGenerator = new SnakeLadderBoardGenerator(randomSource);

const DICE_MIN = 1;
const DICE_MAX = 6;

/**
 * snakeLadderStore - Application Service orchestrating the board editor,
 * saved settings and the live game. Pinia SETUP store with shallowRef for the
 * same reason documented in cycleStore: domain objects are immutable class
 * instances with private fields and must not be deep-proxied by Vue.
 */
export const useSnakeLadderStore = defineStore("snakeLadder", () => {
  const board = shallowRef<SnakeLadderBoard>(SnakeLadderBoard.empty());
  const womanName = ref("");
  const manName = ref("");
  const hasSavedSettings = ref(false);
  const isInitialized = ref(false);

  const game = shallowRef<SnakeLadderGame | null>(null);
  const lastTurn = shallowRef<TurnResult | null>(null);
  const pendingChallenge = shallowRef<TurnResult | null>(null);

  const isPlaying = computed(() => game.value !== null);
  const winner = computed(() => game.value?.winner ?? null);
  const currentPlayer = computed(() => game.value?.currentPlayer ?? null);
  const players = computed(() => game.value?.playerStates ?? []);
  const canStart = computed(() => womanName.value.trim().length > 0 && manName.value.trim().length > 0);
  const canRoll = computed(() => isPlaying.value && winner.value === null && pendingChallenge.value === null);

  function initialize(): void {
    if (isInitialized.value) {
      return;
    }
    const saved = settingsRepository.load();
    if (saved) {
      board.value = saved.board;
      womanName.value = saved.womanName;
      manName.value = saved.manName;
    } else {
      board.value = boardGenerator.generate();
    }
    hasSavedSettings.value = saved !== null;
    isInitialized.value = true;
  }

  function regenerateBoard(): void {
    board.value = boardGenerator.generate();
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
    womanName.value = saved.womanName;
    manName.value = saved.manName;
    return true;
  }

  function startGame(): void {
    if (!canStart.value) {
      throw new Error("Both player names are required.");
    }
    game.value = SnakeLadderGame.start({
      board: board.value,
      womanName: womanName.value,
      manName: manName.value,
      firstRole: randomSource.nextInt(0, 1) === 0 ? PlayerRole.Woman : PlayerRole.Man,
    });
    lastTurn.value = null;
    pendingChallenge.value = null;
  }

  function rollDice(): void {
    if (!game.value || !canRoll.value) {
      return;
    }
    const outcome = game.value.roll(randomSource.nextInt(DICE_MIN, DICE_MAX));
    game.value = outcome.game;
    lastTurn.value = outcome.result;
    pendingChallenge.value = outcome.result.challengeText ? outcome.result : null;
  }

  function acknowledgeChallenge(): void {
    pendingChallenge.value = null;
  }

  function quitGame(): void {
    game.value = null;
    lastTurn.value = null;
    pendingChallenge.value = null;
  }

  return {
    board,
    womanName,
    manName,
    hasSavedSettings,
    game,
    lastTurn,
    pendingChallenge,
    isPlaying,
    winner,
    currentPlayer,
    players,
    canStart,
    canRoll,
    initialize,
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
