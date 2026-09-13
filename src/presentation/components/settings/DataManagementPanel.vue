<script setup lang="ts">
import { ref } from "vue";
import { useDataManagement } from "@presentation/composables/useDataManagement";

const { exportJson, importJson, downloadSixMonthPdf } = useDataManagement();
const fileInput = ref<HTMLInputElement | null>(null);
const feedback = ref<string | null>(null);

async function handleImportChange(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    await importJson(file);
    feedback.value = "داده‌ها با موفقیت بازیابی شدند.";
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : "خطا در ایمپورت فایل.";
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">مدیریت داده‌ها</h2>

    <button type="button" class="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="exportJson">
      خروجی گرفتن از کل داده‌ها (JSON)
    </button>

    <button type="button" class="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="fileInput?.click()">
      ایمپورت از فایل JSON
    </button>
    <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleImportChange" />

    <button type="button" class="rounded-xl bg-teal-500/90 px-4 py-3 text-sm font-medium text-white hover:bg-teal-500" @click="downloadSixMonthPdf">
      دریافت گزارش PDF (۶ ماه اخیر)
    </button>

    <p v-if="feedback" class="text-xs text-slate-500 dark:text-slate-400">{{ feedback }}</p>
  </div>
</template>
