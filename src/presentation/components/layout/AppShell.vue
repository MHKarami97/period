<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useProfileStore } from "@application/stores/profileStore";
import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useTelegramReminderStore } from "@application/stores/telegramReminderStore";
import NavIcon from "@presentation/components/layout/NavIcon.vue";

const appModeStore = useAppModeStore();
const profileStore = useProfileStore();
const cycleStore = useCycleStore();
const symptomStore = useSymptomStore();
const hamdelStore = useHamdelStore();
const telegramReminderStore = useTelegramReminderStore();

interface NavItem {
  readonly to: { name: string };
  readonly label: string;
  readonly iconName: string;
  readonly selfOnly?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: { name: "dashboard" }, label: "داشبورد", iconName: "dashboard" },
  { to: { name: "calendar" }, label: "تقویم", iconName: "calendar" },
  { to: { name: "symptoms" }, label: "علائم", iconName: "symptoms", selfOnly: true },
  { to: { name: "hamyar" }, label: "همیار", iconName: "hamyar" },  
  { to: { name: "hamdel" }, label: "همدل", iconName: "hamdel" },
  { to: { name: "games" }, label: "بازی‌ها", iconName: "games" },
  { to: { name: "guide" }, label: "راهنما", iconName: "guide" },
];

/** Settings sits in the sidebar on desktop and in a top-left button on mobile (not in the bottom bar). */
const SETTINGS_ITEM: NavItem = { to: { name: "settings" }, label: "تنظیمات", iconName: "settings" };

const visibleItems = computed(() => NAV_ITEMS.filter((item) => !item.selfOnly || !appModeStore.isPartnerMode));
const sidebarItems = computed(() => [...visibleItems.value, SETTINGS_ITEM]);

/** One schedule per Telegram link: period reminders and Hamdel reminders are always sent together. */
function syncReminders(): Promise<void> {
  return telegramReminderStore.syncReminders(cycleStore.sortedCycles, hamdelStore.entries);
}

onMounted(async () => {
  await profileStore.initialize();
  await Promise.all([cycleStore.initialize(), symptomStore.initialize(), hamdelStore.load(), telegramReminderStore.initialize()]);
  await syncReminders();
});

watch(
  () => profileStore.activeProfileId,
  async () => {
    await Promise.all([cycleStore.initialize(), symptomStore.initialize(), hamdelStore.load()]);
    await syncReminders();
  },
);

watch(() => cycleStore.sortedCycles, syncReminders);
watch(() => hamdelStore.entries, syncReminders);
</script>

<template>
  <div class="grid min-h-screen w-full grid-cols-1 bg-slate-100 dark:bg-slate-950 lg:grid-cols-[230px_1fr]">
    <!-- Desktop Sidebar -->
    <aside class="hidden flex-col gap-1 border-l border-slate-200 p-4 dark:border-slate-900 lg:flex">
      <div class="mb-5 flex items-center gap-3 px-2">
        <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-sm dark:bg-teal-600">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          </svg>
        </span>
        <div class="flex flex-col">
          <span class="text-base font-bold text-slate-900 dark:text-slate-100">ماهک</span>
          <span class="text-[11px] text-slate-400 dark:text-slate-500">همراه سلامت و زندگی</span>
        </div>
      </div>

      <nav class="flex flex-col gap-1.5" aria-label="ناوبری اصلی">
        <RouterLink
          v-for="item in sidebarItems"
          :key="item.label"
          :to="item.to"
          v-slot="{ isActive }"
          class="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all"
          :class="isActive
            ? 'bg-slate-200 text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-300'
            : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100'"
        >
          <span
            class="flex h-6 w-6 items-center justify-center transition-transform group-hover:scale-110"
            :class="isActive ? 'text-teal-600 dark:text-teal-300' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'"
          >
            <NavIcon :name="item.iconName" :active="isActive" />
          </span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="w-full p-4 pb-24 lg:pb-6">
      <div dir="ltr" class="mb-3 flex justify-start lg:hidden">
        <RouterLink
          :to="SETTINGS_ITEM.to"
          :aria-label="SETTINGS_ITEM.label"
          v-slot="{ isActive }"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-95 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
          :class="isActive ? 'ring-2 ring-teal-500 text-teal-600 dark:ring-teal-400 dark:text-teal-300' : ''"
        >
          <NavIcon :name="SETTINGS_ITEM.iconName" :active="isActive" />
        </RouterLink>
      </div>
      <RouterView />
    </main>

    <!-- Mobile Bottom Navigation Bar -->
    <nav
      class="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around gap-1 overflow-x-auto border-t border-slate-200/90 bg-white/95 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md dark:border-slate-850 dark:bg-slate-950/95 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden"
      aria-label="ناوبری موبایل"
    >
      <RouterLink
        v-for="item in visibleItems"
        :key="item.label"
        :to="item.to"
        v-slot="{ isActive }"
        class="group flex flex-1 min-w-[50px] max-w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl py-1 text-center transition-all duration-150"
        :class="isActive ? 'text-teal-600 dark:text-teal-300 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
      >
        <span
          class="flex h-7 w-7 items-center justify-center rounded-lg transition-transform duration-200 group-active:scale-90"
          :class="isActive ? 'bg-teal-50 dark:bg-teal-950/70 scale-105 text-teal-600 dark:text-teal-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'"
        >
          <NavIcon :name="item.iconName" :active="isActive" />
        </span>
        <span class="text-[10px] leading-tight tracking-tight whitespace-nowrap">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
