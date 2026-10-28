<script setup lang="ts">
import { computed } from "vue";
import { useConversationStore } from "@application/stores/conversationStore";
import {
  CONVERSATION_CATEGORY_LABELS_FA,
  ConversationCategory,
  MAX_CONVERSATION_TEXT_LENGTH,
} from "@domain/games/conversation/ConversationCard";
import CustomCardsEditor from "@presentation/components/games/CustomCardsEditor.vue";
import type { CardOption } from "@presentation/components/games/customCardTypes";
import GamePageHeader from "@presentation/components/games/GamePageHeader.vue";

const CATEGORIES = Object.values(ConversationCategory);
const CATEGORY_OPTIONS: CardOption[] = CATEGORIES.map((value) => ({ value, label: CONVERSATION_CATEGORY_LABELS_FA[value] }));

const store = useConversationStore();

const customItems = computed(() =>
  store.customCards.map((card) => ({ id: card.id, label: CONVERSATION_CATEGORY_LABELS_FA[card.category], text: card.text })),
);

function tryAdd(categoryValue: string, text: string): string | null {
  try {
    store.addCustomCard(categoryValue as ConversationCategory, text);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "ثبت کارت ممکن نشد.";
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <GamePageHeader title="🗨 کارت‌های گفت‌وگوی عمیق" />

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
          {{ CONVERSATION_CATEGORY_LABELS_FA[category] }}
        </button>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ store.activeCardCount }} کارت فعال است ({{ store.session.remainingCount }} کارت باقیمانده در این دور).</p>
    </section>

    <section class="flex flex-col gap-4 p-5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div v-if="store.session.currentCard" class="flex flex-col gap-3 rounded-2xl bg-amber-100/70 p-6 text-center dark:bg-amber-500/15">
        <span v-if="store.session.wasReset" class="text-xs font-medium text-teal-600 dark:text-teal-400">
          🔄 تمام کارت‌ها یک‌بار نمایش داده شدند؛ دور جدید شروع شد!
        </span>
        <span class="text-xs text-amber-700 dark:text-amber-300">
          {{ CONVERSATION_CATEGORY_LABELS_FA[store.session.currentCard.category] }} · کارت {{ store.session.drawnNumber }}
        </span>
        <p class="text-lg leading-9 text-slate-900 dark:text-slate-100" aria-live="polite">{{ store.session.currentCard.text }}</p>
      </div>
      <p v-else class="py-6 text-center text-sm text-slate-500 dark:text-slate-400">برای شروع، «کارت بعدی» را بزنید.</p>

      <button type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50" :disabled="!store.session.hasCards" @click="store.drawNext()">کارت بعدی ({{ store.session.remainingCount }} باقیمانده)</button>
      <p class="text-center text-xs text-slate-400 dark:text-slate-500">هر دو جواب بدهید؛ نوبتی گوش بدهید و قضاوت نکنید. رد کردن هر کارت آزاد است.</p>
    </section>

    <CustomCardsEditor
      :options="CATEGORY_OPTIONS"
      :items="customItems"
      :max-length="MAX_CONVERSATION_TEXT_LENGTH"
      :try-add="tryAdd"
      @remove="store.removeCustomCard"
    />
  </div>
</template>
