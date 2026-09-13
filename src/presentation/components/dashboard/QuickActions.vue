<script setup lang="ts">
import { shallowRef } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useCycleStore } from "@application/stores/cycleStore";
import JalaliDatePicker from "@presentation/components/shared/JalaliDatePicker.vue";

/**
 * QuickActions - "start/end period" primary action plus early/late date
 * correction via the Jalali-native date picker. `adjustedDate` uses
 * `shallowRef` (not `ref`) because `DateOnly` is an immutable Value Object
 * with a private field; `ref()`'s deep `UnwrapRef` type strips that private
 * brand and breaks assignability back to `DateOnly`. Any correction
 * immediately rewrites predictions because cycleStore.prediction is a
 * computed getter derived from cycleStore.cycles.
 */
const cycleStore = useCycleStore();
const isAdjustingDate = shallowRef(false);
const adjustedDate = shallowRef(DateOnly.today());

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
  <div class="flex flex-col gap-3 rounded-2xl bg-slate-900 p-4 shadow-sm ring-1 ring-slate-800">
    <button
      type="button"
      class="w-full rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99]"
      @click="handlePrimaryAction"
    >
      {{ cycleStore.currentCycle?.isOngoing ? "ثبت پایان پریود" : "ثبت شروع پریود" }}
    </button>

    <button
      type="button"
      class="text-sm text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
      @click="isAdjustingDate = !isAdjustingDate"
    >
      ویرایش تاریخ (زودتر/دیرتر شروع/پایان شده)
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
