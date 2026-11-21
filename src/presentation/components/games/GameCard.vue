<script setup lang="ts">
import type { GameDefinition } from "@presentation/games/gameCatalog";
import AppIcon from "@presentation/components/common/AppIcon.vue";

defineProps<{ game: GameDefinition }>();
const emit = defineEmits<{ (event: "open", game: GameDefinition): void }>();

function getGameColorClass(id: string): { bg: string; text: string; glow: string; borderHover: string } {
  if (id === "daily-challenges") {
    return {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      glow: "hover:shadow-amber-500/10",
      borderHover: "hover:ring-amber-400 dark:hover:ring-amber-500",
    };
  }
  if (id === "truth-or-dare") {
    return {
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      text: "text-orange-600 dark:text-orange-400",
      glow: "hover:shadow-orange-500/10",
      borderHover: "hover:ring-orange-400 dark:hover:ring-orange-500",
    };
  }
  if (id === "snake-ladder") {
    return {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      glow: "hover:shadow-emerald-500/10",
      borderHover: "hover:ring-emerald-400 dark:hover:ring-emerald-500",
    };
  }
  if (id === "dual-dice") {
    return {
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      text: "text-indigo-600 dark:text-indigo-400",
      glow: "hover:shadow-indigo-500/10",
      borderHover: "hover:ring-indigo-400 dark:hover:ring-indigo-500",
    };
  }
  if (id === "conversation-cards") {
    return {
      bg: "bg-teal-500/10 dark:bg-teal-500/20",
      text: "text-teal-600 dark:text-teal-400",
      glow: "hover:shadow-teal-500/10",
      borderHover: "hover:ring-teal-400 dark:hover:ring-teal-500",
    };
  }
  return {
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    glow: "hover:shadow-rose-500/10",
    borderHover: "hover:ring-rose-400 dark:hover:ring-rose-500",
  };
}
</script>

<template>
  <button
    type="button"
    class="group relative flex w-full items-start gap-4 rounded-3xl bg-white p-5 text-right shadow-sm ring-1 ring-slate-200/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.985] dark:bg-slate-900 dark:ring-slate-800"
    :class="[getGameColorClass(game.id).borderHover, getGameColorClass(game.id).glow]"
    @click="emit('open', game)"
  >
    <!-- SVG Icon Container -->
    <span
      class="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-xs"
      :class="[getGameColorClass(game.id).bg, getGameColorClass(game.id).text]"
    >
      <AppIcon :name="game.id" size="lg" filled />
    </span>

    <!-- Content -->
    <span class="flex flex-1 flex-col gap-1.5 min-w-0">
      <span class="flex items-center justify-between gap-2">
        <span class="text-base font-bold text-slate-900 group-hover:text-teal-600 dark:text-slate-100 dark:group-hover:text-teal-400 transition-colors">
          {{ game.title }}
        </span>
        <span class="text-xs text-slate-300 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 group-hover:-translate-x-1">
          ←
        </span>
      </span>
      <span class="text-xs sm:text-sm leading-6 text-slate-500 dark:text-slate-400 line-clamp-2">
        {{ game.description }}
      </span>
    </span>
  </button>
</template>
