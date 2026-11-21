<script setup lang="ts">
import { computed } from "vue";
import type { HamyarGuideMeta } from "@domain/hamyar/HamyarGuide";
import { useHamyarStore } from "@application/stores/hamyarStore";
import AppIcon from "@presentation/components/common/AppIcon.vue";

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
    class="group relative flex w-full flex-col justify-between overflow-hidden rounded-3xl bg-white p-5 text-right shadow-sm ring-1 ring-slate-200/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.985] dark:bg-slate-900 dark:ring-slate-800"
    :class="guide.colorClass.border"
    @click="emit('open', guide)"
  >
    <div class="flex w-full items-start gap-4">
      <!-- SVG Icon Container -->
      <span
        class="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-xs"
        :class="[guide.colorClass.bg, guide.colorClass.text]"
      >
        <AppIcon :name="guide.id" size="lg" filled />
      </span>

      <!-- Content -->
      <div class="flex flex-1 flex-col gap-1.5 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold"
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

    <!-- Bottom Footer (Checklist Progress or Arrow) -->
    <div class="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
      <div v-if="completion.total > 0" class="flex items-center gap-2 text-xs">
        <div class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            class="h-full rounded-full bg-teal-500 transition-all duration-300 dark:bg-teal-400"
            :style="{ width: `${completion.percentage}%` }"
          ></div>
        </div>
        <span class="text-[11px] text-slate-400">
          {{ completion.completed }} از {{ completion.total }} ({{ completion.percentage }}٪)
        </span>
      </div>
      <div v-else class="text-[11px] text-slate-400">
        راهنمای تعاملی و چندمرحله‌ای
      </div>

      <span class="text-xs font-semibold text-teal-600 group-hover:underline dark:text-teal-400 transition-transform duration-200 group-hover:-translate-x-1">
        مشاهده راهنما ←
      </span>
    </div>
  </button>
</template>
