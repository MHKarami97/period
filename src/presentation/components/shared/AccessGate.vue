<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { useAccessStore } from "@application/stores/accessStore";

defineProps<{ message: string }>();

const ACCESS_DENIED_MESSAGE = "دسترسی ندارید.";

const accessStore = useAccessStore();
const password = ref("");
const errorMessage = ref<string | null>(null);
const passwordInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await nextTick();
  passwordInput.value?.focus();
});

function submit(): void {
  if (accessStore.tryUnlock(password.value)) {
    errorMessage.value = null;
  } else {
    errorMessage.value = ACCESS_DENIED_MESSAGE;
  }
  password.value = "";
}
</script>

<template>
  <form
    class="mx-auto flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 p-5"
    @submit.prevent="submit"
  >
    <p class="text-sm text-slate-600 dark:text-slate-300">{{ message }}</p>
    <input
      ref="passwordInput"
      v-model="password"
      type="password"
      autocomplete="off"
      dir="ltr"
      placeholder="رمز"
      class="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
    />
    <p v-if="errorMessage" class="text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ errorMessage }}</p>
    <button type="submit" class="rounded-xl bg-teal-500/90 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500">ورود</button>
    <p class="text-center text-[11px] text-slate-400 dark:text-slate-500">رمز فقط یک بار پرسیده می‌شود و روی همین دستگاه می‌ماند.</p>
  </form>
</template>
