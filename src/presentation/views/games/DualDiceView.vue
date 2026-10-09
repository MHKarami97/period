<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { useDualDiceStore } from "@application/stores/dualDiceStore";
import { GameValidationError } from "@domain/games/shared/GameValidationError";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";
import EditableStringList from "@presentation/components/games/EditableStringList.vue";
import GamePageHeader from "@presentation/components/games/GamePageHeader.vue";

const ROLL_ANIMATION_MS = 500;

const store = useDualDiceStore();
const isRolling = ref(false);
const isResetConfirmOpen = ref(false);
let rollTimeoutId: number | null = null;

function roll(): void {
  if (isRolling.value) return;
  isRolling.value = true;
  rollTimeoutId = window.setTimeout(() => {
    store.roll();
    isRolling.value = false;
  }, ROLL_ANIMATION_MS);
}

function guarded(action: () => void): string | null {
  try {
    action();
    return null;
  } catch (error) {
    return error instanceof GameValidationError ? error.message : "ثبت نشد.";
  }
}

const tryAddAction = (text: string): string | null => guarded(() => store.addAction(text));
const tryAddBodyPart = (text: string): string | null => guarded(() => store.addBodyPart(text));

function removeAction(index: number): void {
  guarded(() => store.removeAction(index));
}

function removeBodyPart(index: number): void {
  guarded(() => store.removeBodyPart(index));
}

onBeforeUnmount(() => {
  if (rollTimeoutId !== null) window.clearTimeout(rollTimeoutId);
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <GamePageHeader title="🎲 تاس دوتایی" />

    <section class="flex flex-col gap-4 p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div class="grid grid-cols-2 gap-3">
        <div
          class="flex min-h-28 flex-col items-center justify-center gap-1 rounded-2xl bg-rose-500/10 p-3 text-center dark:bg-rose-500/20"
          :class="{ 'animate-pulse': isRolling }"
        >
          <span class="text-xs text-rose-600 dark:text-rose-300">چه کار کنی؟</span>
          <span class="text-base font-semibold text-slate-900 dark:text-slate-100">
            {{ isRolling ? "🎲" : store.lastResult?.action ?? "؟" }}
          </span>
        </div>
        <div
          class="flex min-h-28 flex-col items-center justify-center gap-1 rounded-2xl bg-sky-500/10 p-3 text-center dark:bg-sky-500/20"
          :class="{ 'animate-pulse': isRolling }"
        >
          <span class="text-xs text-sky-600 dark:text-sky-300">کجا؟</span>
          <span class="text-base font-semibold text-slate-900 dark:text-slate-100">
            {{ isRolling ? "🎲" : store.lastResult?.bodyPart ?? "؟" }}
          </span>
        </div>
      </div>

      <button type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50" :disabled="isRolling" @click="roll">🎲 بنداز</button>
      <p class="text-center text-xs text-slate-400 dark:text-slate-500">هر کدام در هر لحظه می‌تواند بگوید «آرام‌تر» یا «نه».</p>
    </section>

    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">ویرایش وجه‌های تاس‌ها</h2>
    <p class="-mt-2 text-xs text-slate-500 dark:text-slate-400">تغییرات خودکار ذخیره می‌شود.</p>

    <EditableStringList title="تاس عمل" :items="store.actions" placeholder="مثلاً: ببوس" :try-add="tryAddAction" @remove="removeAction" />
    <EditableStringList title="تاس محل" :items="store.bodyParts" placeholder="مثلاً: گردن" :try-add="tryAddBodyPart" @remove="removeBodyPart" />

    <button type="button" class="mx-auto rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="isResetConfirmOpen = true">بازگرداندن به حالت پیش‌فرض</button>

    <ConfirmDialog
      v-model="isResetConfirmOpen"
      title="بازگشت به پیش‌فرض؟"
      message="همه‌ی وجه‌های سفارشی هر دو تاس حذف و لیست اولیه جایگزین می‌شود."
      confirm-label="بازگردانی"
      danger
      @confirm="store.resetToDefaults()"
    />
  </div>
</template>
