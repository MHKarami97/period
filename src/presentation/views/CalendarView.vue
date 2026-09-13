<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCycleStore } from "@application/stores/cycleStore";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useUserProfileStore } from "@application/stores/userProfileStore";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useJalali } from "@presentation/composables/useJalali";
import JalaliCalendarGrid from "@presentation/components/calendar/JalaliCalendarGrid.vue";

const cycleStore = useCycleStore();
const appModeStore = useAppModeStore();
const userProfileStore = useUserProfileStore();
const { toJalaliLabel } = useJalali();

const title = computed<string>(() => {
  const name = userProfileStore.displayName;
  if (appModeStore.isPartnerMode) {
    return name ? `تقویم ${name}` : "تقویم";
  }
  return "تقویم";
});

/**
 * Surfaces the length of the CURRENT period range directly above the
 * calendar: while bleeding is ongoing this counts up day-by-day from the
 * logged start date; once the period has been closed, it shows the final
 * logged length. Both numbers come straight from the Cycle aggregate
 * (`periodLengthInDays`), never recomputed here.
 */
const currentPeriodInfo = computed(() => {
  const current = cycleStore.currentCycle;
  if (!current) {
    return null;
  }

  if (current.isOngoing) {
    const daysSoFar = DateOnly.today().diffInDays(current.startDate) + 1;
    return {
      isOngoing: true,
      days: daysSoFar,
      startLabel: toJalaliLabel(current.startDate),
    };
  }

  return {
    isOngoing: false,
    days: current.periodLengthInDays ?? 0,
    startLabel: toJalaliLabel(current.startDate),
    endLabel: current.endDate ? toJalaliLabel(current.endDate) : "",
  };
});

onMounted(() => {
  cycleStore.initialize();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h1>

    <div
      v-if="currentPeriodInfo"
      class="rounded-2xl bg-white p-4 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
    >
      <template v-if="currentPeriodInfo.isOngoing">
        <span class="font-medium text-rose-500 dark:text-rose-300">بازه فعلی پریود در جریان است:</span>
        <span class="text-slate-700 dark:text-slate-200"> امروز روز {{ currentPeriodInfo.days }} است (شروع: {{ currentPeriodInfo.startLabel }}).</span>
      </template>
      <template v-else>
        <span class="font-medium text-slate-700 dark:text-slate-200">آخرین بازه پریود:</span>
        <span class="text-slate-600 dark:text-slate-300">
          {{ currentPeriodInfo.days }} روز ({{ currentPeriodInfo.startLabel }} تا {{ currentPeriodInfo.endLabel }})
        </span>
      </template>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <JalaliCalendarGrid />
      </div>
    </div>
  </div>
</template>
