<script setup lang="ts">
import { ref, watch } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { Mood } from "@domain/valueObjects/Mood";
import { FlowLevel } from "@domain/valueObjects/FlowLevel";
import { useSymptomStore } from "@application/stores/symptomStore";

const props = defineProps<{ date: DateOnly }>();
const symptomStore = useSymptomStore();

const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: Mood.Happy, label: "شاد", emoji: "😊" },
  { value: Mood.Calm, label: "آرام", emoji: "😌" },
  { value: Mood.Sensitive, label: "حساس", emoji: "🥺" },
  { value: Mood.Sad, label: "غمگین", emoji: "😢" },
  { value: Mood.Irritated, label: "عصبی", emoji: "😠" },
  { value: Mood.Anxious, label: "مضطرب", emoji: "😰" },
];

const FLOW_OPTIONS: { value: FlowLevel; label: string }[] = [
  { value: FlowLevel.None, label: "بدون خونریزی" },
  { value: FlowLevel.Spotting, label: "لکه‌بینی" },
  { value: FlowLevel.Light, label: "کم" },
  { value: FlowLevel.Medium, label: "متوسط" },
  { value: FlowLevel.Heavy, label: "شدید" },
];

const selectedMood = ref<Mood | null>(null);
const painLevel = ref(0);
const flowLevel = ref<FlowLevel>(FlowLevel.None);
const note = ref("");

function loadExisting(): void {
  const existing = symptomStore.getForDate(props.date);
  selectedMood.value = existing?.mood ?? null;
  painLevel.value = existing?.painLevel ?? 0;
  flowLevel.value = existing?.flowLevel ?? FlowLevel.None;
  note.value = existing?.note ?? "";
}

watch(() => props.date, loadExisting, { immediate: true });

async function save(): Promise<void> {
  await symptomStore.logSymptom({
    date: props.date,
    mood: selectedMood.value,
    painLevel: painLevel.value,
    flowLevel: flowLevel.value,
    note: note.value || null,
  });
}
</script>

<template>
  <div class="flex flex-col gap-5 rounded-2xl bg-slate-900 p-5 shadow-sm ring-1 ring-slate-800">
    <div>
      <p class="mb-2 text-sm text-slate-400">خلق و خو</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in MOOD_OPTIONS"
          :key="option.value"
          type="button"
          class="flex flex-col items-center rounded-xl px-3 py-2 text-xs transition"
          :class="selectedMood === option.value ? 'bg-teal-500/20 ring-1 ring-teal-400 text-teal-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
          @click="selectedMood = option.value"
        >
          <span class="text-lg">{{ option.emoji }}</span>
          {{ option.label }}
        </button>
      </div>
    </div>

    <div>
      <p class="mb-2 text-sm text-slate-400">سطح درد: {{ painLevel }} / 4</p>
      <input v-model.number="painLevel" type="range" min="0" max="4" step="1" class="w-full accent-rose-400" />
    </div>

    <div>
      <p class="mb-2 text-sm text-slate-400">میزان خونریزی</p>
      <select v-model="flowLevel" class="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100">
        <option v-for="option in FLOW_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    </div>

    <div>
      <p class="mb-2 text-sm text-slate-400">یادداشت (اختیاری)</p>
      <textarea v-model="note" rows="2" class="w-full resize-none rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100"></textarea>
    </div>

    <button type="button" class="rounded-xl bg-teal-500/90 px-4 py-3 font-medium text-white hover:bg-teal-500" @click="save">
      ذخیره علائم امروز
    </button>
  </div>
</template>
