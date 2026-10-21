<script setup lang="ts">
import { ref } from "vue";
import PasswordPromptDialog from "@presentation/components/shared/PasswordPromptDialog.vue";
import type { PasswordField } from "@presentation/components/shared/passwordFields";
import { useDataManagement } from "@presentation/composables/useDataManagement";

const EXPORT_FIELDS: readonly PasswordField[] = [
  { key: "secret", label: "رمز بکاپ", role: "new" },
  { key: "confirm", label: "تکرار رمز", role: "confirm" },
];
const IMPORT_FIELDS: readonly PasswordField[] = [{ key: "secret", label: "رمز بکاپ", role: "current" }];

const { exportJson, exportEncryptedJson, readBackupFile, importBackupText, downloadSixMonthPdf } = useDataManagement();
const fileInput = ref<HTMLInputElement | null>(null);
const feedback = ref<string | null>(null);

const isExportDialogOpen = ref(false);
const isImportDialogOpen = ref(false);
const isBusy = ref(false);
const dialogError = ref<string | null>(null);
let pendingBackupText: string | null = null;

async function submitExport(values: Record<string, string>): Promise<void> {
  isBusy.value = true;
  dialogError.value = null;
  try {
    await exportEncryptedJson(values.secret);
    isExportDialogOpen.value = false;
    feedback.value = "بکاپ رمزنگاری‌شده ذخیره شد. رمز آن را جایی امن نگه دارید؛ قابل بازیابی نیست.";
  } catch (error) {
    dialogError.value = error instanceof Error ? error.message : "ساخت بکاپ ناموفق بود.";
  } finally {
    isBusy.value = false;
  }
}

async function restore(text: string, password?: string): Promise<boolean> {
  try {
    await importBackupText(text, password);
    feedback.value = "داده‌ها با موفقیت بازیابی شدند.";
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطا در ایمپورت فایل.";
    if (isImportDialogOpen.value) dialogError.value = message;
    else feedback.value = message;
    return false;
  }
}

async function handleImportChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  try {
    const { text, isEncrypted } = await readBackupFile(file);
    if (isEncrypted) {
      pendingBackupText = text;
      dialogError.value = null;
      isImportDialogOpen.value = true;
      return;
    }
    await restore(text);
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : "خطا در ایمپورت فایل.";
  }
}

async function submitImport(values: Record<string, string>): Promise<void> {
  if (pendingBackupText === null) return;
  isBusy.value = true;
  dialogError.value = null;
  const isRestored = await restore(pendingBackupText, values.secret);
  isBusy.value = false;
  if (isRestored) {
    isImportDialogOpen.value = false;
    pendingBackupText = null;
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">مدیریت داده‌ها</h2>

    <button type="button" class="rounded-xl bg-teal-500/90 px-4 py-3 text-sm font-medium text-white hover:bg-teal-500" @click="dialogError = null; isExportDialogOpen = true">
      بکاپ رمزنگاری‌شده از کل داده‌ها (پیشنهادی)
    </button>

    <button type="button" class="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="exportJson">
      خروجی JSON ساده (بدون رمز)
    </button>
    <p class="-mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">فایل ساده همه‌ی یادداشت‌ها را بدون محافظت دارد؛ فقط در جای امن نگه دارید.</p>

    <button type="button" class="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="fileInput?.click()">
      بازیابی از فایل بکاپ (ساده یا رمزنگاری‌شده)
    </button>
    <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="handleImportChange" />

    <button type="button" class="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="downloadSixMonthPdf">
      دریافت گزارش PDF پریود (۶ ماه اخیر)
    </button>

    <p v-if="feedback" class="text-xs leading-6 text-slate-500 dark:text-slate-400" aria-live="polite">{{ feedback }}</p>

    <PasswordPromptDialog
      v-model="isExportDialogOpen"
      title="رمز بکاپ"
      message="بکاپ با این رمز رمزنگاری می‌شود (PBKDF2 + AES-256-GCM). بدون رمز باز نمی‌شود و رمز قابل بازیابی نیست."
      :fields="EXPORT_FIELDS"
      confirm-label="ساخت بکاپ"
      :busy="isBusy"
      :error="dialogError"
      @submit="submitExport"
    />
    <PasswordPromptDialog
      v-model="isImportDialogOpen"
      title="این بکاپ رمزنگاری شده است"
      message="رمز بکاپ را وارد کنید. با بازیابی، داده‌های فعلی جایگزین می‌شوند."
      :fields="IMPORT_FIELDS"
      confirm-label="بازیابی"
      :busy="isBusy"
      :error="dialogError"
      danger
      @submit="submitImport"
    />
  </div>
</template>
