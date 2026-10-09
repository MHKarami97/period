<script setup lang="ts">
import { useSnakeLadderStore } from "@application/stores/snakeLadderStore";
import { useToast } from "@presentation/composables/useToast";
import SnakeLadderBoardEditor from "./SnakeLadderBoardEditor.vue";

const MAX_NAME_LENGTH = 30;
const SECONDARY_BUTTON =
  "rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700";

const store = useSnakeLadderStore();
const { showToast } = useToast();

function regenerate(): void {
  store.regenerateBoard();
  showToast("چیدمان تصادفی جدید ساخته شد", 1500);
}

function save(): void {
  store.saveSettings();
  showToast("تنظیمات ذخیره شد", 1500);
}

function restore(): void {
  showToast(store.restoreSavedSettings() ? "تنظیمات ذخیره‌شده بازگردانی شد" : "تنظیمات ذخیره‌شده‌ای وجود ندارد", 1500);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">بازیکنان</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-fuchsia-500" />نام خانم</span>
          <input
            v-model="store.womanName"
            type="text"
            :maxlength="MAX_NAME_LENGTH"
            class="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-sky-500" />نام آقا</span>
          <input
            v-model="store.manName"
            type="text"
            :maxlength="MAX_NAME_LENGTH"
            class="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
      </div>
    </section>

    <section class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">تنظیم تخته</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ store.board.snakeCount }} مار · {{ store.board.ladderCount }} نردبان · {{ store.board.challengeCount }} چالش
      </p>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button type="button" :class="SECONDARY_BUTTON" @click="regenerate">🎲 چیدمان تصادفی جدید</button>
        <button type="button" :class="SECONDARY_BUTTON" @click="save">💾 ذخیره تنظیمات</button>
        <button type="button" :class="SECONDARY_BUTTON" :disabled="!store.hasSavedSettings" @click="restore">↩ بازگردانی ذخیره‌شده</button>
      </div>
    </section>

    <SnakeLadderBoardEditor />

    <div class="flex flex-col gap-2">
      <button
        type="button"
        class="w-full rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!store.canStart"
        @click="store.startGame()"
      >
        شروع بازی
      </button>
      <p class="text-center text-xs text-slate-400 dark:text-slate-500">
        این بازی برای دو بزرگسال است؛ هر کدام در هر لحظه حق دارد چالشی را رد کند.
      </p>
    </div>
  </div>
</template>
