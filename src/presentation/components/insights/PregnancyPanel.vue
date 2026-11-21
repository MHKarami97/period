<script setup lang="ts">
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useCycleStore } from "@application/stores/cycleStore";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { PregnancyCalculator } from "@domain/health/PregnancyProgress";
import { CyclePredictionService } from "@domain/services/CyclePredictionService";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useJalali } from "@presentation/composables/useJalali";

const hamdelStore = useHamdelStore();
const cycleStore = useCycleStore();
const { toJalaliLabel } = useJalali();

onMounted(() => void hamdelStore.ensureLoaded());

const fa = (value: number): string => value.toLocaleString("fa-IR");

const active = computed(() => hamdelStore.entriesOf("pregnancy").find((entry) => entry.valueOf("status") === "active") ?? null);

const progress = computed(() => {
  const entry = active.value;
  if (!entry || entry.valueOf("kind") !== "pregnant" || !entry.valueOf("lmp")) return null;
  return PregnancyCalculator.fromLastPeriod(DateOnly.fromIsoString(entry.valueOf("lmp")), DateOnly.today());
});

const fertile = computed(() => {
  if (active.value?.valueOf("kind") !== "ttc" || !cycleStore.hasHistory) return null;
  const prediction = CyclePredictionService.predictNextCycle(cycleStore.sortedCycles);
  return {
    start: toJalaliLabel(prediction.fertileWindowStart, "d MMMM"),
    end: toJalaliLabel(prediction.fertileWindowEnd, "d MMMM"),
    ovulation: toJalaliLabel(prediction.ovulationDate, "d MMMM"),
  };
});

const TRIMESTER_LABELS: Readonly<Record<1 | 2 | 3, string>> = { 1: "سه‌ماهه‌ی اول", 2: "سه‌ماهه‌ی دوم", 3: "سه‌ماهه‌ی سوم" };
</script>

<template>
  <div class="flex flex-col gap-4">
    <section v-if="progress" class="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 p-5 text-white shadow-md dark:from-rose-700 dark:to-fuchsia-800">
      <p class="text-xs font-bold text-white/80">{{ TRIMESTER_LABELS[progress.trimester] }}</p>
      <h2 class="text-2xl font-extrabold">هفته‌ی {{ fa(progress.weeks) }} و {{ fa(progress.extraDays) }} روز</h2>
      <div class="h-2 overflow-hidden rounded-full bg-black/20" role="progressbar" :aria-valuenow="progress.percent" aria-valuemin="0" aria-valuemax="100">
        <div class="h-full rounded-full bg-white/90" :style="{ width: `${progress.percent}%` }"></div>
      </div>
      <p class="text-sm leading-6 text-white/90">
        تاریخ تقریبی زایمان: {{ toJalaliLabel(progress.dueDate) }}
        <template v-if="progress.isOverdue"> — از موعد تقریبی گذشته؛ با مراقب سلامت خود در تماس باشید.</template>
        <template v-else> — {{ fa(progress.daysLeft) }} روز دیگر</template>
      </p>
      <p class="text-[11px] leading-5 text-white/75">محاسبه با قاعده‌ی نِگِله (اولین روز آخرین پریود + ۲۸۰ روز) است و تقریبی است؛ تاریخ دقیق را سونوگرافی و پزشک تعیین می‌کنند.</p>
    </section>

    <section v-else-if="fertile" class="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">برنامه‌ریزی بارداری</h2>
      <p class="text-sm leading-6 text-slate-700 dark:text-slate-200">بازه‌ی باروری پیش‌بینی‌شده: {{ fertile.start }} تا {{ fertile.end }} (تخمک‌گذاری برآوردی {{ fertile.ovulation }}).</p>
      <p class="text-[11px] leading-5 text-slate-400 dark:text-slate-500">پیش‌بینی تخمینی است؛ اگر پس از یک سال تلاش (یا ۶ ماه بالای ۳۵ سال) نتیجه نگرفتید با پزشک مشورت کنید.</p>
    </section>

    <section v-else class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">بارداری</h2>
      <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">برای فعال شدن شمارش هفته‌ها، یک مورد «باردار هستم» یا «در حال برنامه‌ریزی» با تاریخ اولین روز آخرین پریود ثبت کنید.</p>
    </section>

    <section class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <RouterLink :to="{ name: 'hamdel-section', params: { section: 'pregnancy' } }" class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-rose-300 active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800">
        <span class="text-2xl" aria-hidden="true">🤰</span>
        <span class="text-sm font-bold text-slate-800 dark:text-slate-100">ثبت یا ویرایش بارداری</span>
      </RouterLink>
      <RouterLink :to="{ name: 'hamdel-section', params: { section: 'fetalMovement' } }" class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-rose-300 active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800">
        <span class="text-2xl" aria-hidden="true">👶</span>
        <span class="text-sm font-bold text-slate-800 dark:text-slate-100">شمارش حرکات جنین</span>
      </RouterLink>
      <RouterLink :to="{ name: 'hamyar-guide', params: { guideId: 'motherhood' } }" class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-rose-300 active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800 sm:col-span-2">
        <span class="text-2xl" aria-hidden="true">🌸</span>
        <span class="text-sm font-bold text-slate-800 dark:text-slate-100">راهنمای «مادر شدن» در همیار</span>
      </RouterLink>
    </section>
  </div>
</template>
