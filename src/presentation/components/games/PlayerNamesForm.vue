<script setup lang="ts">
import { useCouplePlayersStore } from "@application/stores/couplePlayersStore";

const MAX_NAME_LENGTH = 30;
const store = useCouplePlayersStore();
</script>

<template>
  <section class="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">بازیکنان</h2>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-fuchsia-500" />نام خانم</span>
        <input
          :value="store.womanName"
          type="text"
          :maxlength="MAX_NAME_LENGTH"
          class="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          @input="store.setWomanName(($event.target as HTMLInputElement).value)"
        />
      </label>
      <label class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-sky-500" />نام آقا</span>
        <input
          :value="store.manName"
          type="text"
          :maxlength="MAX_NAME_LENGTH"
          class="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          @input="store.setManName(($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>
  </section>
</template>
