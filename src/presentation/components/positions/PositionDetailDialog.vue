<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { FACET_KEYS, FACET_LABELS_FA, toDisplayLabel } from "@domain/positions/facets";
import type { Position } from "@domain/positions/Position";
import PositionImage from "./PositionImage.vue";

const props = defineProps<{ position: Position | null; canPickRandom: boolean }>();
const emit = defineEmits<{
  (event: "close"): void;
  (event: "random"): void;
}>();

const scroller = ref<HTMLElement | null>(null);

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && props.position) emit("close");
}

onMounted(() => window.addEventListener("keydown", onKeydown));

watch(
  () => props.position,
  (position) => {
    document.body.style.overflow = position ? "hidden" : "";
    scroller.value?.scrollTo({ top: 0 });
  },
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="position"
      class="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="position.title"
      @click.self="emit('close')"
    >
      <article class="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-slate-900 sm:rounded-2xl">
        <header class="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100" dir="auto">{{ position.title }}</h2>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            @click="emit('close')"
          >
            بستن ✕
          </button>
        </header>

        <div ref="scroller" class="flex flex-col gap-4 overflow-y-auto p-4">
          <div v-if="position.image" :key="position.id" class="h-80 w-full shrink-0 overflow-hidden rounded-xl sm:h-[26rem]">
            <PositionImage :position="position" eager />
          </div>

          <template v-for="key in FACET_KEYS" :key="key">
            <div v-if="position.facetValues(key).length" class="flex flex-col gap-1.5">
              <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ FACET_LABELS_FA[key] }}</h3>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="value in position.facetValues(key)"
                  :key="value"
                  class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {{ toDisplayLabel(value) }}
                </span>
              </div>
            </div>
          </template>

          <p v-if="position.content" class="whitespace-pre-line text-sm leading-8 text-slate-700 dark:text-slate-200">{{ position.content }}</p>
        </div>

        <footer v-if="canPickRandom" class="border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            type="button"
            class="w-full rounded-xl bg-rose-500/90 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-500"
            @click="emit('random')"
          >
            🎲 یک پوزیشن تصادفی دیگر
          </button>
        </footer>
      </article>
    </div>
  </Teleport>
</template>
