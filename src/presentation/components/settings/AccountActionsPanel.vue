<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useUserProfileStore } from "@application/stores/userProfileStore";
import { useProfileStore } from "@application/stores/profileStore";
import { DatabaseResetService } from "@infrastructure/backup/DatabaseResetService";
import ConfirmDialog from "@presentation/components/shared/ConfirmDialog.vue";

/**
 * AccountActionsPanel - two intentionally separate, clearly-worded actions:
 *
 *  1. "خروج" (sign out / switch role): only resets the Dual-Mode role
 *     selection and sends the user back to onboarding. It does NOT touch
 *     any stored data — the whole point is to let someone switch from
 *     self-tracking to partner-tracking (or vice-versa) on the same
 *     device without losing anything already logged.
 *  2. "پاک‌کردن کامل اطلاعات" (full reset): the only action that actually
 *     deletes everything — every profile and all of their cycles/symptoms
 *     (via DatabaseResetService, which wipes ALL profiles, not just the
 *     active one). Reserved for when a genuinely different person will
 *     start fresh on this device. Both actions require explicit
 *     confirmation so neither can be triggered by an accidental tap.
 */
const router = useRouter();
const appModeStore = useAppModeStore();
const userProfileStore = useUserProfileStore();
const profileStore = useProfileStore();

const isLogoutConfirmOpen = ref(false);
const isResetConfirmOpen = ref(false);

function logout(): void {
  appModeStore.resetRole();
  router.push({ name: "onboarding" });
}

async function resetAllData(): Promise<void> {
  await DatabaseResetService.resetAll();
  userProfileStore.setDisplayName("");
  profileStore.reset();
  appModeStore.resetRole();
  router.push({ name: "onboarding" });
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">حساب و داده‌ها</h2>

    <button
      type="button"
      class="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      @click="isLogoutConfirmOpen = true"
    >
      خروج و تغییر نقش
    </button>

    <button
      type="button"
      class="rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
      @click="isResetConfirmOpen = true"
    >
      پاک‌کردن کامل اطلاعات (ریست)
    </button>

    <ConfirmDialog
      v-model="isLogoutConfirmOpen"
      title="خروج و تغییر نقش؟"
      message="با خروج، فقط به صفحه انتخاب نقش (خود/شریک) برمی‌گردید. هیچ داده‌ای (پریودها، علائم، پروفایل‌های ثبت‌شده) پاک نمی‌شود و بعداً می‌توانید دوباره وارد شوید."
      confirm-label="خروج"
      @confirm="logout"
    />

    <ConfirmDialog
      v-model="isResetConfirmOpen"
      title="پاک‌کردن کامل اطلاعات؟"
      message="این عمل غیرقابل بازگشت است: تمام پروفایل‌های ثبت‌شده (خود، همسر، خواهر و ...)، پریودها، علائم و نام نمایشی برای همیشه پاک می‌شوند. فقط در صورتی این کار را انجام دهید که می‌خواهید شخص دیگری از ابتدا از این دستگاه استفاده کند. پیشنهاد می‌شود قبل از این کار از «خروجی JSON» در همین صفحه استفاده کنید."
      confirm-label="بله، همه‌چیز را پاک کن"
      danger
      @confirm="resetAllData"
    />
  </div>
</template>
