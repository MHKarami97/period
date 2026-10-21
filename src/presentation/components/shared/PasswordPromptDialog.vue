<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { validateNewSecret } from "@domain/security/SecretPolicy";
import type { PasswordField } from "./passwordFields";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message?: string;
    fields: readonly PasswordField[];
    confirmLabel?: string;
    busy?: boolean;
    error?: string | null;
    danger?: boolean;
  }>(),
  { message: "", confirmLabel: "تأیید", busy: false, error: null, danger: false },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "submit", values: Record<string, string>): void;
}>();

const values = reactive<Record<string, string>>({});
const localError = ref<string | null>(null);

const shownError = computed(() => localError.value ?? props.error);

function reset(): void {
  for (const field of props.fields) values[field.key] = "";
  localError.value = null;
}

function validate(): string | null {
  const newField = props.fields.find((field) => field.role === "new");
  for (const field of props.fields) {
    if (!values[field.key]) return `«${field.label}» را وارد کنید.`;
  }
  if (newField) {
    const problem = validateNewSecret(values[newField.key]);
    if (problem) return problem;
    const confirmField = props.fields.find((field) => field.role === "confirm");
    if (confirmField && values[confirmField.key] !== values[newField.key]) return "تکرار رمز با رمز جدید یکی نیست.";
  }
  return null;
}

function submit(): void {
  localError.value = validate();
  if (!localError.value) emit("submit", { ...values });
}

function close(): void {
  emit("update:modelValue", false);
}

watch(() => props.modelValue, (isOpen) => { if (isOpen) reset(); }, { immediate: true });
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" @click.self="close">
      <form class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" @submit.prevent="submit">
        <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
        <p v-if="message" class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ message }}</p>

        <label v-for="field in fields" :key="field.key" class="mt-3 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
          {{ field.label }}
          <input
            v-model="values[field.key]"
            type="password"
            :autocomplete="field.role === 'current' ? 'current-password' : 'new-password'"
            class="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            dir="ltr"
          />
        </label>

        <p v-if="shownError" class="mt-3 text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ shownError }}</p>

        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" :disabled="busy" @click="close">انصراف</button>
          <button
            type="submit"
            class="rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            :class="danger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-teal-500/90 hover:bg-teal-500'"
            :disabled="busy"
          >
            {{ busy ? "لطفاً صبر کنید..." : confirmLabel }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
