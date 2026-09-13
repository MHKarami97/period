<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAppModeStore, type AppRole } from "@application/stores/appModeStore";

const appModeStore = useAppModeStore();
const router = useRouter();

function selectRole(role: AppRole): void {
  appModeStore.setRole(role);
  router.push({ name: "dashboard" });
}
</script>

<template>
  <div class="flex min-h-screen w-full items-center justify-center bg-slate-950 p-6">
    <div class="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
      <button
        type="button"
        class="flex flex-col items-start gap-2 rounded-2xl bg-slate-900 p-6 text-right ring-1 ring-slate-800 transition hover:ring-teal-400"
        @click="selectRole('self')"
      >
        <span class="text-lg font-semibold text-teal-300">ردیابی برای خود</span>
        <span class="text-sm text-slate-400">ثبت پریود، علائم روزانه، خلق‌وخو و دسترسی کامل به همه امکانات.</span>
      </button>

      <button
        type="button"
        class="flex flex-col items-start gap-2 rounded-2xl bg-slate-900 p-6 text-right ring-1 ring-slate-800 transition hover:ring-violet-300"
        @click="selectRole('partner')"
      >
        <span class="text-lg font-semibold text-violet-300">ردیابی شریک</span>
        <span class="text-sm text-slate-400">نمای ساده‌شده و فقط‌خواندنی: تاریخ‌ها، فاز فعلی و روزهای باقیمانده.</span>
      </button>
    </div>
  </div>
</template>
