<script setup lang="ts">
import { computed, type Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import AboutSection from "@presentation/components/settings/AboutSection.vue";
import AccountActionsPanel from "@presentation/components/settings/AccountActionsPanel.vue";
import CloudBackupCard from "@presentation/components/settings/CloudBackupCard.vue";
import DataManagementPanel from "@presentation/components/settings/DataManagementPanel.vue";
import DisplayNameForm from "@presentation/components/settings/DisplayNameForm.vue";
import GamesAccessPanel from "@presentation/components/settings/GamesAccessPanel.vue";
import SecurityPanel from "@presentation/components/settings/SecurityPanel.vue";
import TelegramReminderPanel from "@presentation/components/settings/TelegramReminderPanel.vue";
import ThemeSwitcher from "@presentation/components/settings/ThemeSwitcher.vue";

type SettingsTabId = "general" | "reminders" | "security" | "data" | "account";

interface SettingsTab {
  readonly id: SettingsTabId;
  readonly label: string;
  readonly icon: string;
  readonly panels: readonly Component[];
}

/** Related panels share a tab; only the active tab is mounted, so heavy panels (cloud backup) load on demand. */
const TABS: readonly SettingsTab[] = [
  { id: "general", label: "عمومی", icon: "🎨", panels: [DisplayNameForm, ThemeSwitcher] },
  { id: "reminders", label: "یادآور", icon: "🔔", panels: [TelegramReminderPanel] },
  { id: "security", label: "امنیت و قفل", icon: "🔒", panels: [SecurityPanel, GamesAccessPanel] },
  { id: "data", label: "داده و پشتیبان", icon: "☁️", panels: [CloudBackupCard, DataManagementPanel] },
  { id: "account", label: "حساب و درباره", icon: "👤", panels: [AccountActionsPanel, AboutSection] },
];

const route = useRoute();
const router = useRouter();

const activeTab = computed<SettingsTab>(() => TABS.find((tab) => tab.id === route.query.tab) ?? TABS[0]);

function selectTab(tab: SettingsTab): void {
  if (tab.id === activeTab.value.id) return;
  void router.replace({ query: { ...route.query, tab: tab.id === TABS[0].id ? undefined : tab.id } });
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <div
      class="flex gap-1.5 overflow-x-auto rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200/80 [scrollbar-width:none] dark:bg-slate-900 dark:ring-slate-800 [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="بخش‌های تنظیمات"
    >
      <button
        v-for="tab in TABS"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeTab.id === tab.id"
        class="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.98] sm:flex-1 sm:justify-center sm:text-sm"
        :class="
          activeTab.id === tab.id
            ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:text-teal-300 dark:ring-slate-700'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        "
        @click="selectTab(tab)"
      >
        <span aria-hidden="true">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div class="flex flex-col gap-4" role="tabpanel">
      <component :is="panel" v-for="(panel, index) in activeTab.panels" :key="`${activeTab.id}-${index}`" />
    </div>
  </div>
</template>
