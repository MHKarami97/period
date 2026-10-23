<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useProfileStore } from "@application/stores/profileStore";
import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useTelegramReminderStore } from "@application/stores/telegramReminderStore";

const appModeStore = useAppModeStore();
const profileStore = useProfileStore();
const cycleStore = useCycleStore();
const symptomStore = useSymptomStore();
const hamdelStore = useHamdelStore();
const telegramReminderStore = useTelegramReminderStore();

interface NavItem {
  readonly to: { name: string };
  readonly label: string;
  readonly icon: string;
  readonly selfOnly?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: { name: "dashboard" }, label: "داشبورد", icon: "🏠" },
  { to: { name: "calendar" }, label: "تقویم", icon: "📅" },
  { to: { name: "symptoms" }, label: "علائم", icon: "💊", selfOnly: true },
  { to: { name: "guide" }, label: "راهنما", icon: "🔍" },
  { to: { name: "hamdel" }, label: "همدل", icon: "💞" },
  { to: { name: "games" }, label: "بازی‌ها", icon: "🎲" },
];

/** Settings sits in the sidebar on desktop and in a top-left button on mobile (not in the bottom bar). */
const SETTINGS_ITEM: NavItem = { to: { name: "settings" }, label: "تنظیمات", icon: "⚙️" };

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
  <div class="grid min-h-screen w-full grid-cols-1 bg-slate-100 dark:bg-slate-950 lg:grid-cols-[220px_1fr]">
    <aside class="hidden flex-col gap-1 border-l border-slate-200 p-4 dark:border-slate-900 lg:flex">
      <p class="mb-4 px-2 text-lg font-semibold text-slate-900 dark:text-slate-100">ماهک</p>
      <RouterLink
        v-for="item in sidebarItems"
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
      <div dir="ltr" class="mb-3 flex justify-start lg:hidden">
        <RouterLink
          :to="SETTINGS_ITEM.to"
          :aria-label="SETTINGS_ITEM.label"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
          active-class="ring-2 ring-teal-500 dark:ring-teal-400"
        >
          {{ SETTINGS_ITEM.icon }}
        </RouterLink>
      </div>
      <RouterView />
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-10 flex items-center gap-3 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-t border-slate-200 bg-white/95 p-2 backdrop-blur dark:border-slate-900 dark:bg-slate-950/95 sm:gap-6 lg:hidden">
      <RouterLink
        v-for="item in visibleItems"
        :key="item.label"
        :to="item.to"
        class="flex shrink-0 flex-col items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] text-slate-500 first:ms-auto last:me-auto dark:text-slate-400"
        active-class="text-teal-600 dark:text-teal-300"
      >
        <span class="text-base">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>
  </div>
</template>
