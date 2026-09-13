<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useCycleStore } from "@application/stores/cycleStore";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useUserProfileStore } from "@application/stores/userProfileStore";
import { useProfileStore } from "@application/stores/profileStore";
import { useCycleDashboard } from "@presentation/composables/useCycleDashboard";
import CircularCycleChart from "@presentation/components/dashboard/CircularCycleChart.vue";
import QuickActions from "@presentation/components/dashboard/QuickActions.vue";
import PhaseGuidanceCard from "@presentation/components/dashboard/PhaseGuidanceCard.vue";
import ProfileSwitcher from "@presentation/components/shared/ProfileSwitcher.vue";

const cycleStore = useCycleStore();
const appModeStore = useAppModeStore();
const userProfileStore = useUserProfileStore();
const profileStore = useProfileStore();
const { currentPhaseLabel, currentCycleDay, predictedCycleLength, progressRatio, daysUntilNextPeriod, phaseAccentClass } =
  useCycleDashboard();

const greeting = computed<string>(() => {
  if (appModeStore.isPartnerMode) {
    const trackedName = profileStore.activeProfile?.name;
    return trackedName ? `وضعیت ${trackedName}` : "وضعیت";
  }
  const name = userProfileStore.displayName;
  return name ? `سلام ${name} 👋` : "سلام 👋";
});

const hasUsableScope = computed(() => !appModeStore.isPartnerMode || profileStore.activeProfileId !== null);

onMounted(() => {
  cycleStore.initialize();
});

watch(
  () => profileStore.activeProfileId,
  () => {
    if (appModeStore.isPartnerMode) {
      cycleStore.initialize();
    }
  },
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ greeting }}</h1>

    <ProfileSwitcher v-if="appModeStore.isPartnerMode" />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <section
        v-if="hasUsableScope && cycleStore.hasHistory"
        class="flex items-center justify-center rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 lg:col-span-7"
      >
        <CircularCycleChart
          :current-day="currentCycleDay"
          :cycle-length="predictedCycleLength"
          :progress-ratio="progressRatio"
          :phase-label="currentPhaseLabel"
          :days-until-next-period="daysUntilNextPeriod"
          :accent-class="phaseAccentClass"
        />
      </section>

      <section
        v-else
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 lg:col-span-7"
      >
        <span class="text-3xl">{{ hasUsableScope ? "🩸" : "👥" }}</span>
        <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
          {{
            !hasUsableScope
              ? "ابتدا یک فرد را از بالا اضافه یا انتخاب کنید."
              : appModeStore.isPartnerMode
                ? "هنوز پریودی ثبت نشده است."
                : "هنوز هیچ پریودی ثبت نکرده‌اید."
          }}
        </p>
        <p v-if="hasUsableScope" class="max-w-xs text-xs text-slate-500 dark:text-slate-400">
          {{
            appModeStore.isPartnerMode
              ? "با دکمه «ثبت شروع پریود» می‌توانید تاریخ پریود همین فرد را ثبت کنید."
              : "با دکمه «ثبت شروع پریود» شروع کنید تا نمودار چرخه و پیش‌بینی‌ها فعال شود."
          }}
        </p>
      </section>

      <section v-if="hasUsableScope" class="lg:col-span-5">
        <QuickActions />
      </section>
      <section
        v-else
        class="flex items-center rounded-2xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800 lg:col-span-5"
      >
        برای ثبت پریود، ابتدا یک فرد را از بالا اضافه یا انتخاب کنید.
      </section>

      <section v-if="hasUsableScope && cycleStore.hasHistory" class="lg:col-span-12">
        <PhaseGuidanceCard />
      </section>
      <section
        v-else-if="!hasUsableScope"
        class="flex items-center justify-center rounded-2xl bg-white p-5 text-sm text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800 lg:col-span-12"
      >
        برای مشاهده این بخش، ابتدا یک فرد را انتخاب کنید.
      </section>
    </div>
  </div>
</template>