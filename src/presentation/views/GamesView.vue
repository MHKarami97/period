<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAccessStore } from "@application/stores/accessStore";
import { GameVisibilityPolicy } from "@domain/games/GameVisibilityPolicy";
import GameCard from "@presentation/components/games/GameCard.vue";
import DailyChallengesSection from "@presentation/components/games/DailyChallengesSection.vue";
import { GAME_CATALOG, type GameDefinition } from "@presentation/games/gameCatalog";

const router = useRouter();
const accessStore = useAccessStore();

const visibleGames = computed(() =>
  GAME_CATALOG.filter(
    (game) => game.id !== "daily-challenges" && GameVisibilityPolicy.isVisible(game.id, accessStore.isUnlocked),
  ),
);

function openGame(game: GameDefinition): void {
  void router.push({ name: game.routeName });
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-8">
    <!-- 1. Daily & Weekly Couple Challenges Section -->
    <DailyChallengesSection />

    <!-- 2. Other Couple Games -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <span class="text-xl">🎲</span>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">
          بازی‌های تعاملی دونفره
        </h2>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <GameCard v-for="game in visibleGames" :key="game.id" :game="game" @open="openGame" />
      </div>
    </div>
  </div>
</template>
