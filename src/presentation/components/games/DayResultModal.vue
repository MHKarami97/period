<script setup lang="ts">
import { ref } from "vue";
import type { DailyChallengePlan, ChallengeDayStatus } from "@domain/games/dailyChallenges/DailyChallengeTypes";
import { useDailyChallengesStore } from "@application/stores/dailyChallengesStore";
import AppIcon from "@presentation/components/common/AppIcon.vue";

const props = defineProps<{
  weekStartIso: string;
  day: DailyChallengePlan;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const store = useDailyChallengesStore();

const selectedStatus = ref<ChallengeDayStatus>(
  props.day.status === "pending" ? "completed" : props.day.status,
);
const resultNote = ref(props.day.completionNote || "");

function handleSave(): void {
  store.setDayResult(
    props.weekStartIso,
    props.day.date,
    selectedStatus.value,
    resultNote.value,
  );
  emit("saved");
  emit("close");
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
    <div class="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300">
            <AppIcon name="note" size="lg" filled />
          </span>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              ثبت نتیجه چالش: {{ day.dayName }} ({{ day.jalaliDateLabel }})
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              چالش: {{ day.challengeTitle }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"
          @click="emit('close')"
        >
          <AppIcon name="x" size="sm" />
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-5 p-5">
        <!-- Status Selector -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
            وضعیت انجام چالش
          </label>
          <div class="grid grid-cols-3 gap-2.5 text-xs">
            <button
              type="button"
              class="flex flex-col items-center justify-center gap-2 rounded-2xl p-3.5 border font-bold transition active:scale-95"
              :class="selectedStatus === 'completed'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'"
              @click="selectedStatus = 'completed'"
            >
              <AppIcon name="check-circle" size="lg" />
              <span>انجام شد</span>
            </button>

            <button
              type="button"
              class="flex flex-col items-center justify-center gap-2 rounded-2xl p-3.5 border font-bold transition active:scale-95"
              :class="selectedStatus === 'off'
                ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 ring-2 ring-sky-500/20 shadow-2xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'"
              @click="selectedStatus = 'off'"
            >
              <AppIcon name="beach" size="lg" />
              <span>آف / مهمانی</span>
            </button>

            <button
              type="button"
              class="flex flex-col items-center justify-center gap-2 rounded-2xl p-3.5 border font-bold transition active:scale-95"
              :class="selectedStatus === 'skipped'
                ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-2xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'"
              @click="selectedStatus = 'skipped'"
            >
              <AppIcon name="x-circle" size="lg" />
              <span>انجام نشد</span>
            </button>
          </div>
        </div>

        <!-- Result / Summary Note Textarea -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            خلاصه و نتیجه احساس / خاطره دونفره ما
          </label>
          <textarea
            v-model="resultNote"
            rows="4"
            placeholder="مثلاً: چقدر خوش گذشت، غذایی که پختیم عالی شد، از موسیقی لذت بردیم یا چقدر با هم خندیدیم..."
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 leading-6"
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2.5 border-t border-slate-100 p-4 dark:border-slate-800">
        <button
          type="button"
          class="rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          @click="emit('close')"
        >
          انصراف
        </button>
        <button
          type="button"
          class="rounded-2xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 active:scale-95 transition"
          @click="handleSave"
        >
          ذخیره نتیجه
        </button>
      </div>
    </div>
  </div>
</template>
