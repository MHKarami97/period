<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  title: string;
  items: readonly string[];
  placeholder?: string;
  /** Returns an error message, or null when the item was accepted. */
  tryAdd: (text: string) => string | null;
}>();

const emit = defineEmits<{ (event: "remove", index: number): void }>();

const draft = ref("");
const errorMessage = ref<string | null>(null);

function submit(): void {
  const error = props.tryAdd(draft.value);
  errorMessage.value = error;
  if (error === null) {
    draft.value = "";
  }
}
</script>

<template>
  <section class="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ title }} <span class="text-xs font-normal text-slate-400">({{ items.length }})</span></h3>

    <ul class="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
      <li
        v-for="(item, index) in items"
        :key="item"
        class="flex items-center gap-1 rounded-full bg-slate-100 py-1 pe-1 ps-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        {{ item }}
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-rose-500 dark:hover:bg-slate-700"
          :aria-label="`حذف ${item}`"
          @click="emit('remove', index)"
        >
          ✕
        </button>
      </li>
    </ul>

    <form class="flex items-center gap-2" @submit.prevent="submit">
      <input
        v-model="draft"
        type="text"
        :placeholder="placeholder"
        class="min-w-0 flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
      />
      <button type="submit" class="rounded-lg bg-teal-500/90 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500">افزودن</button>
    </form>
    <p v-if="errorMessage" class="text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ errorMessage }}</p>
  </section>
</template>
