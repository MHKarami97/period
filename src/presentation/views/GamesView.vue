<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useGameAccessStore } from "@application/stores/gameAccessStore";
import { GAME_CATALOG, type GameDefinition } from "@presentation/games/gameCatalog";
import GameCard from "@presentation/components/games/GameCard.vue";

const ACCESS_DENIED_MESSAGE = "دسترسی ندارید.";

const router = useRouter();
const accessStore = useGameAccessStore();

const password = ref("");
const errorMessage = ref<string | null>(null);
const passwordInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await nextTick();
  passwordInput.value?.focus();
});

function submitPassword(): void {
  if (!accessStore.tryUnlock(password.value)) {
    errorMessage.value = ACCESS_DENIED_MESSAGE;
    password.value = "";
    return;
  }
  errorMessage.value = null;
  password.value = "";
}

function openGame(game: GameDefinition): void {
  void router.push({ name: game.routeName });
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">بازی‌ها</h1>

    <form
      v-if="!accessStore.isUnlocked"
      class="mx-auto flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
      @submit.prevent="submitPassword"
    >
      <p class="text-sm text-slate-600 dark:text-slate-300">برای دیدن بازی‌ها، رمز را وارد کنید.</p>
      <input
        ref="passwordInput"
        v-model="password"
        type="password"
        autocomplete="off"
        dir="ltr"
        placeholder="رمز"
        class="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
      />
      <p v-if="errorMessage" class="text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ errorMessage }}</p>
      <button type="submit" class="rounded-xl bg-teal-500/90 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500">ورود</button>
    </form>

    <template v-else>
      <div class="flex justify-end">
        <button
          type="button"
          class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          @click="accessStore.lock()"
        >
          قفل کردن بازی‌ها
        </button>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <GameCard v-for="game in GAME_CATALOG" :key="game.id" :game="game" @open="openGame" />
      </div>
    </template>
  </div>
</template>
