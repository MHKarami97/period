<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import type { CycleStatusSummary, CycleStatusTone } from "@domain/home/CycleStatusSummary";

const props = defineProps<{
  greeting: string;
  summary: CycleStatusSummary | null;
  tipHeading: string;
  tip: string | null;
  needsSymptomLog: boolean;
}>();

const TONE_CLASSES: Readonly<Record<CycleStatusTone, string>> = {
  neutral: "from-slate-600 via-slate-700 to-slate-800",
  rose: "from-rose-500 via-rose-500 to-pink-600",
  violet: "from-violet-500 via-fuchsia-500 to-purple-600",
  teal: "from-teal-500 via-emerald-500 to-teal-600",
  amber: "from-amber-500 via-orange-500 to-rose-500",
};

const gradient = computed(() => TONE_CLASSES[props.summary?.tone ?? "neutral"]);
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg ring-1 ring-black/5 sm:p-7" :class="gradient" aria-label="وضعیت امروز">
    <span class="pointer-events-none absolute -start-10 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" aria-hidden="true"></span>
    <span class="pointer-events-none absolute -bottom-16 -end-8 h-52 w-52 rounded-full bg-white/10 blur-3xl" aria-hidden="true"></span>

    <div class="relative flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-white/85">{{ greeting }} 👋</p>
        <span v-if="summary?.phaseLabel" class="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">فاز {{ summary.phaseLabel }}</span>
      </div>

      <div class="flex flex-col gap-1.5">
        <h1 class="text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">{{ summary?.headline ?? "ابتدا یک فرد را انتخاب کنید" }}</h1>
        <p class="text-sm leading-6 text-white/90 sm:text-base">
          {{ summary?.detail ?? "برای دیدن وضعیت و پیش‌بینی‌ها، از بالای صفحه فرد را اضافه یا انتخاب کنید." }}
        </p>
      </div>

      <div v-if="tip" class="flex flex-col gap-1 rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm sm:p-4">
        <span class="text-xs font-bold text-white/80">{{ tipHeading }}</span>
        <p class="text-sm leading-6 sm:text-[15px]">{{ tip }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <RouterLink :to="{ name: 'companion' }" class="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-white/90 active:scale-95">
          رفتن به همراه <span aria-hidden="true">←</span>
        </RouterLink>
        <RouterLink v-if="needsSymptomLog" :to="{ name: 'companion', query: { tab: 'symptoms' } }" class="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-95">
          ثبت علائم امروز
        </RouterLink>
      </div>

      <p class="text-[11px] leading-5 text-white/70">پیش‌بینی‌ها تخمینی‌اند و جایگزین توصیه‌ی پزشک یا روش پیشگیری از بارداری نیستند.</p>
    </div>
  </section>
</template>
