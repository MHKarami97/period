<script setup lang="ts">
const props = defineProps<{
  label: string;
  modelValue: number;
  min: number;
  max: number;
}>();

const emit = defineEmits<{ (event: "update:modelValue", value: number): void }>();

const STEPPER_BUTTON =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-900 transition hover:bg-slate-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700";

function commit(value: number): number {
  const clamped = Number.isNaN(value) ? props.modelValue : Math.min(props.max, Math.max(props.min, Math.round(value)));
  emit("update:modelValue", clamped);
  return clamped;
}

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  input.value = String(commit(input.valueAsNumber));
}
</script>

<template>
  <div class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
    <span class="flex items-center gap-1"><slot name="icon" />{{ label }}</span>
    <div class="flex items-center gap-2" dir="ltr">
      <button type="button" :class="STEPPER_BUTTON" :disabled="modelValue <= min" :aria-label="`کم کردن ${label}`" @click="commit(modelValue - 1)">−</button>
      <input
        :value="modelValue"
        type="number"
        inputmode="numeric"
        :min="min"
        :max="max"
        :aria-label="label"
        class="h-10 min-w-0 flex-1 rounded-lg bg-slate-100 px-2 text-center text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
        @change="onChange"
      />
      <button type="button" :class="STEPPER_BUTTON" :disabled="modelValue >= max" :aria-label="`زیاد کردن ${label}`" @click="commit(modelValue + 1)">+</button>
    </div>
    <span class="text-[11px] opacity-70">از {{ min }} تا {{ max }}</span>
  </div>
</template>
