<script setup lang="ts">
import { ref } from "vue";
import { useAccessStore } from "@application/stores/accessStore";
import { useToast } from "@presentation/composables/useToast";

const accessStore = useAccessStore();
const { showToast } = useToast();

const password = ref("");
const errorMessage = ref<string | null>(null);

function unlock(): void {
  if (accessStore.tryUnlock(password.value)) {
    errorMessage.value = null;
    showToast("بخش‌های قفل‌دار باز شد.", 1500);
  } else {
    errorMessage.value = "رمز نادرست است.";
  }
  password.value = "";
}

function clearPassword(): void {
  accessStore.lock();
  errorMessage.value = null;
  showToast("رمز پاک شد و بخش‌های قفل‌دار مخفی شدند.", 1800);
}
</script>

<template>
  <section class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">رمز بخش بازی‌ها</h2>
      <span
        class="rounded-full px-2.5 py-1 text-xs"
        :class="
          accessStore.isUnlocked
            ? 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        "
      >
        {{ accessStore.isUnlocked ? "باز است" : "قفل است" }}
      </span>
    </div>

    <p class="text-xs leading-6 text-slate-500 dark:text-slate-400">
      گفتگوی عمیق بدون رمز در دسترس است. بقیه بازی‌ها و بخش‌های اختصاصی فقط بعد از وارد کردن رمز نمایش داده می‌شوند.
    </p>

    <button
      v-if="accessStore.isUnlocked"
      type="button"
      class="rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
      @click="clearPassword"
    >
      پاک کردن رمز
    </button>

    <form v-else class="flex flex-col gap-3" @submit.prevent="unlock">
      <input
        v-model="password"
        type="password"
        autocomplete="off"
        dir="ltr"
        placeholder="رمز"
        class="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
      />
      <p v-if="errorMessage" class="text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">
        {{ errorMessage }}
      </p>
      <button
        type="submit"
        class="rounded-xl bg-teal-500/90 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500"
      >
        باز کردن
      </button>
    </form>
  </section>
</template>
