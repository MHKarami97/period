<script setup lang="ts">
import { useThemeStore, type ThemeMode } from "@application/stores/themeStore";

const themeStore = useThemeStore();

const OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "روشن", icon: "☀" },
  { value: "dark", label: "تیره", icon: "☾" },
];
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">تم برنامه</h2>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="option in OPTIONS"
        :key="option.value"
        type="button"
        class="flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-sm transition"
        :class="
          themeStore.theme === option.value
            ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        "
        @click="themeStore.setTheme(option.value)"
      >
        <span class="text-lg">{{ option.icon }}</span>
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
