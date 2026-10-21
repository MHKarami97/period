<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{ title: string }>();
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h1>
    <RouterLink
      :to="{ name: 'games' }"
      class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
    >
      بازی‌ها ←
    </RouterLink>
  </div>
</template>
