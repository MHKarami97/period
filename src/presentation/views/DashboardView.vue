<script setup lang="ts">
import { computed } from "vue";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useUserProfileStore } from "@application/stores/userProfileStore";
import { useProfileStore } from "@application/stores/profileStore";
import { useCycleDashboard } from "@presentation/composables/useCycleDashboard";
import CircularCycleChart from "@presentation/components/dashboard/CircularCycleChart.vue";
import QuickActions from "@presentation/components/dashboard/QuickActions.vue";
import PhaseGuidanceCard from "@presentation/components/dashboard/PhaseGuidanceCard.vue";
import ProfileSwitcher from "@presentation/components/shared/ProfileSwitcher.vue";

const appModeStore = useAppModeStore();
const userProfileStore = useUserProfileStore();
const profileStore = useProfileStore();
const { currentPhaseLabel, currentCycleDay, predictedCycleLength, progressRatio, daysUntilNextPeriod, phaseAccentClass } =
  useCycleDashboard();

/**
 * In partner mode the greeting refers to whichever tracked profile is
 * currently active (e.g. "وضعیت همسر"); in self mode it stays a first-
 * person greeting using the display name from Settings.
 */
const greeting = computed<string>(() => {
  if (appModeStore.isPartnerMode) {
    const trackedName = profileStore.activeProfile?.name;
    return trackedName ? `وضعیت ${trackedName}` : "وضعیت";
  }
  const name = userProfileStore.displayName;
  return name ? `سلام ${name} 👋` : "سلام 👋";
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ greeting }}</h1>

    <ProfileSwitcher v-if="appModeStore.isPartnerMode" />

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

      <section class="lg:col-span-5">
        <QuickActions />
      </section>

      <section class="lg:col-span-12">
        <PhaseGuidanceCard />
      </section>
    </div>
  </div>
</template>
