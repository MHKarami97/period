<script setup lang="ts">
import { computed } from "vue";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useCycleDashboard } from "@presentation/composables/useCycleDashboard";
import { usePhaseGuidance } from "@presentation/composables/usePhaseGuidance";

/**
 * PhaseGuidanceCard - contextual "what to do today" tips on the dashboard,
 * driven entirely by the current CyclePhase. Shows self-care tips in
 * self-tracking mode and partner-support tips in partner mode, so the same
 * phase produces a different, audience-appropriate message.
 */
const appModeStore = useAppModeStore();
const { currentPhaseLabel } = useCycleDashboard();
const { guidance } = usePhaseGuidance();

const tips = computed(() => (appModeStore.isPartnerMode ? guidance.value.partnerTips : guidance.value.selfTips));
const heading = computed(() => (appModeStore.isPartnerMode ? "امروز چطور کمک کنید" : "امروز چه کاری بکنید"));
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">{{ heading }}</h2>
      <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ currentPhaseLabel }}</span>
    </div>

    <ul class="flex flex-col gap-2">
      <li v-for="tip in tips" :key="tip" class="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
        <span class="mt-0.5 text-teal-500">•</span>
        <span>{{ tip }}</span>
      </li>
    </ul>

    <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
      این موارد توصیه‌های عمومی سلامت هستند، نه تشخیص یا نسخه پزشکی؛ برای علائم شدید حتماً با پزشک مشورت کنید.
    </p>
  </div>
</template>
