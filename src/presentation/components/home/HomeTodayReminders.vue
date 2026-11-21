<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { ReminderTone, TodayReminder } from "@domain/home/TodayReminders";

defineProps<{
  reminders: readonly TodayReminder[];
}>();

const TONES: Readonly<Record<ReminderTone, string>> = {
  rose: "bg-rose-50 text-rose-900 ring-rose-200/80 dark:bg-rose-500/10 dark:text-rose-100 dark:ring-rose-500/25",
  amber: "bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/25",
  sky: "bg-sky-50 text-sky-900 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/25",
  emerald: "bg-emerald-50 text-emerald-900 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/25",
};
</script>

<template>
  <section v-if="reminders.length > 0" class="flex flex-col gap-2" aria-label="امروز یادتان نرود">
    <h2 class="px-1 text-xs font-bold text-slate-500 dark:text-slate-400">امروز یادتان نرود</h2>
    <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <RouterLink
        v-for="reminder in reminders"
        :key="reminder.id"
        :to="reminder.to"
        class="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium ring-1 transition active:scale-[0.99]"
        :class="TONES[reminder.tone]"
      >
        <span aria-hidden="true">{{ reminder.icon }}</span>
        <span>{{ reminder.text }}</span>
      </RouterLink>
    </div>
  </section>
</template>
