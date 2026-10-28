<script setup lang="ts">
import { ref } from "vue";
import { useTwoQuestionStore } from "@application/stores/twoQuestionStore";
import { useCountdown } from "@presentation/composables/useCountdown";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";

const VIBRATION_PATTERN_MS = [200, 100, 200];

const store = useTwoQuestionStore();
const isTimerFinished = ref(false);
const isQuitConfirmOpen = ref(false);

const { label, progressRatio, isRunning, start, stop } = useCountdown(() => {
  isTimerFinished.value = true;
  navigator.vibrate?.(VIBRATION_PATTERN_MS);
});

function beginTouch(): void {
  if (!store.session) return;
  isTimerFinished.value = false;
  store.beginTouch();
  start(store.session.durationInSeconds);
}

function nextStep(): void {
  stop();
  isTimerFinished.value = false;
  store.nextStep();
}

function restart(): void {
  store.startSession();
}
</script>

<template>
  <div v-if="store.session" class="flex flex-col gap-4">
    <section v-if="store.session.currentStep" class="flex flex-col gap-4 p-5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <p class="text-center text-xs text-slate-500 dark:text-slate-400">
        مرحله {{ store.session.stepNumber }} از {{ store.session.totalSteps }}
      </p>

      <div v-if="store.session.wasReset" class="rounded-xl bg-teal-500/10 p-2 text-center text-xs font-medium text-teal-600 dark:bg-teal-500/20 dark:text-teal-300">
        🔄 تمام سوالات یک‌بار نمایش داده شدند؛ دور جدید سوالات شروع شد!
      </div>

      <template v-if="store.phase === 'question'">
        <p class="text-center text-base leading-8 text-slate-900 dark:text-slate-100">{{ store.session.currentStep.questionText }}</p>
        <p class="text-center text-xs text-slate-500 dark:text-slate-400">اول با هم صحبت کنید، بعد تایمر را شروع کنید.</p>
        <button type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50" @click="beginTouch">جواب داده شد؛ شروع تایمر ⏱</button>
      </template>

      <template v-else>
        <p class="text-center text-sm leading-7 text-slate-700 dark:text-slate-200">{{ store.session.currentStep.instructionText }}</p>

        <div class="flex flex-col items-center gap-3">
          <span class="text-5xl font-semibold tabular-nums text-slate-900 dark:text-slate-100" dir="ltr">{{ label }}</span>
          <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" dir="ltr">
            <div class="h-full rounded-full bg-rose-500 transition-[width] duration-200" :style="{ width: `${progressRatio * 100}%` }" />
          </div>
          <p v-if="isTimerFinished" class="text-sm font-medium text-teal-600 dark:text-teal-300" aria-live="polite">⏰ زمان تمام شد</p>
        </div>

        <button
          type="button"
          :class="isTimerFinished ? 'rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50' : 'rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'"
          @click="nextStep"
        >
          {{ isRunning ? "زودتر تمام شد؛ مرحله بعد" : "مرحله بعد" }}
        </button>
      </template>
    </section>

    <section v-else class="flex flex-col items-center gap-4 p-6 text-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">💞 بازی تمام شد</h2>
      <p class="text-sm text-slate-600 dark:text-slate-300">هر دو نقش را تجربه کردید. بعدش چند دقیقه درباره‌ی حستان حرف بزنید.</p>
      <div class="grid w-full grid-cols-2 gap-3">
        <button type="button" class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="store.quit()">بازگشت به تنظیمات</button>
        <button type="button" class="rounded-xl bg-rose-500/90 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-500" @click="restart">بازی دوباره</button>
      </div>
    </section>

    <button
      v-if="store.session.currentStep"
      type="button"
      class="mx-auto rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
      @click="isQuitConfirmOpen = true"
    >
      خروج از بازی
    </button>

    <ConfirmDialog
      v-model="isQuitConfirmOpen"
      title="خروج از بازی؟"
      message="بازی فعلی تمام می‌شود."
      confirm-label="خروج"
      @confirm="stop(); store.quit()"
    />
  </div>
</template>
