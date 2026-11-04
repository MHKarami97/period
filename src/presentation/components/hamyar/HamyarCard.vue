<script setup lang="ts">
import { computed } from "vue";
import type { HamyarGuideMeta } from "@domain/hamyar/HamyarGuide";
import { useHamyarStore } from "@application/stores/hamyarStore";

const props = defineProps<{
  guide: HamyarGuideMeta;
}>();

const emit = defineEmits<{
  (event: "open", guide: HamyarGuideMeta): void;
}>();

const hamyarStore = useHamyarStore();
const completion = computed(() => hamyarStore.getGuideCompletion(props.guide.id));
</script>

<template>
  <button
    type="button"
    class="group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 text-right shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800"
    :class="guide.colorClass.border"
    @click="emit('open', guide)"
  >
    <div class="flex w-full items-start gap-4">
      <!-- Icon Container -->
      <span
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-105"
        :class="[guide.colorClass.bg, guide.colorClass.text]"
      >
        {{ guide.icon }}
      </span>

      <!-- Content -->
      <div class="flex flex-1 flex-col gap-1.5 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
            :class="guide.colorClass.badge"
          >
            {{ guide.tag }}
          </span>
          <span class="text-xs text-slate-400 dark:text-slate-500">
            {{ guide.categoryLabel }}
          </span>
        </div>

        <h3 class="text-base font-bold text-slate-900 transition-colors group-hover:text-teal-600 dark:text-slate-100 dark:group-hover:text-teal-400 line-clamp-1">
          {{ guide.shortTitle }}
        </h3>

        <p class="text-xs leading-5 text-slate-500 dark:text-slate-400 line-clamp-2">
          {{ guide.summary }}
        </p>
      </div>
    </div>

    <!-- Bottom metadata & actions -->
    <div class="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
      <div class="flex items-center gap-2">
        <span v-if="completion.total > 0 && completion.completed > 0" class="flex items-center gap-1.5 font-medium text-teal-600 dark:text-teal-400">
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
          {{ completion.percentage }}٪ تکمیل شده
        </span>
        <span v-else class="text-slate-400 dark:text-slate-500">
          راهنمای جامع مراحل
        </span>
      </div>

      <span class="flex items-center gap-1 font-medium text-slate-600 group-hover:text-teal-600 dark:text-slate-300 dark:group-hover:text-teal-400">
        مشاهده راهنما
        <svg class="h-4 w-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
        </svg>
      </span>
    </div>
  </button>
</template>
