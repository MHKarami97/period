<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAccessStore } from "@application/stores/accessStore";
import { GAME_CATALOG, type GameDefinition } from "@presentation/games/gameCatalog";
import GameCard from "@presentation/components/games/GameCard.vue";
import AccessGate from "@presentation/components/shared/AccessGate.vue";

const router = useRouter();
const accessStore = useAccessStore();

function openGame(game: GameDefinition): void {
  void router.push({ name: game.routeName });
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">بازی‌ها</h1>

    <AccessGate v-if="!accessStore.isUnlocked" message="برای دیدن بازی‌ها، رمز را وارد کنید." />

    <template v-else>
      <div class="flex justify-end">
        <button
          type="button"
          class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          @click="accessStore.lock()"
        >
          قفل کردن (فراموش کردن رمز)
        </button>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <GameCard v-for="game in GAME_CATALOG" :key="game.id" :game="game" @open="openGame" />
      </div>
    </template>
  </div>
</template>
