<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { CLOUD_CONFIG } from "@infrastructure/cloud/cloudConfig";
import { toUserMessage } from "@infrastructure/cloud/CloudSyncError";
import { useCloudSyncStore } from "@application/stores/cloudSyncStore";
import { useToast } from "@presentation/composables/useToast";

const store = useCloudSyncStore();
const { showToast } = useToast();

const minLength = CLOUD_CONFIG.minPassphraseLength;
const snapshot = computed(() => store.snapshot);
const passphrase = ref("");
const passphraseConfirm = ref("");
const isWorking = ref(false);

onMounted(() => {
  store.preload();
});

const dotClass = computed(() => {
  switch (snapshot.value.status) {
    case "success":
    case "idle":
      return snapshot.value.connected ? "bg-emerald-500" : "bg-slate-400";
    case "syncing":
      return "bg-teal-500 animate-pulse";
    case "needs-reconnect":
    case "decision-pending":
      return "bg-amber-500";
    case "error":
      return "bg-rose-500";
    default:
      return "bg-slate-400";
  }
});

async function run(action: () => Promise<void>, successMessage?: string): Promise<void> {
  isWorking.value = true;
  try {
    await action();
    if (successMessage) showToast(successMessage, 3000);
  } catch (error) {
    showToast(toUserMessage(error), 4000);
  } finally {
    isWorking.value = false;
  }
}

function handleConnect(): Promise<void> {
  return run(() => store.connect(), "اتصال به Google Drive با موفقیت برقرار شد.");
}

function handleBackupNow(): Promise<void> {
  return run(() => store.backupNow(), "پشتیبان‌گیری در Google Drive انجام شد.");
}

async function handleDisconnect(): Promise<void> {
  if (!confirm("اتصال به Google Drive قطع شود؟ پشتیبان‌گیری خودکار متوقف می‌شود.")) return;
  const removeRemote = confirm(
    "آیا فایل‌های پشتیبان موجود در پوشه مخفی Google Drive هم حذف شوند؟\nتأیید = حذف نسخه‌های ابری، لغو = نگه‌داشتن فایل‌ها در Drive",
  );
  await run(() => store.disconnect(removeRemote), "اتصال با موفقیت قطع شد.");
}

async function handleEnableEncryption(): Promise<void> {
  if (passphrase.value.length < minLength) {
    showToast(`رمز عبور باید حداقل ${minLength} نویسه باشد.`, 3000);
    return;
  }
  if (passphrase.value !== passphraseConfirm.value) {
    showToast("رمز عبور و تکرار آن یکسان نیستند.", 3000);
    return;
  }
  await run(async () => {
    await store.enableEncryption(passphrase.value);
    passphrase.value = "";
    passphraseConfirm.value = "";
  }, "رمزنگاری با موفقیت فعال شد.");
}

async function handleDisableEncryption(): Promise<void> {
  if (!confirm("از این پس پشتیبان‌های ابری بدون رمزنگاری ذخیره می‌شوند. آیا ادامه می‌دهید؟")) return;
  await run(() => store.disableEncryption(), "رمزنگاری غیرفعال شد.");
}

