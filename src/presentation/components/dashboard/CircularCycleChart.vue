<script setup lang="ts">
import { computed } from "vue";

/**
 * CircularCycleChart - pure presentational component (dumb component).
 * Renders an SVG ring showing progress through the current cycle. Holds
 * no business logic; all numbers arrive pre-computed via props.
 */
const props = defineProps<{
  currentDay: number;
  cycleLength: number;
  progressRatio: number;
  phaseLabel: string;
  daysUntilNextPeriod: number | null;
  accentClass: string;
}>();

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const dashOffset = computed(() => CIRCUMFERENCE * (1 - props.progressRatio));
</script>

<template>
  <div class="relative flex aspect-square w-full max-w-xs items-center justify-center sm:max-w-sm">
    <svg viewBox="0 0 200 200" class="h-full w-full -rotate-90">
      <circle cx="100" cy="100" :r="RADIUS" fill="none" stroke-width="14" class="stroke-slate-800" />
      <circle
        cx="100"
        cy="100"
        :r="RADIUS"
        fill="none"
        stroke-width="14"
        stroke-linecap="round"
        :class="accentClass"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashOffset"
        style="transition: stroke-dashoffset 0.5s ease"
      />
    </svg>
    <div class="absolute flex flex-col items-center gap-1 text-center">
      <span class="text-4xl font-bold text-slate-50">{{ currentDay }}</span>
      <span class="text-xs text-slate-400">از {{ cycleLength }} روز چرخه</span>
      <span class="mt-2 rounded-full bg-slate-800 px-3 py-1 text-sm" :class="accentClass">{{ phaseLabel }}</span>
      <span v-if="daysUntilNextPeriod !== null" class="mt-1 text-xs text-slate-400">
        {{ daysUntilNextPeriod > 0 ? `${daysUntilNextPeriod} روز تا پریود بعدی` : "پریود امروز پیش‌بینی شده" }}
      </span>
    </div>
  </div>
</template>
