<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";

const appModeStore = useAppModeStore();

const NAV_ITEMS = [
  { to: { name: "dashboard" }, label: "داشبورد", icon: "◐" },
  { to: { name: "calendar" }, label: "تقویم", icon: "▦" },
  { to: { name: "symptoms" }, label: "علائم", icon: "✎", selfOnly: true },
  { to: { name: "settings" }, label: "تنظیمات", icon: "⚙" },
];
</script>

<template>
  <div class="grid min-h-screen w-full grid-cols-1 bg-slate-950 lg:grid-cols-[220px_1fr]">
    <aside class="hidden flex-col gap-1 border-l border-slate-900 p-4 lg:flex">
      <p class="mb-4 px-2 text-lg font-semibold text-slate-100">Period Tracker</p>
      <RouterLink
        v-for="item in NAV_ITEMS.filter((i) => !i.selfOnly || !appModeStore.isPartnerMode)"
        :key="item.label"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
        active-class="bg-slate-900 text-teal-300"
      >
        <span>{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </aside>

    <main class="w-full p-4 pb-20 lg:pb-4">
      <RouterView />
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 gap-1 border-t border-slate-900 bg-slate-950/95 p-2 backdrop-blur lg:hidden">
      <RouterLink
        v-for="item in NAV_ITEMS.filter((i) => !i.selfOnly || !appModeStore.isPartnerMode)"
        :key="item.label"
        :to="item.to"
        class="flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] text-slate-400"
        active-class="text-teal-300"
      >
        <span class="text-base">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>
  </div>
</template>
