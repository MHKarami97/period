<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useCycleStore } from "@application/stores/cycleStore";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useProfileStore } from "@application/stores/profileStore";
import JalaliDatePicker from "@presentation/components/shared/JalaliDatePicker.vue";

/**
 * QuickActions - "start/end period" primary action plus early/late date
 * correction via the Jalali-native date picker.
 *
 * Available in BOTH self and partner mode: a partner needs to be able to
 * log when the person they track started her period, not just view a
 * prediction. Only the button label changes — it includes the active
 * profile's name in partner mode ("ثبت شروع پریود همسر") so it is always
 * clear whose period is being recorded when several profiles exist.
 */
const cycleStore = useCycleStore();
const appModeStore = useAppModeStore();
const profileStore = useProfileStore();

const isAdjustingDate = shallowRef(false);
const adjustedDate = shallowRef(DateOnly.today());

const primaryActionLabel = computed<string>(() => {
  const base = cycleStore.currentCycle?.isOngoing ? "ثبت پایان پریود" : "ثبت شروع پریود";
  if (appModeStore.isPartnerMode && profileStore.activeProfile) {
    return `${base} ${profileStore.activeProfile.name}`;
  }
  return base;
});

async function handlePrimaryAction(): Promise<void> {
  const current = cycleStore.currentCycle;
  if (!current || !current.isOngoing) {
    await cycleStore.startPeriod(DateOnly.today());
  } else {
    await cycleStore.endPeriod(current.id, DateOnly.today());
  }
}

async function applyDateCorrection(): Promise<void> {
  const current = cycleStore.currentCycle;
  if (!current) {
    return;
  }
  if (current.isOngoing) {
    await cycleStore.correctStartDate(current.id, adjustedDate.value);
  } else {
    await cycleStore.correctEndDate(current.id, adjustedDate.value);
  }
  isAdjustingDate.value = false;
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <button
      type="button"
      class="w-full rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99]"
      @click="handlePrimaryAction"
    >
      {{ primaryActionLabel }}
    </button>

    <button
      type="button"
      class="text-sm text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
      @click="isAdjustingDate = !isAdjustingDate"
    >
      ویرایش تاریخ
    </button>

    <div v-if="isAdjustingDate" class="flex items-center gap-2">
      <div class="flex-1">
        <JalaliDatePicker v-model="adjustedDate" />
      </div>
      <button type="button" class="rounded-lg bg-teal-500/90 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500" @click="applyDateCorrection">
        اعمال
      </button>
    </div>
  </div>
</template>
