<script setup lang="ts">
import { usePositionsStore } from "@application/stores/positionsStore";

const store = usePositionsStore();
</script>

<template>
  <section class="flex max-h-96 flex-col gap-4 overflow-y-auto p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div v-for="group in store.facetGroups" :key="group.key" class="flex flex-col gap-2">
      <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ group.label }}</h3>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="option in group.options"
          :key="option.value"
          type="button"
          class="rounded-full px-3 py-1 text-xs transition"
          :class="store.filter.isSelected(group.key, option.value) ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
          :aria-pressed="store.filter.isSelected(group.key, option.value)"
          @click="store.toggleFilter(group.key, option.value)"
        >
          {{ option.label }} <span class="opacity-60">{{ option.count }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
