<script setup lang="ts">
import { computed, ref } from "vue";
import { useScratchCardsStore } from "@application/stores/scratchCardsStore";
import {
  MAX_SCRATCH_TEXT_LENGTH,
  SCRATCH_CATEGORY_LABELS_FA,
  ScratchCategory,
} from "@domain/games/scratchCards/ScratchCard";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";
import CustomCardsEditor from "@presentation/components/games/CustomCardsEditor.vue";
import type { CardOption } from "@presentation/components/games/customCardTypes";
import GamePageHeader from "@presentation/components/games/GamePageHeader.vue";
import ScratchCardTile from "@presentation/components/games/scratch/ScratchCardTile.vue";

const CATEGORIES = Object.values(ScratchCategory);
const CATEGORY_OPTIONS: CardOption[] = CATEGORIES.map((value) => ({ value, label: SCRATCH_CATEGORY_LABELS_FA[value] }));

const store = useScratchCardsStore();
const isResetConfirmOpen = ref(false);

const customItems = computed(() =>
  store.customCards.map((card) => ({ id: card.id, label: SCRATCH_CATEGORY_LABELS_FA[card.category], text: card.text })),
);

function tryAdd(categoryValue: string, text: string): string | null {
  try {
    store.addCustomCard(categoryValue as ScratchCategory, text);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "ثبت کارت ممکن نشد.";
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <GamePageHeader title="🪙 کارت‌های خراشیدنی" />

    <section class="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">دسته‌ها</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in CATEGORIES"
          :key="category"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs transition"
          :class="store.categories.includes(category) ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
          @click="store.toggleCategory(category)"
        >
          {{ SCRATCH_CATEGORY_LABELS_FA[category] }}
        </button>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ store.availableCount }} کارت انجام‌نشده مانده است. تغییر دسته‌ها با «ورق جدید» اعمال می‌شود.
      </p>
      <button type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50" @click="store.dealSheet()">ورق جدید</button>
    </section>

    <p v-if="store.dealError" class="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300" role="alert">{{ store.dealError }}</p>

    <div v-if="store.sheet" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ScratchCardTile
        v-for="slot in store.sheet.slots"
        :key="slot.card.id"
        :text="slot.card.text"
        :category-label="SCRATCH_CATEGORY_LABELS_FA[slot.card.category]"
        :status="slot.status"
        @reveal="store.reveal(slot.card.id)"
        @complete="store.complete(slot.card.id)"
      />
    </div>

    <button type="button" class="mx-auto rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="isResetConfirmOpen = true">بازنشانی پیشرفت کارت‌ها</button>

    <CustomCardsEditor
      :options="CATEGORY_OPTIONS"
      :items="customItems"
      :max-length="MAX_SCRATCH_TEXT_LENGTH"
      :try-add="tryAdd"
      @remove="store.removeCustomCard"
    />

    <ConfirmDialog
      v-model="isResetConfirmOpen"
      title="بازنشانی پیشرفت؟"
      message="علامت «انجام شد» همه‌ی کارت‌ها پاک می‌شود و دوباره قابل کشیدن‌اند. کارت‌های سفارشی حفظ می‌شود."
      confirm-label="بازنشانی"
      danger
      @confirm="store.resetProgress()"
    />
  </div>
</template>
