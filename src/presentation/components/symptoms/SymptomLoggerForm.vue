<script setup lang="ts">
import { ref, watch } from "vue";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { Mood } from "@domain/valueObjects/Mood";
import { FlowLevel } from "@domain/valueObjects/FlowLevel";
import { useSymptomStore } from "@application/stores/symptomStore";
import { useToast } from "@presentation/composables/useToast";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";

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

const isSaving = ref(false);
const saveError = ref<string | null>(null);

const isOverwriteConfirmOpen = ref(false);

function loadExisting(): void {
  const existing = symptomStore.getForDate(props.date);
  selectedMood.value = existing?.mood ?? null;
  painLevel.value = existing?.painLevel ?? 0;
  flowLevel.value = existing?.flowLevel ?? FlowLevel.None;
  note.value = existing?.note ?? "";
}

watch(() => props.date, loadExisting, { immediate: true });

const { showToast } = useToast();

function requestSave(): void {
  const existing = symptomStore.getForDate(props.date);
  if (existing) {
    isOverwriteConfirmOpen.value = true;
  } else {
    save();
  }
}

async function save(): Promise<void> {
  saveError.value = null;
  isSaving.value = true;
  try {
    await symptomStore.logSymptom({
      date: props.date,
      mood: selectedMood.value,
      painLevel: painLevel.value,
      flowLevel: flowLevel.value,
      note: note.value || null,
    });
    showToast("علائم با موفقیت ذخیره شد ✅");
  } catch (error) {
    saveError.value =
      error instanceof Error && error.message === "No active profile selected."
        ? "قبل از ثبت علائم، ابتدا یک نفر را در بالای داشبورد انتخاب کنید."
        : "ذخیره علائم با خطا مواجه شد. دوباره تلاش کنید.";
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div>
      <p class="mb-2 text-sm text-slate-500 dark:text-slate-400">خلق و خو</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in MOOD_OPTIONS"
          :key="option.value"
          type="button"
          class="flex flex-col items-center rounded-xl px-3 py-2 text-xs transition"
          :class="selectedMood === option.value ? 'bg-teal-500/10 ring-1 ring-teal-500 text-teal-600 dark:bg-teal-500/20 dark:ring-teal-400 dark:text-teal-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
          @click="selectedMood = option.value"
        >
          <span class="text-lg">{{ option.emoji }}</span>
          {{ option.label }}
        </button>
      </div>
    </div>

    <div>
      <p class="mb-2 text-sm text-slate-500 dark:text-slate-400">سطح درد: {{ painLevel }} / 4</p>
      <input v-model.number="painLevel" type="range" min="0" max="4" step="1" class="w-full accent-rose-400" />
    </div>

    <div>
      <p class="mb-2 text-sm text-slate-500 dark:text-slate-400">میزان خونریزی</p>
      <select v-model="flowLevel" class="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100">
        <option v-for="option in FLOW_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    </div>

    <div>
      <p class="mb-2 text-sm text-slate-500 dark:text-slate-400">یادداشت (اختیاری)</p>
      <textarea v-model="note" rows="2" class="w-full resize-none rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"></textarea>
    </div>

    <button type="button" class="rounded-xl bg-teal-500/90 px-4 py-3 font-medium text-white hover:bg-teal-500 disabled:opacity-60" :disabled="isSaving" @click="requestSave">
      {{ isSaving ? "در حال ذخیره..." : "ذخیره علائم امروز" }}
    </button>
    <p v-if="saveError" class="text-xs text-rose-500 dark:text-rose-300">{{ saveError }}</p>

    <ConfirmDialog
      v-model="isOverwriteConfirmOpen"
      title="بازنویسی علائم این روز؟"
      message="برای این تاریخ قبلاً علائمی ثبت شده است. با ادامه، مقادیر قبلی با مقادیر جدید جایگزین می‌شوند."
      confirm-label="بله، بازنویسی کن"
      @confirm="save"
    />
  </div>
</template>