async function handleRollback(): Promise<void> {
  if (!confirm("اطلاعات این دستگاه به وضعیت قبل از آخرین بازیابی ابری بازمی‌گردد. آیا ادامه می‌دهید؟")) return;
  await run(() => store.rollbackLastRestore(), "داده‌ها به وضعیت پیش از بازیابی برگشت.");
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 transition-colors">
    <div>
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <svg class="w-5 h-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
        <span>پشتیبان‌گیری خودکار در Google Drive</span>
      </h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
        نسخه‌ی پشتیبان در پوشه‌ی مخفی اختصاصی همین برنامه در Google Drive شخصی شما ذخیره می‌شود و فقط همین برنامه به آن دسترسی دارد.
        پس از هر تغییر در اطلاعات، پشتیبان‌گیری به صورت خودکار انجام خواهد شد.
      </p>
    </div>

    <!-- Status panel -->
    <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1 text-xs">
      <div class="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="dotClass"></span>
        <span>{{ store.statusText }}</span>
      </div>
      <p v-if="store.isConnected && store.lastSuccessText" class="text-[11px] text-slate-500 dark:text-slate-400 pr-4">
        آخرین پشتیبان موفق: {{ store.lastSuccessText }}
      </p>
      <p v-if="store.isConnected && snapshot.status !== 'error' && snapshot.lastError" class="text-[11px] text-rose-500 pr-4">
        {{ snapshot.lastError }}
      </p>
    </div>

    <!-- Main action buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-if="!store.isConnected"
        type="button"
        :disabled="isWorking"
        class="rounded-xl bg-teal-500/90 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-500 active:scale-95 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
        @click="handleConnect"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span>اتصال به Google Drive</span>
      </button>

      <template v-else>
        <button
          v-if="snapshot.status === 'needs-reconnect' || snapshot.status === 'error'"
          type="button"
          :disabled="isWorking"
          class="rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white active:scale-95 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          @click="handleConnect"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span>اتصال دوباره</span>
        </button>

        <button
          v-if="snapshot.decision && snapshot.decision.dismissed"
          type="button"
          class="rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2.5 text-xs font-semibold text-white active:scale-95 shadow-sm transition-all"
          @click="store.reopenDecision()"
        >
          بررسی نسخه‌ی ابری
        </button>

        <button
          type="button"
          :disabled="isWorking || store.isBusy || !!snapshot.decision"
          class="rounded-xl bg-teal-500/90 hover:bg-teal-500 px-4 py-2.5 text-xs font-semibold text-white active:scale-95 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          @click="handleBackupNow"
        >
          <svg class="w-4 h-4" :class="store.isBusy ? 'animate-spin' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span>پشتیبان‌گیری همین حالا</span>
        </button>

        <button
          type="button"
          :disabled="isWorking"
          class="rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          @click="handleDisconnect"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="m5.16 11.75-1.72 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
          <span>قطع اتصال</span>
        </button>
      </template>
    </div>

    <!-- Encryption subpanel -->
    <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 text-xs">
      <h3 class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>رمزنگاری پشتیبان ابری (اختیاری)</span>
      </h3>

      <template v-if="snapshot.encryptionEnabled">
        <p class="text-[11px] text-emerald-600 dark:text-emerald-400 leading-relaxed">
          رمزنگاری سرتاسری فعال است؛ اطلاعات پیش از خروج با AES-GCM و کلید اختصاصی روی این دستگاه رمز می‌شوند.
        </p>
        <button
          type="button"
          :disabled="isWorking"
          class="text-[11px] text-rose-500 hover:underline font-medium disabled:opacity-50"
          @click="handleDisableEncryption"
        >
          غیرفعال‌سازی رمزنگاری
        </button>
      </template>

      <template v-else>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          بدون رمزنگاری، محتوا به صورت استاندارد در Google Drive شما قرار می‌گیرد. با رمزنگاری، فایل‌ها با کلید مشتق‌شده از گذرواژه شما قفل می‌شوند.
          <span class="font-semibold text-rose-500">رمز قابل بازیابی نیست؛ با فراموشی آن، امکان بازگشایی پشتیبان ابری وجود نخواهد داشت.</span>
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            v-model="passphrase"
            type="password"
            autocomplete="new-password"
            :placeholder="`رمز (حداقل ${minLength} نویسه)`"
            class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-slate-900 dark:text-slate-100"
          />
          <input
            v-model="passphraseConfirm"
            type="password"
            autocomplete="new-password"
            placeholder="تکرار رمز"
            class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-slate-900 dark:text-slate-100"
          />
        </div>
        <button
          type="button"
          :disabled="isWorking || passphrase.length < minLength || passphrase !== passphraseConfirm"
          class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          @click="handleEnableEncryption"
        >
          {{ isWorking ? "در حال آماده‌سازی..." : "فعال‌سازی رمزنگاری" }}
        </button>
      </template>
    </div>

    <!-- Notification switch and rollback -->
    <div class="space-y-3 pt-1">
      <label class="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
        <input
          type="checkbox"
          class="mt-0.5 rounded accent-teal-500"
          :checked="snapshot.notifyFailures"
          @change="store.setNotifyFailures(($event.target as HTMLInputElement).checked)"
        />
        <span>نمایش نوار هشدار در پایین صفحه هنگام بروز خطای همگام‌سازی (فقط در حالت آنلاین)</span>
      </label>

      <div
        v-if="snapshot.hasRollbackSnapshot"
        class="flex items-center justify-between gap-3 flex-wrap p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900"
      >
        <p class="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
          پیش از آخرین بازیابی ابری، از اطلاعات این دستگاه یک نسخه‌ی پشتیبان محلی گرفته شده است.
        </p>
        <button
          type="button"
          :disabled="isWorking"
          class="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
          @click="handleRollback"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 7 3 13 9 13" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          <span>بازگرداندن به قبل از بازیابی</span>
        </button>
      </div>
    </div>
  </div>
</template>
