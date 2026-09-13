<script setup lang="ts">
import { onMounted, watch } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useProfileStore } from "@application/stores/profileStore";
import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";

const appModeStore = useAppModeStore();
const profileStore = useProfileStore();
const cycleStore = useCycleStore();
const symptomStore = useSymptomStore();

const NAV_ITEMS = [
  { to: { name: "dashboard" }, label: "داشبورد", icon: "◐" },
  { to: { name: "calendar" }, label: "تقویم", icon: "▦" },
  { to: { name: "symptoms" }, label: "علائم", icon: "✎", selfOnly: true },
  { to: { name: "guide" }, label: "راهنما", icon: "ℹ" },
  { to: { name: "settings" }, label: "تنظیمات", icon: "⚙" },
];

/**
 * AppShell is the single persistent layout mounted for the whole
 * authenticated area (everything under /app), so it is the right place to
 * bootstrap the active Profile and load its Cycle/Symptom data exactly
 * once, then keep them in sync whenever the active profile changes
 * (e.g. a partner switching from "همسر" to "خواهر").
 */
onMounted(async () => {
  await profileStore.initialize();
  await Promise.all([cycleStore.initialize(), symptomStore.initialize()]);
});

watch(
  () => profileStore.activeProfileId,
  async () => {
    await Promise.all([cycleStore.initialize(), symptomStore.initialize()]);
  },
);
</script>

<template>
  <div class="grid min-h-screen w-full grid-cols-1 bg-slate-100 dark:bg-slate-950 lg:grid-cols-[220px_1fr]">
    <aside class="hidden flex-col gap-1 border-l border-slate-200 p-4 dark:border-slate-900 lg:flex">
      <p class="mb-4 px-2 text-lg font-semibold text-slate-900 dark:text-slate-100">ماهک</p>
      <RouterLink
        v-for="item in NAV_ITEMS.filter((i) => !i.selfOnly || !appModeStore.isPartnerMode)"
        :key="item.label"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-900"
        active-class="bg-slate-200 text-teal-600 dark:bg-slate-900 dark:text-teal-300"
      >
        <span>{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </aside>

    <main class="w-full p-4 pb-20 lg:pb-4">
      <RouterView />
    </main>

    <!--
      flex + justify-center (not grid-cols-N) so the bottom nav stays
      centered regardless of how many items are visible: partner mode
      hides "علائم", leaving 4 items instead of 5, which looked lopsided
      with a fixed 5-column grid.
    -->
    <nav class="fixed inset-x-0 bottom-0 z-10 flex items-center justify-center gap-6 border-t border-slate-200 bg-white/95 p-2 backdrop-blur dark:border-slate-900 dark:bg-slate-950/95 lg:hidden">
      <RouterLink
        v-for="item in NAV_ITEMS.filter((i) => !i.selfOnly || !appModeStore.isPartnerMode)"
        :key="item.label"
        :to="item.to"
        class="flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400"
        active-class="text-teal-600 dark:text-teal-300"
      >
        <span class="text-base">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>
  </div>
</template>
