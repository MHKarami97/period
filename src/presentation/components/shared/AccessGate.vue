<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{ message: string }>();
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
    role="status"
  >
    <p class="text-sm leading-7 text-slate-600 dark:text-slate-300">{{ message }}</p>
    <RouterLink
      :to="{ name: 'settings' }"
      class="rounded-xl bg-teal-500/90 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-500"
    >
      رفتن به تنظیمات
    </RouterLink>
  </div>
</template>
