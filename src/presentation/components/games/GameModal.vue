<script setup lang="ts">
/**
 * GameModal - small blocking modal used for challenges and results.
 * It deliberately has no "click outside to close": the player must pick an action.
 */
defineProps<{
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel?: string;
}>();

const emit = defineEmits<{
  (event: "primary"): void;
  (event: "secondary"): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
        <p class="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{{ message }}</p>
        <div class="mt-5 flex flex-wrap justify-end gap-2">
          <button
            v-if="secondaryLabel"
            type="button"
            class="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="emit('secondary')"
          >
            {{ secondaryLabel }}
          </button>
          <button
            type="button"
            class="rounded-lg bg-teal-500/90 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500"
            @click="emit('primary')"
          >
            {{ primaryLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
