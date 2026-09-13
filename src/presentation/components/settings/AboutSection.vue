<script setup lang="ts">
const SITE_URL = "https://mhkarami97.ir";
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">درباره من</h2>
    <p class="text-sm text-slate-600 dark:text-slate-300">
      این اپلیکیشن توسط محمدحسین کرمی، توسعه‌دهنده نرم‌افزار، به‌صورت Local-First و بدون ارسال داده به سرور ساخته شده است.
    </p>
    <a
      :href="SITE_URL"
      target="_blank"
      rel="noopener noreferrer"
      class="w-fit rounded-lg bg-teal-500/10 px-3 py-2 text-sm font-medium text-teal-600 hover:bg-teal-500/20 dark:bg-teal-500/20 dark:text-teal-300 dark:hover:bg-teal-500/30"
    >
      مشاهده وب‌سایت: mhkarami97.ir
    </a>
  </div>
</template>
