<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, type RouteLocationRaw } from "vue-router";

const props = defineProps<{
  isPartnerMode: boolean;
}>();

interface QuickLink {
  readonly label: string;
  readonly icon: string;
  readonly to: RouteLocationRaw;
  readonly selfOnly?: boolean;
}

const LINKS: readonly QuickLink[] = [
  { label: "ثبت علائم", icon: "✍️", to: { name: "companion", query: { tab: "symptoms" } }, selfOnly: true },
  { label: "تقویم", icon: "📅", to: { name: "companion", query: { tab: "calendar" } } },
  { label: "ثبت اشاره", icon: "💡", to: { name: "hamdel-section", params: { section: "hints" } } },
  { label: "تاریخ‌های مهم", icon: "🎂", to: { name: "hamdel-dates" } },
  { label: "چالش امروز", icon: "🎯", to: { name: "game-daily-challenges" } },
  { label: "بازی دونفره", icon: "🎲", to: { name: "games" } },
  { label: "راهنمای زوجین", icon: "💑", to: { name: "hamyar", query: { tab: "couple" } } },
];

const links = computed(() => LINKS.filter((link) => !link.selfOnly || !props.isPartnerMode));
</script>

<template>
  <nav class="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="دسترسی سریع">
    <RouterLink
      v-for="link in links"
      :key="link.label"
      :to="link.to"
      class="flex min-w-[76px] shrink-0 snap-start flex-col items-center gap-1 rounded-2xl bg-white px-3 py-2.5 text-center shadow-xs ring-1 ring-slate-200 transition hover:ring-teal-400 active:scale-95 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-teal-500"
    >
      <span class="text-xl" aria-hidden="true">{{ link.icon }}</span>
      <span class="text-[11px] font-semibold leading-tight text-slate-700 dark:text-slate-200">{{ link.label }}</span>
    </RouterLink>
  </nav>
</template>
