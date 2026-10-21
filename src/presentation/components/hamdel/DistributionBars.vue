<script setup lang="ts">
import { computed } from "vue";
import type { CountItem } from "@domain/hamdel/hamdelStats";

const props = withDefaults(defineProps<{ title: string; items: readonly CountItem[]; barClass?: string; hideEmpty?: boolean }>(), {
  barClass: "bg-teal-400",
  hideEmpty: false,
});

const total = computed(() => props.items.reduce((sum, item) => sum + item.count, 0));
const visibleItems = computed(() => (props.hideEmpty ? props.items.filter((item) => item.count > 0) : props.items));
const formatNumber = (value: number): string => value.toLocaleString("fa-IR");

function percentOf(count: number): number {
  return total.value === 0 ? 0 : Math.round((count / total.value) * 100);
}
</script>

<template>
  <section v-if="total > 0" class="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
    <ul class="flex flex-col gap-2">
      <li v-for="item in visibleItems" :key="item.value" class="flex flex-col gap-1">
        <div class="flex justify-between text-xs text-slate-600 dark:text-slate-300">
          <span>{{ item.label }}</span>
          <span>{{ formatNumber(item.count) }} ({{ formatNumber(percentOf(item.count)) }}٪)</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" dir="ltr">
          <div class="h-full rounded-full" :class="barClass" :style="{ width: `${percentOf(item.count)}%` }" />
        </div>
      </li>
    </ul>
  </section>
</template>
