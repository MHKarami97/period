<script setup lang="ts">
defineProps<{ title: string; icon?: string }>();
</script>

<template>
  <section class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
      <span v-if="icon">{{ icon }}</span>
      {{ title }}
    </h2>
    <div class="flex flex-col gap-2 text-sm leading-7 text-slate-700 dark:text-slate-200">
      <slot />
    </div>
  </section>
</template>
