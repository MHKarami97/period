<script setup lang="ts">
import { ref } from "vue";
import { useTruthOrDareStore } from "@application/stores/truthOrDareStore";
import { CARD_TYPE_LABELS_FA, CardType, INTENSITY_LABELS_FA } from "@domain/games/truthOrDare/TruthOrDareCard";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";

const store = useTruthOrDareStore();
const isQuitConfirmOpen = ref(false);
</script>

<template>
  <div v-if="store.game" class="flex flex-col gap-4">
    <section class="flex flex-col gap-4 p-5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-center text-base font-semibold text-slate-900 dark:text-slate-100">نوبت {{ store.game.currentPlayerName }}</h2>

      <template v-if="!store.game.drawnCard">
        <p class="text-center text-sm text-slate-500 dark:text-slate-400">یکی را انتخاب کن:</p>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50" @click="store.draw(CardType.Truth)">🗣 حقیقت</button>
          <button type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50" @click="store.draw(CardType.Dare)">🔥 جرئت</button>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col gap-3 rounded-2xl bg-amber-100/70 p-5 text-center dark:bg-amber-500/15">
          <span class="text-xs text-amber-700 dark:text-amber-300">
            {{ CARD_TYPE_LABELS_FA[store.game.drawnCard.type] }} · {{ INTENSITY_LABELS_FA[store.game.drawnCard.intensity] }}
          </span>
          <p class="text-base leading-8 text-slate-900 dark:text-slate-100">{{ store.game.drawnCard.text }}</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="store.finishTurn()">رد کردن</button>
          <button type="button" class="rounded-xl bg-teal-500/90 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500" @click="store.finishTurn()">
            انجام شد ✅
          </button>
        </div>
      </template>
    </section>

    <button
      type="button"
      class="mx-auto rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
      @click="isQuitConfirmOpen = true"
    >
      خروج از بازی
    </button>

    <ConfirmDialog
      v-model="isQuitConfirmOpen"
      title="خروج از بازی؟"
      message="بازی فعلی تمام می‌شود، ولی تنظیمات و کارت‌های شما حفظ می‌شود."
      confirm-label="خروج"
      @confirm="store.quitGame()"
    />
  </div>
</template>
