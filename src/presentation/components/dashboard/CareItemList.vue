<script setup lang="ts">
import type { CareItem } from "@domain/home/PhaseCareAdvisor";

defineProps<{
  items: readonly CareItem[];
}>();
</script>

<template>
  <ul class="flex flex-col gap-2">
    <li
      v-for="item in items"
      :key="item.id"
      class="flex items-start gap-3 rounded-2xl p-3 ring-1"
      :class="
        item.category === 'safety'
          ? 'bg-amber-50 ring-amber-200/80 dark:bg-amber-500/10 dark:ring-amber-500/25'
          : 'bg-slate-50 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60'
      "
    >
      <span class="mt-0.5 text-lg leading-6" aria-hidden="true">{{ item.icon }}</span>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">{{ item.categoryLabel }}</span>
        <span class="text-sm leading-6 text-slate-800 dark:text-slate-100">{{ item.text }}</span>
      </span>
    </li>
  </ul>
</template>
