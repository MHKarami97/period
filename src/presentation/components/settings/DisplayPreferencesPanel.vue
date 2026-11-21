<script setup lang="ts">
import { HOME_WIDGETS, NAV_TOGGLES, useDisplayPreferencesStore } from "@application/stores/displayPreferencesStore";

const preferences = useDisplayPreferencesStore();
</script>

<template>
  <section class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">نمایش بخش‌ها</h2>
      <button type="button" class="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-300" @click="preferences.reset()">بازنشانی</button>
    </div>
    <p class="text-xs leading-6 text-slate-500 dark:text-slate-400">بخش‌هایی را که نمی‌خواهید در منو یا صفحه‌ی خانه ببینید خاموش کنید. داده‌ها پاک نمی‌شوند و هر وقت خواستید دوباره روشن‌شان کنید.</p>

    <fieldset class="flex flex-col gap-2">
      <legend class="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">منو</legend>
      <label v-for="item in NAV_TOGGLES" :key="item.id" class="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:bg-slate-800/60 dark:text-slate-100">
        {{ item.label }}
        <input type="checkbox" role="switch" class="h-4 w-4 accent-teal-500" :checked="preferences.isNavVisible(item.id)" @change="preferences.toggleNav(item.id)" />
      </label>
    </fieldset>

    <fieldset class="flex flex-col gap-2">
      <legend class="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">صفحه‌ی خانه</legend>
      <label v-for="item in HOME_WIDGETS" :key="item.id" class="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:bg-slate-800/60 dark:text-slate-100">
        {{ item.label }}
        <input type="checkbox" role="switch" class="h-4 w-4 accent-teal-500" :checked="preferences.isWidgetVisible(item.id)" @change="preferences.toggleWidget(item.id)" />
      </label>
    </fieldset>
  </section>
</template>
