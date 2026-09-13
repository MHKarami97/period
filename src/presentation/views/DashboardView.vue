<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCycleStore } from "@application/stores/cycleStore";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useUserProfileStore } from "@application/stores/userProfileStore";
import { useCycleDashboard } from "@presentation/composables/useCycleDashboard";
import CircularCycleChart from "@presentation/components/dashboard/CircularCycleChart.vue";
import QuickActions from "@presentation/components/dashboard/QuickActions.vue";
import PhaseGuidanceCard from "@presentation/components/dashboard/PhaseGuidanceCard.vue";

const cycleStore = useCycleStore();
const appModeStore = useAppModeStore();
const userProfileStore = useUserProfileStore();
const { currentPhaseLabel, currentCycleDay, predictedCycleLength, progressRatio, daysUntilNextPeriod, phaseAccentClass } =
  useCycleDashboard();

/**
 * The display name entered in Settings is reused here in both directions
 * of Dual Mode: a first-person greeting when tracking for yourself, and a
 * third-person status heading when viewing as a partner.
 */
const greeting = computed<string>(() => {
  const name = userProfileStore.displayName;
  if (appModeStore.isPartnerMode) {
    return name ? `وضعیت ${name}` : "وضعیت";
  }
  return name ? `سلام ${name} 👋` : "سلام 👋";
});

onMounted(() => {
  cycleStore.initialize();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ greeting }}</h1>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <section class="flex items-center justify-center rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 lg:col-span-7">
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

      <section v-else class="flex items-center rounded-2xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800 lg:col-span-5">
        نمای شریک فقط‌خواندنی است؛ ثبت پریود و علائم فقط در حالت «ردیابی برای خود» در دسترس است.
      </section>

      <section class="lg:col-span-12">
        <PhaseGuidanceCard />
      </section>
    </div>
  </div>
</template>
