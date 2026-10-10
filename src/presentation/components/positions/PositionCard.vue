<script setup lang="ts">
import { FacetKey, toDisplayLabel } from "@domain/positions/facets";
import type { Position } from "@domain/positions/Position";
import PositionImage from "./PositionImage.vue";

defineProps<{ position: Position }>();
const emit = defineEmits<{ (event: "open", position: Position): void }>();
</script>

<template>
  <button
    type="button"
    class="flex flex-col overflow-hidden text-right transition hover:ring-rose-300 active:scale-[0.99] rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
    @click="emit('open', position)"
  >
    <div class="aspect-[4/5] w-full">
      <PositionImage :position="position" />
    </div>
    <div class="flex flex-col gap-1.5 p-3">
      <h3 class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100" dir="auto">{{ position.title }}</h3>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="value in [...position.facetValues(FacetKey.Complexity), ...position.facetValues(FacetKey.Activity)]"
          :key="value"
          class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {{ toDisplayLabel(value) }}
        </span>
      </div>
    </div>
  </button>
</template>
