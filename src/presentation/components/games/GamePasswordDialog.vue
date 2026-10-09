<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

const props = defineProps<{ modelValue: boolean; errorMessage: string | null }>();
const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "submit", password: string): void;
}>();

const password = ref("");
const inputElement = ref<HTMLInputElement | null>(null);

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) return;
    password.value = "";
    await nextTick();
    inputElement.value?.focus();
  },
);

function close(): void {
  emit("update:modelValue", false);
}

function submit(): void {
  emit("submit", password.value);
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" @click.self="close">
      <form
        class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        @submit.prevent="submit"
      >
        <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">ورود به بازی‌ها</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">برای ورود، رمز را وارد کنید.</p>

        <input
          ref="inputElement"
          v-model="password"
          type="password"
          autocomplete="off"
          dir="ltr"
          placeholder="رمز"
          class="mt-4 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
        />
        <p v-if="errorMessage" class="mt-2 text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ errorMessage }}</p>

        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="close"
          >
            انصراف
          </button>
          <button type="submit" class="rounded-lg bg-teal-500/90 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500">
            ورود
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
