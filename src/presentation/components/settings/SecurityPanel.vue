<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useLockStore } from "@application/stores/lockStore";
import { MIN_SECRET_LENGTH } from "@domain/security/SecretPolicy";
import { readStorageStatus, requestPersistentStorage, type StorageStatus } from "@infrastructure/security/StoragePersistence";
import { vaultService } from "@infrastructure/security/VaultService";
import PasswordPromptDialog from "@presentation/components/shared/PasswordPromptDialog.vue";
import type { PasswordField } from "@presentation/components/shared/passwordFields";
import { useToast } from "@presentation/composables/useToast";

type DialogMode = "enable" | "disable" | "change" | "passkey";

const DIALOGS: Readonly<Record<DialogMode, { title: string; message: string; confirmLabel: string; danger: boolean; fields: readonly PasswordField[] }>> = {
  enable: {
    title: "فعال‌سازی قفل برنامه",
    message: `یک رمز یا PIN حداقل ${MIN_SECRET_LENGTH.toLocaleString("fa-IR")} نویسه انتخاب کنید. رمز ذخیره نمی‌شود و قابل بازیابی نیست؛ اگر فراموشش کنید فقط بکاپ رمزدار کمک می‌کند.`,
    confirmLabel: "فعال‌سازی و رمزنگاری",
    danger: false,
    fields: [
      { key: "secret", label: "رمز جدید", role: "new" },
      { key: "confirm", label: "تکرار رمز", role: "confirm" },
    ],
  },
  disable: {
    title: "غیرفعال‌سازی قفل",
    message: "داده‌های همدل دوباره بدون رمزنگاری ذخیره می‌شوند. برای تأیید، رمز فعلی را وارد کنید.",
    confirmLabel: "غیرفعال‌سازی",
    danger: true,
    fields: [{ key: "current", label: "رمز فعلی", role: "current" }],
  },
  change: {
    title: "تغییر رمز",
    message: "داده‌ها دوباره رمزنگاری نمی‌شوند؛ فقط کلید آن‌ها با رمز جدید محافظت می‌شود.",
    confirmLabel: "تغییر رمز",
    danger: false,
    fields: [
      { key: "current", label: "رمز فعلی", role: "current" },
      { key: "secret", label: "رمز جدید", role: "new" },
      { key: "confirm", label: "تکرار رمز جدید", role: "confirm" },
    ],
  },
  passkey: {
    title: "فعال‌سازی ورود با حسگر اثرانگشت",
    message: "رمز فعلی برنامه را وارد کنید و سپس برای تأیید، انگشت خود را روی حسگر اثرانگشت قرار دهید.",
    confirmLabel: "تأیید و فعال‌سازی اثرانگشت",
    danger: false,
    fields: [{ key: "current", label: "رمز فعلی", role: "current" }],
  },
};

const lockStore = useLockStore();
const { showToast } = useToast();

const mode = ref<DialogMode>("enable");
const isDialogOpen = ref(false);
const isPasskeySupported = ref(false);
const storage = ref<StorageStatus | null>(null);

const dialog = computed(() => DIALOGS[mode.value]);
const progressPercent = computed(() =>
  lockStore.progress && lockStore.progress.total > 0 ? Math.round((lockStore.progress.done / lockStore.progress.total) * 100) : 0,
);
const formatNumber = (value: number): string => value.toLocaleString("fa-IR");

function formatMegabytes(bytes: number | null): string {
  return bytes === null ? "—" : `${formatNumber(Math.round((bytes / (1024 * 1024)) * 10) / 10)} مگابایت`;
}

function openDialog(next: DialogMode): void {
  mode.value = next;
  lockStore.error = null;
  isDialogOpen.value = true;
}

async function submit(values: Record<string, string>): Promise<void> {
  const actions: Record<DialogMode, () => Promise<boolean>> = {
    enable: () => lockStore.enable(values.secret),
    disable: () => lockStore.disable(values.current),
    change: () => lockStore.changeSecret(values.current, values.secret),
    passkey: () => lockStore.enablePasskey(values.current),
  };
  if (await actions[mode.value]()) {
    isDialogOpen.value = false;
    showToast("انجام شد", 1500);
    storage.value = await readStorageStatus();
  }
}

async function askPersistence(): Promise<void> {
  const granted = await requestPersistentStorage();
  storage.value = await readStorageStatus();
  showToast(granted ? "ذخیره‌سازی پایدار فعال شد" : "سیستم درخواست را نپذیرفت", 2000);
}

async function encryptAgain(): Promise<void> {
  if (await lockStore.encryptAgain()) showToast("همه‌ی داده‌ها رمزنگاری شدند", 2000);
}

onMounted(async () => {
  isPasskeySupported.value = await vaultService.isPasskeySupported();
  storage.value = await readStorageStatus();
});
</script>

