<script setup lang="ts">
import { useCycleDashboard } from "@presentation/composables/useCycleDashboard";
import { usePhaseCare } from "@presentation/composables/usePhaseCare";
import CareItemList from "@presentation/components/dashboard/CareItemList.vue";

/**
 * PhaseGuidanceCard - "what to do today" list driven by the cycle phase AND today's logged symptoms
 * (pain, mood, flow). Wording differs for the tracked person and for a supporting partner.
 */
const { currentPhaseLabel } = useCycleDashboard();
const { items, heading } = usePhaseCare();
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">{{ heading }}</h2>
      <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ currentPhaseLabel }}</span>
    </div>

    <CareItemList :items="items" />

    <p class="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
      این موارد توصیه‌های عمومی سلامت‌اند، نه تشخیص یا نسخه‌ی پزشکی؛ برای علائم شدید حتماً با پزشک مشورت کنید. منابع عمومی:
      <a class="underline" href="https://www.nhs.uk/symptoms/period-pain/" target="_blank" rel="noopener noreferrer">NHS (درد پریود)</a>،
      <a class="underline" href="https://www.nhs.uk/conditions/pre-menstrual-syndrome/" target="_blank" rel="noopener noreferrer">NHS (PMS)</a>،
      <a class="underline" href="https://www.mayoclinic.org/diseases-conditions/premenstrual-syndrome/diagnosis-treatment/drc-20376787" target="_blank" rel="noopener noreferrer">Mayo Clinic</a>.
    </p>
  </div>
</template>
