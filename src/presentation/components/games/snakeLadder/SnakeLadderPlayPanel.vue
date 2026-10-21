<script setup lang="ts">
import { computed, ref } from "vue";
import { useSnakeLadderStore } from "@application/stores/snakeLadderStore";
import type { TurnResult } from "@domain/games/snakeLadder/SnakeLadderGame";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";
import GameModal from "@presentation/components/games/GameModal.vue";
import PlayerPawn from "./PlayerPawn.vue";
import SnakeLadderBoardGrid from "./SnakeLadderBoardGrid.vue";
import type { BoardToken } from "./boardToken";

const store = useSnakeLadderStore();
const isQuitConfirmOpen = ref(false);

const tokens = computed<BoardToken[]>(() =>
  store.displayedPlayers.map((player) => ({ role: player.role, position: player.position })),
);

const statusText = computed(() => {
  if (store.isAnimating && store.currentPlayer && store.rolledDice !== null) {
    return `${store.currentPlayer.name}: تاس ${store.rolledDice} 🎲 …`;
  }
  return store.lastTurn ? describeTurn(store.lastTurn) : null;
});

function describeTurn(turn: TurnResult): string {
  const base = `${turn.playerName}: تاس ${turn.dice} → خانه ${turn.landedCell}`;
  if (!turn.jump) return base;
  return turn.jump.kind === "snake"
    ? `${base} - 🐍 مار! برگشت به خانه ${turn.jump.to}`
    : `${base} - 🪜 نردبان! رفت به خانه ${turn.jump.to}`;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div v-if="store.currentPlayer" class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          <PlayerPawn :role="store.currentPlayer.role" class="h-8" />
          نوبت {{ store.currentPlayer.name }}
        </div>
        <div class="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span v-for="player in store.displayedPlayers" :key="player.role" class="flex items-center gap-1">
            {{ player.name }}: {{ player.position || "شروع" }}
          </span>
        </div>
      </div>

      <button
        type="button"
        class="w-full rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!store.canRoll"
        @click="store.rollDice()"
      >
        {{ store.isAnimating ? "در حال حرکت…" : "🎲 انداختن تاس" }}
      </button>

      <p v-if="statusText" class="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">{{ statusText }}</p>
    </section>

    <SnakeLadderBoardGrid :board="store.board" :tokens="tokens" />

    <button
      type="button"
      class="mx-auto rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
      @click="isQuitConfirmOpen = true"
    >
      خروج از بازی و بازگشت به تنظیمات
    </button>

    <ConfirmDialog
      v-model="isQuitConfirmOpen"
      title="خروج از بازی؟"
      message="پیشرفت بازی فعلی از بین می‌رود، ولی تنظیمات تخته حفظ می‌شود."
      confirm-label="خروج"
      @confirm="store.quitGame()"
    />

    <GameModal
      v-if="store.pendingChallenge"
      :title="`🔥 چالش ${store.pendingChallenge.playerName}`"
      :message="store.pendingChallenge.challengeText ?? ''"
      primary-label="انجام شد"
      secondary-label="رد کردن"
      @primary="store.acknowledgeChallenge()"
      @secondary="store.acknowledgeChallenge()"
    />

    <GameModal
      v-if="store.winner"
      :title="`🏆 ${store.winner.name} برنده شد`"
      message="به خانه ۱۰۰ رسید. برنده‌ی واقعی هر دوی شما هستید؛ بازی دوباره؟"
      primary-label="بازی دوباره"
      secondary-label="بازگشت به تنظیمات"
      @primary="store.startGame()"
      @secondary="store.quitGame()"
    />
  </div>
</template>