<template>
  <section class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">قفل و رمزنگاری</h2>
        <p class="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
          با قفل، یادداشت‌ها و عکس‌های همدل با AES-256-GCM رمزنگاری می‌شوند و بدون رمز خوانده نمی‌شوند.
        </p>
      </div>
      <span class="shrink-0 rounded-full px-2.5 py-1 text-xs" :class="lockStore.isEnabled ? 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'">
        {{ lockStore.isEnabled ? "فعال" : "غیرفعال" }}
      </span>
    </div>

    <div v-if="lockStore.progress" class="flex flex-col gap-1" aria-live="polite">
      <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" dir="ltr">
        <div class="h-full rounded-full bg-teal-500 transition-[width]" :style="{ width: `${progressPercent}%` }" />
      </div>
      <span class="text-xs text-slate-500 dark:text-slate-400">در حال تبدیل داده‌ها... {{ formatNumber(progressPercent) }}٪</span>
    </div>

    <template v-if="!lockStore.isEnabled">
      <button type="button" class="rounded-xl bg-teal-500/90 px-4 py-3 text-sm font-medium text-white hover:bg-teal-500" @click="openDialog('enable')">فعال‌سازی قفل با رمز</button>
    </template>

    <template v-else>
      <button type="button" class="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="lockStore.lock()">🔒 همین حالا قفل کن</button>

      <label class="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        قفل خودکار
        <select
          class="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          :value="lockStore.autoLockMinutes"
          @change="lockStore.setAutoLockMinutes(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="option in lockStore.autoLockOptions" :key="option.minutes" :value="option.minutes">{{ option.label }}</option>
        </select>
      </label>

      <div class="flex flex-wrap gap-2">
        <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200" @click="openDialog('change')">تغییر رمز</button>
        <button type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200" :disabled="lockStore.isBusy" @click="encryptAgain">رمزنگاری مجدد داده‌ها</button>
        <button type="button" class="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-600 hover:bg-rose-500/20 dark:text-rose-300" @click="openDialog('disable')">غیرفعال‌سازی قفل</button>
      </div>

      <div class="rounded-xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                <path d="M2 12a10 10 0 0 1 18-6" />
                <path d="M2 16h.01" />
                <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
              </svg>
            </span>
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-slate-100">ورود با حسگر اثرانگشت</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">باز کردن سریع قفل با حسگر دستگاه بدون نیاز به وارد کردن هر باره‌ی رمز</p>
            </div>
          </div>
          <span
            v-if="lockStore.hasPasskey"
            class="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-600 dark:bg-teal-500/20 dark:text-teal-300"
          >
            فعال
          </span>
        </div>

        <template v-if="lockStore.hasPasskey">
          <p class="mt-2.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
            حسگر اثرانگشت برای این دستگاه فعال است. در صفحه قفل می‌توانید مستقیماً با لمس حسگر اثرانگشت وارد شوید.
          </p>
          <button
            type="button"
            class="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-500/20 dark:text-rose-300"
            @click="lockStore.disablePasskey()"
          >
            غیرفعال‌سازی اثرانگشت
          </button>
        </template>
        <template v-else-if="isPasskeySupported">
          <p class="mt-2.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
            با فعال کردن این بخش، می‌توانید با حسگر اثرانگشت گوشی یا سیستم خود سریعاً قفل ماهک را باز کنید.
          </p>
          <button
            type="button"
            class="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-500/90 px-3.5 py-2 text-xs font-medium text-white hover:bg-teal-500"
            @click="openDialog('passkey')"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
              <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
              <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
              <path d="M2 12a10 10 0 0 1 18-6" />
              <path d="M2 16h.01" />
              <path d="M21.8 16c.2-2 .131-5.354 0-6" />
              <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
              <path d="M8.65 22c.21-.66.45-1.32.57-2" />
              <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
            </svg>
            <span>فعال‌سازی حسگر اثرانگشت</span>
          </button>
        </template>
        <p v-else class="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
          حسگر اثرانگشت در این دستگاه یا مرورگر در دسترس نیست یا پشتیبانی نمی‌شود.
        </p>
      </div>
    </template>

    <p v-if="lockStore.error && !isDialogOpen" class="text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ lockStore.error }}</p>

    <div class="flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <p class="leading-6">
        <strong class="font-medium text-slate-700 dark:text-slate-200">چه چیزی رمز می‌شود؟</strong>
        متن همه‌ی یادداشت‌های همدل و عکس‌ها. تاریخ پریودها و علائم، نام پروفایل‌ها و تاریخ یادداشت‌ها برای جست‌وجو و نمودار رمز نمی‌شوند؛ ولی با قفل، رابط برنامه بدون رمز باز نمی‌شود.
      </p>
      <p class="leading-6">یک رمز کوتاه فقط جلوی دسترسی معمولی را می‌گیرد. اگر کسی فایل‌های سیستم را کپی کند، حدس زدن رمزهای کوتاه ممکن است؛ رمز بلندتر (عبارت) امن‌تر است.</p>
    </div>

    <div class="flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
      <div class="flex items-center justify-between gap-2">
        <span class="text-sm text-slate-900 dark:text-slate-100">ذخیره‌سازی پایدار</span>
        <span v-if="storage" class="rounded-full px-2.5 py-1 text-xs" :class="storage.isPersisted ? 'bg-teal-500/10 text-teal-600 dark:text-teal-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'">
          {{ !storage.isSupported ? "پشتیبانی نمی‌شود" : storage.isPersisted ? "فعال" : "فعال نیست" }}
        </span>
      </div>
      <p class="text-xs leading-6 text-slate-500 dark:text-slate-400">
        اگر فعال باشد، سیستم هنگام کمبود فضا داده‌های برنامه را پاک نمی‌کند.
        <template v-if="storage?.usageBytes !== null && storage?.usageBytes !== undefined">حجم استفاده‌شده: {{ formatMegabytes(storage.usageBytes) }} از {{ formatMegabytes(storage.quotaBytes) }}.</template>
      </p>
      <button v-if="storage?.isSupported && !storage.isPersisted" type="button" class="w-fit rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200" @click="askPersistence">درخواست ذخیره‌سازی پایدار</button>
    </div>

    <PasswordPromptDialog
      v-model="isDialogOpen"
      :title="dialog.title"
      :message="dialog.message"
      :fields="dialog.fields"
      :confirm-label="dialog.confirmLabel"
      :danger="dialog.danger"
      :busy="lockStore.isBusy"
      :error="lockStore.error"
      @submit="submit"
    />
  </section>
</template>
