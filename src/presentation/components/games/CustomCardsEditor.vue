<script setup lang="ts">
import { ref } from "vue";
import type { CardOption, CustomCardItem } from "./customCardTypes";

const props = defineProps<{
  options: readonly CardOption[];
  items: readonly CustomCardItem[];
  maxLength: number;
  /** Returns an error message, or null when the card was accepted. */
  tryAdd: (categoryValue: string, text: string) => string | null;
}>();

const emit = defineEmits<{ (event: "remove", id: string): void }>();

const selected = ref(props.options[0]?.value ?? "");
const text = ref("");
const errorMessage = ref<string | null>(null);

function submit(): void {
  const error = props.tryAdd(selected.value, text.value);
  errorMessage.value = error;
  if (error === null) {
    text.value = "";
  }
}
</script>

<template>
  <section class="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">کارت‌های خودتان</h2>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs transition"
        :class="selected === option.value ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
        @click="selected = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <textarea
      v-model="text"
      rows="2"
      :maxlength="maxLength"
      class="w-full resize-none rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
    />
    <p v-if="errorMessage" class="text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ errorMessage }}</p>
    <button type="button" class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="submit">افزودن کارت</button>

    <ul v-if="items.length" class="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
      <li v-for="item in items" :key="item.id" class="flex items-start justify-between gap-3 py-2 text-sm">
        <span class="flex flex-col gap-1 text-slate-700 dark:text-slate-200">
          <span class="text-[11px] text-slate-400">{{ item.label }}</span>
          {{ item.text }}
        </span>
        <button type="button" class="shrink-0 rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-500/10" @click="emit('remove', item.id)">
          حذف
        </button>
      </li>
    </ul>
  </section>
</template>
