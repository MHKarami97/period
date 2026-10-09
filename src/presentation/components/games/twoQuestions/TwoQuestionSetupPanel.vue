<script setup lang="ts">
import { useCouplePlayersStore } from "@application/stores/couplePlayersStore";
import { useTwoQuestionStore } from "@application/stores/twoQuestionStore";
import PlayerNamesForm from "@presentation/components/games/PlayerNamesForm.vue";

const DURATION_OPTIONS = [1, 2, 3, 5, 10] as const;

const store = useTwoQuestionStore();
const players = useCouplePlayersStore();
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="flex flex-col gap-2 p-4 text-sm leading-7 text-slate-600 dark:text-slate-300 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">طرز بازی</h2>
      <p>یک نفر از دیگری می‌پرسد: «دوست داری چند دقیقه چطور لمست کنم؟» و بعد: «دوست داری چند دقیقه چطور لمسم کنی؟».</p>
      <p>جواب را با هم صحبت می‌کنید و تایمر شروع می‌شود. بعد از دو سؤال، نقش‌ها عوض می‌شود (در کل ۴ مرحله).</p>
    </section>

    <PlayerNamesForm />

    <section class="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">مدت هر مرحله (دقیقه)</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="minutes in DURATION_OPTIONS"
          :key="minutes"
          type="button"
          class="min-w-12 rounded-xl px-3 py-2.5 text-sm transition"
          :class="store.durationMinutes === minutes ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
          @click="store.setDuration(minutes)"
        >
          {{ minutes }}
        </button>
      </div>
    </section>

    <button type="button" class="rounded-xl bg-rose-500/90 px-4 py-3 font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50" :disabled="!players.areNamesComplete" @click="store.startSession()">شروع بازی</button>
  </div>
</template>
