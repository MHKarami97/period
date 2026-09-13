<script setup lang="ts">
/**
 * UpdatePrompt - surfaces the vite-plugin-pwa update lifecycle to the user
 * instead of updating silently. `registerType: "prompt"` in vite.config.ts
 * makes the new service worker wait in the "installed" state until
 * `updateServiceWorker(true)` is called here, so the user is always the
 * one who decides when to reload onto the new version.
 *
 * `useRegisterSW` returns two independent reactive flags:
 *  - `offlineReady`: the app was cached for the first time and can now be
 *    used offline (shown once, informational only).
 *  - `needRefresh`: a NEW service worker has finished installing and is
 *    waiting to take over; reloading is required to activate it.
 *
 * See: https://vite-pwa-org.netlify.app/frameworks/vue.html
 */
import { useRegisterSW } from "virtual:pwa-register/vue";

const CHECK_FOR_UPDATE_INTERVAL_MS = 60 * 60 * 1000; // re-check every hour while the tab stays open

const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) {
      return;
    }
    setInterval(() => {
      void registration.update();
    }, CHECK_FOR_UPDATE_INTERVAL_MS);
  },
});

async function reloadWithNewVersion(): Promise<void> {
  await updateServiceWorker(true);
}

function dismiss(): void {
  needRefresh.value = false;
  offlineReady.value = false;
}
</script>

<template>
  <Transition name="update-prompt-fade">
    <div
      v-if="needRefresh || offlineReady"
      class="fixed inset-x-4 bottom-20 z-30 mx-auto flex max-w-sm flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 lg:bottom-4 lg:left-4 lg:right-auto lg:mx-0"
      role="status"
    >
      <p class="text-sm text-slate-700 dark:text-slate-200">
        {{
          needRefresh
            ? "نسخه جدید اپلیکیشن آماده است. برای فعال‌سازی، صفحه را بارگذاری مجدد کنید."
            : "اپلیکیشن برای استفاده آفلاین آماده شد."
        }}
      </p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          @click="dismiss"
        >
          بعداً
        </button>
        <button
          v-if="needRefresh"
          type="button"
          class="rounded-lg bg-teal-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500"
          @click="reloadWithNewVersion"
        >
          رفتن به نسخه جدید
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.update-prompt-fade-enter-active,
.update-prompt-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.update-prompt-fade-enter-from,
.update-prompt-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
