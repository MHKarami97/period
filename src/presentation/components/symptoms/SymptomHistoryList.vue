<script setup lang="ts">
import { computed } from "vue";
import { useSymptomStore } from "@application/stores/symptomStore";
import { useJalali } from "@presentation/composables/useJalali";
import { Mood } from "@domain/valueObjects/Mood";
import { FlowLevel } from "@domain/valueObjects/FlowLevel";

const symptomStore = useSymptomStore();
const { toJalaliLabel } = useJalali();

const MOOD_EMOJI: Record<Mood, string> = {
  [Mood.Happy]: "😊",
  [Mood.Calm]: "😌",
  [Mood.Sensitive]: "🥺",
  [Mood.Sad]: "😢",
  [Mood.Irritated]: "😠",
  [Mood.Anxious]: "😰",
};

const FLOW_LABEL: Record<FlowLevel, string> = {
  [FlowLevel.None]: "بدون خونریزی",
  [FlowLevel.Spotting]: "لکه‌بینی",
  [FlowLevel.Light]: "کم",
  [FlowLevel.Medium]: "متوسط",
  [FlowLevel.Heavy]: "شدید",
};

const sortedSymptoms = computed(() =>
  [...symptomStore.symptoms].sort((a, b) => b.date.diffInDays(a.date)),
);
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">سوابق ثبت‌شده</h2>

    <p v-if="sortedSymptoms.length === 0" class="text-sm text-slate-500 dark:text-slate-400">
      هنوز علائمی ثبت نشده است.
    </p>

    <ul v-else class="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
      <li v-for="symptom in sortedSymptoms" :key="symptom.id" class="flex items-center justify-between gap-3 py-2.5 text-sm">
        <span class="text-slate-500 dark:text-slate-400">{{ toJalaliLabel(symptom.date) }}</span>
        <span class="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <span v-if="symptom.mood">{{ MOOD_EMOJI[symptom.mood] }}</span>
          <span>درد {{ symptom.painLevel }}/۴</span>
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ FLOW_LABEL[symptom.flowLevel] }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>