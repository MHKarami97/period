<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useSnakeLadderStore } from "@application/stores/snakeLadderStore";
import SnakeLadderPlayPanel from "@presentation/components/games/snakeLadder/SnakeLadderPlayPanel.vue";
import SnakeLadderSetupPanel from "@presentation/components/games/snakeLadder/SnakeLadderSetupPanel.vue";

const store = useSnakeLadderStore();
store.initialize();
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">🐍 مار و پله زناشویی</h1>
      <RouterLink
        :to="{ name: 'games' }"
        class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        → بازی‌ها
      </RouterLink>
    </div>

    <SnakeLadderPlayPanel v-if="store.isPlaying" />
    <SnakeLadderSetupPanel v-else />
  </div>
</template>
