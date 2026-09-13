<script setup lang="ts">
/**
 * ConfirmDialog - small reusable modal for any destructive or
 * state-changing action that needs explicit user confirmation (logout,
 * data reset, etc.). Kept generic and content-agnostic (title/message via
 * props) so it is not tied to any single feature.
 */
withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  }>(),
  {
    confirmLabel: "تأیید",
    cancelLabel: "انصراف",
    danger: false,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "confirm"): void;
}>();

function close(): void {
  emit("update:modelValue", false);
}

function confirm(): void {
  emit("confirm");
  close();
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" @click.self="close">
      <div class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ message }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" @click="close">
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium text-white"
            :class="danger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-teal-500/90 hover:bg-teal-500'"
            @click="confirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
