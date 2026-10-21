<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useLockStore } from "@application/stores/lockStore";
import { FullWipeService } from "@infrastructure/backup/FullWipeService";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";

const lockStore = useLockStore();
const secret = ref("");
const input = ref<HTMLInputElement | null>(null);
const now = ref(Date.now());
const isWipeConfirmOpen = ref(false);
let tickId: number | null = null;

const remainingSeconds = computed(() => Math.max(0, Math.ceil((lockStore.cooldownUntil - now.value) / 1000)));
const isDisabled = computed(() => lockStore.isBusy || remainingSeconds.value > 0 || secret.value.length === 0);

async function submit(): Promise<void> {
  const unlocked = await lockStore.unlockWithSecret(secret.value);
  secret.value = "";
  if (!unlocked) await nextTick(() => input.value?.focus());
}

async function wipe(): Promise<void> {
  await FullWipeService.wipeEverything();
  window.location.replace("/");
}

onMounted(() => {
  input.value?.focus();
  tickId = window.setInterval(() => (now.value = Date.now()), 500);
});
onBeforeUnmount(() => {
  if (tickId !== null) window.clearInterval(tickId);
});
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
    <form class="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" @submit.prevent="submit">
      <div class="flex flex-col items-center gap-1 text-center">
        <span class="text-4xl" aria-hidden="true">🔒</span>
        <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">ماهک قفل است</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">برای ادامه، رمز را وارد کنید.</p>
      </div>

      <label class="sr-only" for="lock-secret">رمز</label>
      <input
        id="lock-secret"
        ref="input"
        v-model="secret"
        type="password"
        autocomplete="current-password"
        class="w-full rounded-lg bg-slate-100 px-3 py-3 text-center text-lg tracking-widest text-slate-900 dark:bg-slate-800 dark:text-slate-100"
        dir="ltr"
      />

      <p v-if="lockStore.error" class="text-center text-xs font-medium text-rose-500 dark:text-rose-300" role="alert">{{ lockStore.error }}</p>
      <p v-if="remainingSeconds > 0" class="text-center text-xs text-amber-600 dark:text-amber-300" aria-live="polite">
        به‌خاطر چند تلاش ناموفق، {{ remainingSeconds.toLocaleString("fa-IR") }} ثانیه صبر کنید.
      </p>

      <button type="submit" class="rounded-xl bg-rose-500/90 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50" :disabled="isDisabled">
        {{ lockStore.isBusy ? "در حال بررسی..." : "باز کردن" }}
      </button>
      <button
        v-if="lockStore.hasPasskey"
        type="button"
        class="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-800 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        :disabled="lockStore.isBusy"
        @click="lockStore.unlockWithPasskey()"
      >
        🔑 باز کردن با بایومتریک
      </button>

      <details class="text-xs text-slate-500 dark:text-slate-400">
        <summary class="cursor-pointer">رمز را فراموش کرده‌ام</summary>
        <p class="mt-2 leading-6">
          رمز قابل بازیابی نیست، چون داده‌ها با آن رمزنگاری شده‌اند. اگر بکاپ رمزدار دارید، می‌توانید همه‌چیز را پاک کنید و بعد بکاپ را بازیابی کنید.
        </p>
        <button type="button" class="mt-2 rounded-lg bg-rose-500/10 px-3 py-2 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300" @click="isWipeConfirmOpen = true">
          پاک‌کردن همه‌ی داده‌ها از این دستگاه
        </button>
      </details>
    </form>

    <ConfirmDialog
      v-model="isWipeConfirmOpen"
      title="پاک‌کردن همه‌ی داده‌ها؟"
      message="همه‌ی اطلاعات این برنامه از این دستگاه برای همیشه حذف می‌شود و قابل بازگشت نیست."
      confirm-label="بله، همه‌چیز را پاک کن"
      danger
      @confirm="wipe"
    />
  </main>
</template>
