<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { DailySuggestion } from "@domain/home/DailySuggestion";

defineProps<{
  suggestions: readonly DailySuggestion[];
}>();
</script>

<template>
  <ul class="flex flex-col gap-2">
    <li v-for="suggestion in suggestions" :key="suggestion.id">
      <RouterLink
        :to="suggestion.to"
        class="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-200/70 transition hover:bg-slate-100 active:scale-[0.99] dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700/60 dark:hover:bg-slate-800"
      >
        <span class="mt-0.5 text-lg leading-6" aria-hidden="true">{{ suggestion.icon }}</span>
        <span class="min-w-0 flex-1">{{ suggestion.text }}</span>
      </RouterLink>
    </li>
  </ul>
</template>
