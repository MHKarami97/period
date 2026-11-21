<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";
import DashboardView from "@presentation/views/DashboardView.vue";

type CompanionTab = "overview" | "calendar" | "symptoms" | "stats" | "health" | "pregnancy";

interface TabDefinition {
  readonly id: CompanionTab;
  readonly label: string;
  readonly icon: string;
  readonly selfOnly: boolean;
}

const TABS: readonly TabDefinition[] = [
  { id: "overview", label: "وضعیت", icon: "🩸", selfOnly: false },
  { id: "calendar", label: "تقویم", icon: "📅", selfOnly: false },
  { id: "symptoms", label: "علائم", icon: "✍️", selfOnly: true },
  { id: "stats", label: "آمار", icon: "📈", selfOnly: false },
  { id: "health", label: "سلامت", icon: "💊", selfOnly: false },
  { id: "pregnancy", label: "بارداری", icon: "🤰", selfOnly: false },
];

const CalendarView = defineAsyncComponent(() => import("@presentation/views/CalendarView.vue"));
const SymptomsView = defineAsyncComponent(() => import("@presentation/views/SymptomsView.vue"));
const CycleStatsPanel = defineAsyncComponent(() => import("@presentation/components/insights/CycleStatsPanel.vue"));
const HealthPanel = defineAsyncComponent(() => import("@presentation/components/insights/HealthPanel.vue"));
const PregnancyPanel = defineAsyncComponent(() => import("@presentation/components/insights/PregnancyPanel.vue"));

const route = useRoute();
const router = useRouter();
const appModeStore = useAppModeStore();

const visibleTabs = computed(() => TABS.filter((tab) => !tab.selfOnly || !appModeStore.isPartnerMode));

const activeTab = computed<CompanionTab>(() => {
  const requested = visibleTabs.value.find((tab) => tab.id === route.query.tab);
  return requested ? requested.id : "overview";
});

function selectTab(tab: CompanionTab): void {
  if (tab === activeTab.value) return;
  void router.replace({ query: { ...route.query, tab: tab === "overview" ? undefined : tab } });
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-4">
    <div
      class="flex gap-1.5 overflow-x-auto rounded-2xl bg-slate-100 p-1.5 shadow-2xs ring-1 ring-slate-200/80 [scrollbar-width:none] dark:bg-slate-900 dark:ring-slate-800 [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="بخش‌های همراه"
    >
      <button
        v-for="tab in visibleTabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        class="flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.98] sm:flex-1 sm:text-sm"
        :class="
          activeTab === tab.id
            ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:text-rose-300 dark:ring-slate-700'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        "
        @click="selectTab(tab.id)"
      >
        <span aria-hidden="true">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <DashboardView v-if="activeTab === 'overview'" />
    <CalendarView v-else-if="activeTab === 'calendar'" />
    <SymptomsView v-else-if="activeTab === 'symptoms'" />
    <CycleStatsPanel v-else-if="activeTab === 'stats'" />
    <HealthPanel v-else-if="activeTab === 'health'" />
    <PregnancyPanel v-else />
  </div>
</template>
