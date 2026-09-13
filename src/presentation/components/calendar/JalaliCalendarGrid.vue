<script setup lang="ts">
import { computed, ref } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useCycleStore } from "@application/stores/cycleStore";
import { useJalali } from "@presentation/composables/useJalali";

/**
 * JalaliCalendarGrid - month grid distinguishing:
 *  - CURRENT ongoing period, confirmed days (startDate..today) — solid rose + ring
 *  - CURRENT ongoing period, expected remaining days (today+1..predicted end) — lighter rose
 *  - past logged/completed period days — solid rose fill
 *  - predicted next period window — rose outline
 *  - predicted fertile / ovulation window — lavender fill
 *  - today — teal ring
 */
const cycleStore = useCycleStore();
const { toJalaliLabel, monthTitle, nextMonth, previousMonth, buildMonthGrid, isSameJalaliMonth } = useJalali();

const monthAnchor = ref(new Date());
const gridDays = computed(() => buildMonthGrid(monthAnchor.value));
const today = DateOnly.today();

/**
 * While a period is ongoing, its end date is unknown, so a naive
 * "startDate..today" range would silently stop highlighting on the
 * calendar the moment "today" is reached — even though the period is
 * expected to continue. This computes the expected full range using the
 * same predicted period length (`predictedPeriodLengthInDays`) the WMA
 * prediction service already derives from historical cycles, so days
 * AFTER today that are still part of the expected period are highlighted
 * too (with a lighter, "not yet confirmed" style).
 */
const ongoingPeriodExpectedEnd = computed<DateOnly | null>(() => {
  const current = cycleStore.currentCycle;
  const prediction = cycleStore.prediction;
  if (!current || !current.isOngoing || !prediction) {
    return null;
  }
  const predictedEnd = current.startDate.addDays(prediction.predictedPeriodLengthInDays - 1);
  return predictedEnd.isBefore(today) ? today : predictedEnd;
});

function isConfirmedOngoingPeriodDay(day: DateOnly): boolean {
  const current = cycleStore.currentCycle;
  if (!current || !current.isOngoing) {
    return false;
  }
  return day.isBetweenInclusive(current.startDate, today);
}

function isExpectedRemainingOngoingPeriodDay(day: DateOnly): boolean {
  const current = cycleStore.currentCycle;
  const expectedEnd = ongoingPeriodExpectedEnd.value;
  if (!current || !current.isOngoing || !expectedEnd) {
    return false;
  }
  return day.isAfter(today) && !day.isAfter(expectedEnd);
}

function isLoggedPeriodDay(day: DateOnly): boolean {
  return cycleStore.sortedCycles.some((cycle) => {
    if (cycle.isOngoing) {
      return false; // covered separately by the two ongoing-period checks above
    }
    return day.isBetweenInclusive(cycle.startDate, cycle.endDate as DateOnly);
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
    classes.push("text-slate-300 dark:text-slate-600");
  } else {
    classes.push("text-slate-700 dark:text-slate-200");
  }

  if (isConfirmedOngoingPeriodDay(day)) {
    classes.push("bg-rose-600 text-white ring-2 ring-rose-300 font-semibold dark:ring-rose-500/60");
  } else if (isExpectedRemainingOngoingPeriodDay(day)) {
    classes.push("bg-rose-200 text-rose-700 ring-1 ring-rose-400 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-500/50");
  } else if (isLoggedPeriodDay(day)) {
    classes.push("bg-rose-500/80 text-white");
  } else if (isPredictedPeriodDay(day)) {
    classes.push("ring-1 ring-rose-400/70 text-rose-500 dark:text-rose-300");
  } else if (isFertileWindowDay(day)) {
    classes.push("bg-violet-400/20 text-violet-600 dark:text-violet-200");
  }

  if (day.isSameDay(today)) {
    classes.push("ring-2 ring-teal-400");
  }

  return classes.join(" ");
}
</script>

<template>
  <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div class="mb-3 flex items-center justify-between">
      <button type="button" class="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" @click="monthAnchor = previousMonth(monthAnchor)">›</button>
      <span class="font-medium text-slate-900 dark:text-slate-100">{{ monthTitle(monthAnchor) }}</span>
      <button type="button" class="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" @click="monthAnchor = nextMonth(monthAnchor)">‹</button>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div v-for="day in gridDays" :key="day.toIsoString()" :class="dayClasses(day)">
        {{ toJalaliLabel(day, "d") }}
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-rose-600 ring-2 ring-rose-300"></span> بازه فعلی پریود (تاکنون)</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-rose-200 ring-1 ring-rose-400"></span> ادامه احتمالی پریود فعلی</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span> پریود ثبت‌شده (قبلی)</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full ring-1 ring-rose-400/70"></span> پریود پیش‌بینی‌شده</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-violet-400/40"></span> پنجره باروری</span>
    </div>
  </div>
</template>
