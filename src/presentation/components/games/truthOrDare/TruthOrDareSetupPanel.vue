<script setup lang="ts">
import { ref } from "vue";
import { useCouplePlayersStore } from "@application/stores/couplePlayersStore";
import { useTruthOrDareStore } from "@application/stores/truthOrDareStore";
import {
  CARD_TYPE_LABELS_FA,
  CardIntensity,
  CardType,
  INTENSITY_LABELS_FA,
  MAX_CARD_TEXT_LENGTH,
} from "@domain/games/truthOrDare/TruthOrDareCard";
import PlayerNamesForm from "@presentation/components/games/PlayerNamesForm.vue";

const INTENSITIES = Object.values(CardIntensity);
const CARD_TYPES = Object.values(CardType);

const store = useTruthOrDareStore();
const players = useCouplePlayersStore();

const newType = ref<CardType>(CardType.Truth);
const newIntensity = ref<CardIntensity>(CardIntensity.Medium);
const newText = ref("");
const errorMessage = ref<string | null>(null);

function addCard(): void {
  try {
    store.addCustomCard(newType.value, newIntensity.value, newText.value);
    newText.value = "";
    errorMessage.value = null;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "ثبت کارت ممکن نشد.";
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PlayerNamesForm />

    <section class="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">شدت بازی</h2>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="level in INTENSITIES"
          :key="level"
          type="button"
          class="rounded-xl px-3 py-2.5 text-sm transition"
          :class="store.intensity === level ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
          @click="store.setIntensity(level)"
        >
          {{ INTENSITY_LABELS_FA[level] }}
        </button>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ store.activeCardCount }} کارت فعال است (هر شدت، کارت‌های سطح‌های پایین‌تر را هم شامل می‌شود).
      </p>
    </section>

    <section class="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">کارت‌های خودتان</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        برای نام‌ها از «{player}» (کسی که کارت را می‌کشد) و «{partner}» (طرف مقابل) استفاده کنید.
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in CARD_TYPES"
          :key="type"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs transition"
          :class="newType === type ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
          @click="newType = type"
        >
          {{ CARD_TYPE_LABELS_FA[type] }}
        </button>
        <select v-model="newIntensity" class="rounded-lg bg-slate-100 px-2 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <option v-for="level in INTENSITIES" :key="level" :value="level">{{ INTENSITY_LABELS_FA[level] }}</option>
        </select>
      </div>

      <textarea
        v-model="newText"
        rows="2"
        :maxlength="MAX_CARD_TEXT_LENGTH"
        class="w-full resize-none rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
      />
      <p v-if="errorMessage" class="text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ errorMessage }}</p>
      <button type="button" class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="addCard">افزودن کارت</button>

      <ul v-if="store.customCards.length" class="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        <li v-for="card in store.customCards" :key="card.id" class="flex items-start justify-between gap-3 py-2 text-sm">
          <span class="flex flex-col gap-1 text-slate-700 dark:text-slate-200">
            <span class="text-[11px] text-slate-400">{{ CARD_TYPE_LABELS_FA[card.type] }} · {{ INTENSITY_LABELS_FA[card.intensity] }}</span>
            {{ card.text }}
          </span>
          <button
            type="button"
            class="shrink-0 rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-500/10"
            @click="store.removeCustomCard(card.id)"
          >
            حذف
          </button>
        </li>
      </ul>
    </section>

    <div class="flex flex-col gap-2">
      <button type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50" :disabled="!players.areNamesComplete" @click="store.startGame()">شروع بازی</button>
      <p class="text-center text-xs text-slate-400 dark:text-slate-500">هر کارتی را می‌شود بدون توضیح رد کرد.</p>
    </div>
  </div>
</template>
