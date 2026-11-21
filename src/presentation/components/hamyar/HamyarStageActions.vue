<script setup lang="ts">
import { useHamyarStore } from "@application/stores/hamyarStore";

defineProps<{
  guideId: string;
  stageId: number;
}>();

const hamyarStore = useHamyarStore();
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      type="button"
      :aria-pressed="hamyarStore.isStageRead(guideId, stageId)"
      class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95"
      :class="hamyarStore.isStageRead(guideId, stageId) ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
      @click="hamyarStore.toggleStageRead(guideId, stageId)"
    >
      <span aria-hidden="true">{{ hamyarStore.isStageRead(guideId, stageId) ? "✓" : "○" }}</span>
      {{ hamyarStore.isStageRead(guideId, stageId) ? "خوانده شد" : "علامت‌گذاری به‌عنوان خوانده‌شده" }}
    </button>
    <button
      type="button"
      :aria-pressed="hamyarStore.isBookmarked(guideId, stageId)"
      class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95"
      :class="hamyarStore.isBookmarked(guideId, stageId) ? 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
      @click="hamyarStore.toggleBookmark(guideId, stageId)"
    >
      <span aria-hidden="true">🔖</span>
      {{ hamyarStore.isBookmarked(guideId, stageId) ? "در نشانک‌ها" : "نشانک" }}
    </button>
  </div>
</template>
