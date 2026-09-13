<script setup lang="ts">
import { computed, ref } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useCycleStore } from "@application/stores/cycleStore";
import { useJalali } from "@presentation/composables/useJalali";

/**
 * JalaliCalendarGrid - month grid distinguishing:
 *  - past logged period days (rose fill)
 *  - predicted next period window (rose outline)
 *  - predicted fertile / ovulation window (lavender fill)
 *  - today (ring)
 */
const cycleStore = useCycleStore();
const { toJalaliLabel, monthTitle, nextMonth, previousMonth, buildMonthGrid, isSameJalaliMonth } = useJalali();

const monthAnchor = ref(new Date());
const gridDays = computed(() => buildMonthGrid(monthAnchor.value));
const today = DateOnly.today();

function isLoggedPeriodDay(day: DateOnly): boolean {
  return cycleStore.sortedCycles.some((cycle) => {
    const end = cycle.endDate ?? today;
    return day.isBetweenInclusive(cycle.startDate, end);
  });
}

function isPredictedPeriodDay(day: DateOnly): boolean {
  const prediction = cycleStore.prediction;
  if (!prediction) return false;
  return day.isBetweenInclusive(prediction.nextPeriodStartDate, prediction.nextPeriodEndDate);
}

function isFertileWindowDay(day: DateOnly): boolean {
  const prediction = cycleStore.prediction;
  if (!prediction) return false;
  return day.isBetweenInclusive(prediction.fertileWindowStart, prediction.fertileWindowEnd);
}

function dayClasses(day: DateOnly): string {
  const classes: string[] = ["relative flex h-10 items-center justify-center rounded-lg text-sm"];

  if (!isSameJalaliMonth(day, monthAnchor.value)) {
    classes.push("text-slate-600");
  } else {
    classes.push("text-slate-200");
  }

  if (isLoggedPeriodDay(day)) {
    classes.push("bg-rose-500/80 text-white");
  } else if (isPredictedPeriodDay(day)) {
    classes.push("ring-1 ring-rose-400/70 text-rose-300");
  } else if (isFertileWindowDay(day)) {
    classes.push("bg-violet-400/20 text-violet-200");
  }

  if (day.isSameDay(today)) {
    classes.push("ring-2 ring-teal-400");
  }

  return classes.join(" ");
}
</script>

<template>
  <div class="rounded-2xl bg-slate-900 p-4 shadow-sm ring-1 ring-slate-800">
    <div class="mb-3 flex items-center justify-between">
      <button type="button" class="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800" @click="monthAnchor = previousMonth(monthAnchor)">‹</button>
      <span class="font-medium text-slate-100">{{ monthTitle(monthAnchor) }}</span>
      <button type="button" class="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800" @click="monthAnchor = nextMonth(monthAnchor)">›</button>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div v-for="day in gridDays" :key="day.toIsoString()" :class="dayClasses(day)">
        {{ toJalaliLabel(day, "d") }}
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span> پریود ثبت‌شده</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full ring-1 ring-rose-400/70"></span> پریود پیش‌بینی‌شده</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-violet-400/40"></span> پنجره باروری</span>
    </div>
  </div>
</template>
