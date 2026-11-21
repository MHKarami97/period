<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { HamyarTip } from "@domain/home/HamyarTipPicker";

defineProps<{
  tip: HamyarTip | null;
}>();
</script>

<template>
  <RouterLink
    v-if="tip"
    :to="{ name: 'hamyar-guide', params: { guideId: tip.guideId }, query: { stage: String(tip.stageId) } }"
    class="flex flex-col gap-1.5 rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 p-3.5 ring-1 ring-sky-200/70 transition active:scale-[0.99] hover:ring-sky-300 dark:from-sky-500/10 dark:to-teal-500/10 dark:ring-sky-500/25"
  >
    <span class="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 dark:text-sky-300">
      <span aria-hidden="true">{{ tip.icon }}</span>
      {{ tip.label }}
      <span class="font-normal text-slate-400 dark:text-slate-500">· {{ tip.guideTitle }}</span>
    </span>
    <span class="whitespace-pre-line text-sm leading-6 text-slate-800 dark:text-slate-100">{{ tip.text }}</span>
    <span class="text-[11px] text-slate-500 dark:text-slate-400">{{ tip.stageTitle }}</span>
  </RouterLink>
</template>
