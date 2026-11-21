<script setup lang="ts">
import { onMounted, watch } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useProfileStore } from "@application/stores/profileStore";
import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useTelegramReminderStore } from "@application/stores/telegramReminderStore";
import NavIcon from "@presentation/components/layout/NavIcon.vue";

const route = useRoute();
const profileStore = useProfileStore();
const cycleStore = useCycleStore();
const symptomStore = useSymptomStore();
const hamdelStore = useHamdelStore();
const telegramReminderStore = useTelegramReminderStore();

interface NavItem {
  readonly to: { name: string };
  readonly label: string;
  readonly iconName: string;
  readonly primary?: boolean;
}

const HOME_ITEM: NavItem = { to: { name: "home" }, label: "", iconName: "home", primary: true };
const COMPANION_ITEM: NavItem = { to: { name: "companion" }, label: "همراه", iconName: "companion" };
const GAMES_ITEM: NavItem = { to: { name: "games" }, label: "هم‌راز", iconName: "games" };
const HAMDEL_ITEM: NavItem = { to: { name: "hamdel" }, label: "همدل", iconName: "hamdel" };
const HAMYAR_ITEM: NavItem = { to: { name: "hamyar" }, label: "همیار", iconName: "hamyar" };

/** The layout is RTL: the first item sits on the right edge. Home is the centre; Hamrah/Hamraz on the right, Hamdel/Hamyar on the left. */
const MOBILE_ITEMS: readonly NavItem[] = [COMPANION_ITEM, GAMES_ITEM, HOME_ITEM, HAMDEL_ITEM, HAMYAR_ITEM];
const DESKTOP_ITEMS: readonly NavItem[] = [HOME_ITEM, COMPANION_ITEM, GAMES_ITEM, HAMDEL_ITEM, HAMYAR_ITEM];

/** Top/Utility items (Guide and Settings) placed side-by-side in top bar on mobile and utility area on desktop */
const GUIDE_ITEM: NavItem = { to: { name: "guide" }, label: "راهنما", iconName: "guide" };
const SETTINGS_ITEM: NavItem = { to: { name: "settings" }, label: "تنظیمات", iconName: "settings" };

function isRouteActive(name: string): boolean {
  const current = String(route.name || "");
  if (current === name) return true;
  if (name === "hamyar" && current.startsWith("hamyar")) return true;
  if (name === "hamdel" && current.startsWith("hamdel")) return true;
  if (name === "games" && (current.startsWith("game") || current === "positions")) return true;
  return false;
}

