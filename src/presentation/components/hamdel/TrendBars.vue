<script setup lang="ts">
import { computed } from "vue";
import type { TrendPoint } from "@domain/hamdel/hamdelStats";

const props = defineProps<{ points: readonly TrendPoint[] }>();

const MIN_BAR_PERCENT = 4;
const maxValue = computed(() => Math.max(1, ...props.points.flatMap((point) => [point.happiness, point.sadness])));
const formatNumber = (value: number): string => value.toLocaleString("fa-IR");

function heightOf(value: number): string {
  return value === 0 ? "0%" : `${Math.max(MIN_BAR_PERCENT, (value / maxValue.value) * 100)}%`;
}

const summary = computed(() =>
  props.points.map((point) => `${point.label}: ${formatNumber(point.happiness)} خوشحالی، ${formatNumber(point.sadness)} ناراحتی`).join("؛ "),
);
</script>

<template>
  <figure class="flex flex-col gap-2" role="img" :aria-label="summary">
    <div class="flex h-36 items-end gap-2">
      <div v-for="point in points" :key="point.key" class="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
        <div class="flex h-full w-full items-end justify-center gap-1" dir="ltr">
          <div class="flex h-full w-1/2 max-w-4 flex-col items-center justify-end">
            <span class="text-[10px] text-emerald-700 dark:text-emerald-300">{{ point.happiness || "" }}</span>
            <div class="w-full rounded-t bg-emerald-400" :style="{ height: heightOf(point.happiness) }" />
          </div>
          <div class="flex h-full w-1/2 max-w-4 flex-col items-center justify-end">
            <span class="text-[10px] text-rose-700 dark:text-rose-300">{{ point.sadness || "" }}</span>
            <div class="w-full rounded-t bg-rose-400" :style="{ height: heightOf(point.sadness) }" />
          </div>
        </div>
        <span class="w-full truncate text-center text-[10px] text-slate-500 dark:text-slate-400">{{ point.label }}</span>
      </div>
    </div>
    <figcaption class="flex justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
      <span class="flex items-center gap-1"><span class="h-2 w-2 rounded-sm bg-emerald-400" />خوشحالی</span>
      <span class="flex items-center gap-1"><span class="h-2 w-2 rounded-sm bg-rose-400" />ناراحتی</span>
    </figcaption>
  </figure>
</template>
