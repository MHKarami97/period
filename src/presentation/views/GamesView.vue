<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAccessStore } from "@application/stores/accessStore";
import { GameVisibilityPolicy } from "@domain/games/GameVisibilityPolicy";
import GameCard from "@presentation/components/games/GameCard.vue";
import { GAME_CATALOG, type GameDefinition } from "@presentation/games/gameCatalog";

const router = useRouter();
const accessStore = useAccessStore();

const visibleGames = computed(() =>
  GAME_CATALOG.filter((game) => GameVisibilityPolicy.isVisible(game.id, accessStore.isUnlocked)),
);

function openGame(game: GameDefinition): void {
  void router.push({ name: game.routeName });
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">بازی‌ها</h1>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <GameCard v-for="game in visibleGames" :key="game.id" :game="game" @open="openGame" />
    </div>
  </div>
</template>