function handleNavClick(name: string): void {
  if (isRouteActive(name)) {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }
}

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
    <aside class="hidden flex-col justify-between border-l border-slate-200 p-4 dark:border-slate-900 lg:flex">
      <div>
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
            v-for="item in DESKTOP_ITEMS"
            :key="item.label"
            :to="item.to"
            class="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all"
            :class="isRouteActive(item.to.name)
              ? 'bg-slate-200 text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-300'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100'"
            @click="handleNavClick(item.to.name)"
          >
            <span
              class="flex h-6 w-6 items-center justify-center transition-transform group-hover:scale-110"
              :class="isRouteActive(item.to.name) ? 'text-teal-600 dark:text-teal-300' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'"
            >
              <NavIcon :name="item.iconName" :active="isRouteActive(item.to.name)" />
            </span>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>

      <!-- Desktop Sidebar Bottom Utility: Guide & Settings -->
      <div class="mt-auto flex flex-col gap-1.5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
        <RouterLink
          :to="GUIDE_ITEM.to"
          class="group flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition-all"
          :class="isRouteActive(GUIDE_ITEM.to.name)
            ? 'bg-slate-200 text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-300'
            : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100'"
          @click="handleNavClick(GUIDE_ITEM.to.name)"
        >
          <span
            class="flex h-6 w-6 items-center justify-center transition-transform group-hover:scale-110"
            :class="isRouteActive(GUIDE_ITEM.to.name) ? 'text-teal-600 dark:text-teal-300' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'"
          >
            <NavIcon :name="GUIDE_ITEM.iconName" :active="isRouteActive(GUIDE_ITEM.to.name)" />
          </span>
          <span>{{ GUIDE_ITEM.label }}</span>
        </RouterLink>

        <RouterLink
          :to="SETTINGS_ITEM.to"
          class="group flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition-all"
          :class="isRouteActive(SETTINGS_ITEM.to.name)
            ? 'bg-slate-200 text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-300'
            : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100'"
          @click="handleNavClick(SETTINGS_ITEM.to.name)"
        >
          <span
            class="flex h-6 w-6 items-center justify-center transition-transform group-hover:scale-110"
            :class="isRouteActive(SETTINGS_ITEM.to.name) ? 'text-teal-600 dark:text-teal-300' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'"
          >
            <NavIcon :name="SETTINGS_ITEM.iconName" :active="isRouteActive(SETTINGS_ITEM.to.name)" />
          </span>
          <span>{{ SETTINGS_ITEM.label }}</span>
        </RouterLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="w-full p-4 pb-28 lg:pb-6">
      <!-- Mobile Top Bar: App Title and Top Action Buttons (Guide & Settings) -->
      <header class="mb-4 flex items-center justify-between lg:hidden" aria-label="سربرگ بالا">
        <div class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-xs dark:bg-teal-600">
            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
          </span>
          <div class="flex flex-col">
            <span class="text-sm font-bold text-slate-900 dark:text-slate-100">ماهک</span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500">همراه سلامت</span>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Guide button (راهنما) placed right next to settings gear with comfortable padding and size -->
          <RouterLink
            :to="GUIDE_ITEM.to"
            :aria-label="GUIDE_ITEM.label"
            :title="GUIDE_ITEM.label"
            class="group flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/90 transition hover:bg-slate-50 hover:text-teal-600 active:scale-95 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800 dark:hover:text-teal-400"
            :class="isRouteActive(GUIDE_ITEM.to.name) ? 'ring-2 ring-teal-500 text-teal-600 dark:ring-teal-400 dark:text-teal-300' : ''"
          >
            <NavIcon :name="GUIDE_ITEM.iconName" :active="isRouteActive(GUIDE_ITEM.to.name)" />
          </RouterLink>

          <!-- Settings button (تنظیمات) placed right next to guide -->
          <RouterLink
            :to="SETTINGS_ITEM.to"
            :aria-label="SETTINGS_ITEM.label"
            :title="SETTINGS_ITEM.label"
            class="group flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/90 transition hover:bg-slate-50 hover:text-teal-600 active:scale-95 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800 dark:hover:text-teal-400"
            :class="isRouteActive(SETTINGS_ITEM.to.name) ? 'ring-2 ring-teal-500 text-teal-600 dark:ring-teal-400 dark:text-teal-300' : ''"
          >
            <NavIcon :name="SETTINGS_ITEM.iconName" :active="isRouteActive(SETTINGS_ITEM.to.name)" />
          </RouterLink>
        </div>
      </header>

      <RouterView />
    </main>

    <!-- Floating mobile bottom bar: Home is the raised centre button -->
    <nav
      class="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-lg items-end justify-around gap-1 rounded-3xl bg-white/92 px-2.5 py-1.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/10 backdrop-blur-xl dark:bg-slate-900/92 dark:shadow-[0_14px_40px_-6px_rgba(0,0,0,0.7),0_2px_8px_rgba(0,0,0,0.4)] dark:ring-white/10 lg:hidden"
      aria-label="ناوبری موبایل"
    >
      <template v-for="item in MOBILE_ITEMS" :key="item.label">
        <RouterLink
          v-if="item.primary"
          :to="item.to"
          :aria-label="item.label"
          class="group relative -mt-7 flex min-w-[64px] max-w-[84px] flex-1 shrink-0 flex-col items-center gap-0.5 text-center"
          @click="handleNavClick(item.to.name)"
        >
          <span
            class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-rose-500 text-white shadow-lg shadow-teal-500/30 ring-4 ring-slate-100 transition-transform duration-200 group-active:scale-90 dark:ring-slate-950 [&>svg]:h-6 [&>svg]:w-6"
            :class="isRouteActive(item.to.name) ? 'scale-110' : ''"
          >
            <NavIcon :name="item.iconName" :active="isRouteActive(item.to.name)" />
          </span>
          <span class="text-[10px] font-bold leading-tight" :class="isRouteActive(item.to.name) ? 'text-teal-600 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'">{{ item.label }}</span>
        </RouterLink>

        <RouterLink
          v-else
          :to="item.to"
          class="group relative flex min-w-[46px] max-w-[76px] flex-1 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl py-1 text-center transition-all duration-200 active:scale-90"
          :class="isRouteActive(item.to.name)
            ? 'text-teal-600 dark:text-teal-300 font-bold bg-teal-500/10 dark:bg-teal-400/15'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40'"
          @click="handleNavClick(item.to.name)"
        >
          <span
            class="flex h-6.5 w-6.5 items-center justify-center transition-transform duration-200"
            :class="isRouteActive(item.to.name) ? 'scale-110 text-teal-600 dark:text-teal-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'"
          >
            <NavIcon :name="item.iconName" :active="isRouteActive(item.to.name)" />
          </span>
          <span class="text-[10px] leading-tight tracking-tight whitespace-nowrap">{{ item.label }}</span>
          <span v-if="isRouteActive(item.to.name)" class="h-1 w-1 rounded-full bg-teal-500 dark:bg-teal-400"></span>
        </RouterLink>
      </template>
    </nav>
  </div>
</template>
