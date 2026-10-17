<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useTelegramReminderStore } from "@application/stores/telegramReminderStore";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";

const store = useTelegramReminderStore();
const isDisconnectDialogOpen = ref(false);

const stateTitle = computed(() => {
  switch (store.state) {
    case "unconfigured": return "فعلاً در دسترس نیست";
    case "disabled": return "غیرفعال";
    case "pending": return "در انتظار تأیید در تلگرام";
    case "linked": return "متصل";
  }
});

onMounted(() => { void store.initialize(); });
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">یادآور در تلگرام</h2>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
          سه یادآور در ساعت ۶ صبح: یک روز قبل از شروع، روز شروع و روز پایان پریود.
        </p>
      </div>
      <span
        class="shrink-0 rounded-full px-2.5 py-1 text-xs"
        :class="store.isLinked
          ? 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
      >
        {{ stateTitle }}
      </span>
    </div>

    <template v-if="store.state === 'unconfigured'">
      <p class="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
        این قابلیت هنوز روی سرور پیکربندی نشده است.
      </p>
    </template>

    <template v-else-if="!store.isEnabled">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        با فعال‌کردن این گزینه، یادآورها از طریق همان بات اپ مدیریت تسک برایتان ارسال می‌شود. داده‌های پریود شما فقط
        به‌صورت «نوع یادآور و تاریخ پیش‌بینی‌شده» به سرور یادآور ارسال می‌شود.
      </p>
      <button
        type="button"
        class="rounded-xl bg-teal-500/90 px-4 py-3 text-sm font-medium text-white hover:bg-teal-500"
        @click="store.enable()"
      >
        فعال‌کردن یادآور تلگرام
      </button>
    </template>

    <template v-else>
      <div class="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
        <template v-if="store.isLinked">
          <p class="text-teal-600 dark:text-teal-300">✅ اتصال برقرار است.</p>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {{ store.username ? `حساب تلگرام: @${store.username}` : "حساب تلگرام متصل شده است." }}
          </p>
        </template>
        <template v-else>
          <p class="font-medium text-slate-900 dark:text-slate-100">مرحله ۱: بات را باز کنید</p>
          <a
            :href="store.botUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 inline-block rounded-lg bg-teal-500/90 px-3 py-2 text-xs font-medium text-white hover:bg-teal-500"
          >
            باز کردن بات در تلگرام
          </a>
          <p class="mt-3 font-medium text-slate-900 dark:text-slate-100">مرحله ۲: Start را بزنید</p>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            در بات روی دکمه‌ی Start بزنید یا دستور <code>/start</code> را بفرستید.
          </p>
          <button
            type="button"
            class="mt-3 w-full rounded-lg bg-slate-200 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            :disabled="store.isWorking"
            @click="store.waitForLink()"
          >
            {{ store.isWorking ? "در حال بررسی..." : "اتصال را بررسی کن" }}
          </button>
        </template>
      </div>

      <button
        type="button"
        class="rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
        @click="isDisconnectDialogOpen = true"
      >
        قطع اتصال تلگرام
      </button>
    </template>

    <p v-if="store.error" class="text-xs text-rose-600 dark:text-rose-300">{{ store.error }}</p>

    <ConfirmDialog
      v-model="isDisconnectDialogOpen"
      title="قطع اتصال تلگرام؟"
      message="یادآورهای ماهک از این چت حذف می‌شوند. اتصال اپ مدیریت تسک جداگانه باقی می‌ماند."
      confirm-label="قطع اتصال"
      danger
      @confirm="store.disable()"
    />
  </div>
</template>
