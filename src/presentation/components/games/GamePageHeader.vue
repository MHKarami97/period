<script setup lang="ts">
import { RouterLink } from "vue-router";
import AppIcon from "@presentation/components/common/AppIcon.vue";

defineProps<{
  title: string;
  icon?: string;
}>();
</script>

<template>
  <div class="flex items-center justify-between gap-2.5 pb-2 border-b border-slate-200/70 dark:border-slate-800/80">
    <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
      <div v-if="icon" class="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20 dark:bg-teal-400/15 dark:text-teal-300 dark:ring-teal-400/20 shadow-2xs">
        <AppIcon :name="icon" size="sm" />
      </div>
      <h1 class="text-sm sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate sm:whitespace-normal leading-tight">{{ title }}</h1>
    </div>
    <RouterLink
      :to="{ name: 'games' }"
      class="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-100/90 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/90 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
    >
      <span>بازگشت</span>
      <svg class="h-3.5 w-3.5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 19l-7-7 7-7" />
      </svg>
    </RouterLink>
  </div>
</template>
