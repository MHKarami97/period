<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import type { CycleStatusSummary, CycleStatusTone } from "@domain/home/CycleStatusSummary";
import type { CareItem } from "@domain/home/PhaseCareAdvisor";

const props = defineProps<{
  greeting: string;
  careTarget: string | null;
  summary: CycleStatusSummary | null;
  tipHeading: string;
  tip: CareItem | null;
  needsSymptomLog: boolean;
}>();

const TONE_CLASSES: Readonly<Record<CycleStatusTone, string>> = {
  neutral: "from-slate-600 via-slate-700 to-slate-800",
  rose: "from-rose-500 via-rose-500 to-pink-600 dark:from-rose-600 dark:via-rose-700 dark:to-pink-800",
  violet: "from-violet-500 via-fuchsia-500 to-purple-600 dark:from-violet-600 dark:via-fuchsia-700 dark:to-purple-800",
  teal: "from-teal-500 via-emerald-500 to-teal-600 dark:from-teal-600 dark:via-emerald-700 dark:to-teal-800",
  amber: "from-amber-500 via-orange-500 to-rose-500 dark:from-amber-600 dark:via-orange-700 dark:to-rose-800",
};

const gradient = computed(() => TONE_CLASSES[props.summary?.tone ?? "neutral"]);
const progressPercent = computed(() => {
  const progress = props.summary?.progress;
  return progress ? Math.min(100, Math.round((progress.day / Math.max(progress.length, 1)) * 100)) : 0;
});
const fa = (value: number): string => value.toLocaleString("fa-IR");
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg ring-1 ring-black/5 dark:ring-white/10 sm:p-7" :class="gradient" aria-label="وضعیت امروز">
    <span class="pointer-events-none absolute -start-10 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" aria-hidden="true"></span>
    <span class="pointer-events-none absolute -bottom-16 -end-8 h-52 w-52 rounded-full bg-white/10 blur-3xl" aria-hidden="true"></span>

    <div class="relative flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-sm font-medium text-white/90">{{ greeting }} 👋</p>
        <div class="flex flex-wrap items-center gap-2">
          <span v-if="careTarget" class="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">🤍 در حال مراقبت از: {{ careTarget }}</span>
          <span v-if="summary?.phaseLabel" class="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">فاز {{ summary.phaseLabel }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <h1 class="text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">{{ summary?.headline ?? "ابتدا یک فرد را انتخاب کنید" }}</h1>
        <p class="text-sm leading-6 text-white/90 sm:text-base">
          {{ summary?.detail ?? "برای دیدن وضعیت و پیش‌بینی‌ها، از بالای صفحه فرد را اضافه یا انتخاب کنید." }}
        </p>
      </div>

      <div v-if="summary?.progress" class="flex flex-col gap-1.5">
        <div class="h-2 overflow-hidden rounded-full bg-black/20" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
          <div class="h-full rounded-full bg-white/90 transition-[width] duration-500" :style="{ width: `${progressPercent}%` }"></div>
        </div>
        <p class="text-[11px] text-white/80">روز {{ fa(summary.progress.day) }} از حدود {{ fa(summary.progress.length) }} روز چرخه</p>
      </div>

      <div v-if="tip" class="flex items-start gap-3 rounded-2xl bg-black/15 p-3.5 backdrop-blur-sm sm:p-4">
        <span class="text-xl leading-7" aria-hidden="true">{{ tip.icon }}</span>
        <div class="flex min-w-0 flex-col gap-0.5">
          <span class="text-xs font-bold text-white/80">{{ tipHeading }}</span>
          <p class="text-sm leading-6 sm:text-[15px]">{{ tip.text }}</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <RouterLink
          :to="{ name: 'companion' }"
          class="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-white/90 active:scale-95 dark:bg-white/20 dark:text-white dark:ring-1 dark:ring-white/40 dark:hover:bg-white/30"
        >
          رفتن به همراه <span aria-hidden="true">←</span>
        </RouterLink>
        <RouterLink
          v-if="needsSymptomLog"
          :to="{ name: 'companion', query: { tab: 'symptoms' } }"
          class="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-95 dark:bg-black/25 dark:hover:bg-black/35"
        >
          ثبت علائم امروز
        </RouterLink>
      </div>

      <p class="text-[11px] leading-5 text-white/75">پیش‌بینی‌ها تخمینی‌اند و جایگزین توصیه‌ی پزشک یا روش پیشگیری از بارداری نیستند.</p>
    </div>
  </section>
</template>
