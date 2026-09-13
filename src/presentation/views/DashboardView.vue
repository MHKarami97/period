<script setup lang="ts">
import { onMounted } from "vue";
import { useCycleStore } from "@application/stores/cycleStore";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useCycleDashboard } from "@presentation/composables/useCycleDashboard";
import CircularCycleChart from "@presentation/components/dashboard/CircularCycleChart.vue";
import QuickActions from "@presentation/components/dashboard/QuickActions.vue";

const cycleStore = useCycleStore();
const appModeStore = useAppModeStore();
const { currentPhaseLabel, currentCycleDay, predictedCycleLength, progressRatio, daysUntilNextPeriod, phaseAccentClass } =
  useCycleDashboard();

onMounted(() => {
  cycleStore.initialize();
});
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <section class="flex items-center justify-center rounded-2xl bg-slate-900 p-6 ring-1 ring-slate-800 lg:col-span-7">
      <CircularCycleChart
        :current-day="currentCycleDay"
        :cycle-length="predictedCycleLength"
        :progress-ratio="progressRatio"
        :phase-label="currentPhaseLabel"
        :days-until-next-period="daysUntilNextPeriod"
        :accent-class="phaseAccentClass"
      />
    </section>

    <section v-if="!appModeStore.isPartnerMode" class="lg:col-span-5">
      <QuickActions />
    </section>

    <section v-else class="flex items-center rounded-2xl bg-slate-900 p-6 text-sm text-slate-400 ring-1 ring-slate-800 lg:col-span-5">
      نمای شریک فقط‌خواندنی است؛ ثبت پریود و علائم فقط در حالت «ردیابی برای خود» در دسترس است.
    </section>
  </div>
</template>
