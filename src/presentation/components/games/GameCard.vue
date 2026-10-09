<script setup lang="ts">
import type { GameDefinition } from "@presentation/games/gameCatalog";

defineProps<{ game: GameDefinition }>();
const emit = defineEmits<{ (event: "open", game: GameDefinition): void }>();
</script>

<template>
  <button
    type="button"
    class="flex w-full items-start gap-4 rounded-2xl bg-white p-5 text-right shadow-sm ring-1 ring-slate-200 transition hover:ring-rose-300 active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-rose-400/60"
    @click="emit('open', game)"
  >
    <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-2xl dark:bg-rose-500/20">
      {{ game.icon }}
    </span>
    <span class="flex flex-col gap-1">
      <span class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ game.title }}</span>
      <span class="text-sm leading-6 text-slate-500 dark:text-slate-400">{{ game.description }}</span>
    </span>
  </button>
</template>
