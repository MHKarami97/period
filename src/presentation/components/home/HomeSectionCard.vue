<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, type RouteLocationRaw } from "vue-router";

type CardTone = "rose" | "teal" | "amber" | "violet" | "sky";

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    icon: string;
    tone: CardTone;
    to: RouteLocationRaw;
    ctaLabel: string;
    progress?: number | null;
    progressLabel?: string;
  }>(),
  { progress: null, progressLabel: "" },
);

interface ToneStyle {
  readonly chip: string;
  readonly bar: string;
  readonly cta: string;
}

const TONES: Readonly<Record<CardTone, ToneStyle>> = {
  rose: { chip: "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300", bar: "bg-rose-500 dark:bg-rose-400", cta: "bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500" },
  teal: { chip: "bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:bg-teal-500/20 dark:text-teal-300", bar: "bg-teal-500 dark:bg-teal-400", cta: "bg-teal-600 text-white hover:bg-teal-700 dark:hover:bg-teal-500" },
  amber: { chip: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300", bar: "bg-amber-500 dark:bg-amber-400", cta: "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500" },
  violet: { chip: "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:bg-violet-500/20 dark:text-violet-300", bar: "bg-violet-500 dark:bg-violet-400", cta: "bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500" },
  sky: { chip: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:bg-sky-500/20 dark:text-sky-300", bar: "bg-sky-500 dark:bg-sky-400", cta: "bg-sky-600 text-white hover:bg-sky-700 dark:hover:bg-sky-500" },
};

const style = computed(() => TONES[props.tone]);
const progressWidth = computed(() => `${Math.min(100, Math.max(0, props.progress ?? 0))}%`);
</script>

<template>
  <article class="flex h-full flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-5">
    <header class="flex items-center gap-3">
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ring-1" :class="style.chip" aria-hidden="true">{{ icon }}</span>
      <div class="min-w-0">
        <h2 class="truncate text-base font-bold text-slate-900 dark:text-slate-100">{{ title }}</h2>
        <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
      </div>
    </header>

    <div v-if="progress !== null" class="flex flex-col gap-1.5">
      <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
        <div class="h-full rounded-full transition-[width] duration-500" :class="style.bar" :style="{ width: progressWidth }"></div>
      </div>
      <p v-if="progressLabel" class="text-xs text-slate-500 dark:text-slate-400">{{ progressLabel }}</p>
    </div>

    <div class="flex flex-1 flex-col gap-3">
      <slot />
    </div>

    <RouterLink :to="to" class="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold shadow-xs transition active:scale-95" :class="style.cta">
      {{ ctaLabel }} <span aria-hidden="true">←</span>
    </RouterLink>
  </article>
</template>
