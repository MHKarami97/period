<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import {
  HAMDEL_GROUP_IDS,
  HAMDEL_GROUP_LABELS_FA,
  type HamdelGroupId,
} from "@domain/hamdel/HamdelSectionDefinition";
import { HAMDEL_SECTIONS, findHamdelSection } from "@domain/hamdel/hamdelSections";
import { HAMDEL_FEATURES } from "@presentation/hamdel/hamdelFeatures";
import { HamdelReportService } from "@infrastructure/pdf/HamdelReportService";
import AppIcon from "@presentation/components/common/AppIcon.vue";
import { useToast } from "@presentation/composables/useToast";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useJalali } from "@presentation/composables/useJalali";

interface HubCard {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly description: string;
  readonly path: string;
  readonly count: number;
}

interface SearchResultItem {
  readonly id: string;
  readonly sectionId: string;
  readonly sectionTitle: string;
  readonly sectionIcon: string;
  readonly path: string;
  readonly title: string;
  readonly badge?: string;
  readonly snippet?: string;
  readonly dateLabel?: string;
}

const store = useHamdelStore();
const profileStore = useProfileStore();
const { showToast } = useToast();
const { toJalaliLabel } = useJalali();

const includePhotos = ref(false);
const isExporting = ref(false);

// Global Search & Filter state
const searchQuery = ref("");
const selectedGroupFilter = ref<HamdelGroupId | "all">("all");

const totalCount = computed(() => store.entries.length);
const formatNumber = (value: number): string => value.toLocaleString("fa-IR");

// Groups count computation
const groupCounts = computed(() => {
  const counts: Record<string, number> = { all: totalCount.value };
  for (const gid of HAMDEL_GROUP_IDS) {
    const secIds = new Set(HAMDEL_SECTIONS.filter((s) => s.group === gid).map((s) => s.id));
    counts[gid] = store.entries.filter((e) => secIds.has(e.section)).length;
  }
  return counts;
});

// Regular Hub Cards filtered by active group filter
const filteredGroups = computed(() => {
  const allowedGroupIds =
    selectedGroupFilter.value === "all"
      ? HAMDEL_GROUP_IDS
      : [selectedGroupFilter.value];

  return allowedGroupIds
    .map((groupId) => {
      const sections: HubCard[] = HAMDEL_SECTIONS.filter((section) => section.group === groupId).map((section) => ({
        id: section.id,
        title: section.title,
        icon: section.icon,
        description: section.description,
        path: section.customView ? `/app/hamdel/${section.customView}` : `/app/hamdel/${section.id}`,
        count: store.countOf(section.id),
      }));
      const features: HubCard[] = HAMDEL_FEATURES.filter((feature) => feature.group === groupId).map((feature) => ({
        id: feature.id,
        title: feature.title,
        icon: feature.icon,
        description: feature.description,
        path: feature.path,
        count: 0,
      }));
      return { id: groupId, label: HAMDEL_GROUP_LABELS_FA[groupId], cards: [...sections, ...features] };
    })
    .filter((group) => group.cards.length > 0);
});

// Global Search Results across all entries
const searchResults = computed<SearchResultItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];

  const allowedSections = new Set(
    selectedGroupFilter.value === "all"
      ? HAMDEL_SECTIONS.map((s) => s.id)
      : HAMDEL_SECTIONS.filter((s) => s.group === selectedGroupFilter.value).map((s) => s.id),
  );

  const results: SearchResultItem[] = [];

  for (const entry of store.entries) {
    if (!allowedSections.has(entry.section)) continue;

    const def = findHamdelSection(entry.section);
    if (!def) continue;

    const values = entry.values;
    const valuesList = Object.values(values);
    const matchesQuery =
      def.title.toLowerCase().includes(q) ||
      valuesList.some((v) => v.toLowerCase().includes(q));

    if (!matchesQuery) continue;

    const title = entry.valueOf(def.titleField) || def.title;
    const targetPath = def.customView ? `/app/hamdel/${def.customView}` : `/app/hamdel/${def.id}`;

    // Get badge or filter value label
    let badge: string | undefined;
    const filterKey = def.filterField;
    if (filterKey && values[filterKey]) {
      const fieldDef = def.fields.find((f) => f.key === filterKey);
      badge = fieldDef?.options?.find((o) => o.value === values[filterKey])?.label ?? values[filterKey];
    }

    // Snippet from other text/note fields
    let snippet: string | undefined;
    for (const [key, val] of Object.entries(values)) {
      if (key !== def.titleField && val && val !== badge) {
        snippet = val;
        break;
      }
    }

    let dateLabel: string | undefined;
    if (entry.dateIso) {
      dateLabel = toJalaliLabel(DateOnly.fromIsoString(entry.dateIso));
    }

    results.push({
      id: entry.id,
      sectionId: def.id,
      sectionTitle: def.title,
      sectionIcon: def.icon,
      path: targetPath,
      title,
      badge,
      snippet,
      dateLabel,
    });
  }

  return results;
});

function clearSearch(): void {
  searchQuery.value = "";
}

async function exportPdf(): Promise<void> {
  if (isExporting.value) return;
  isExporting.value = true;
  try {
    await HamdelReportService.openFullReport(store.entries, {
      profileName: profileStore.activeProfile?.name ?? "همسر",
      includePhotos: includePhotos.value,
    });
  } catch (error) {
    showToast(error instanceof Error ? error.message : "خطا در ساخت گزارش PDF", 2500);
  } finally {
    isExporting.value = false;
  }
}

onMounted(() => void store.ensureLoaded());
watch(() => profileStore.activeProfileId, () => void store.ensureLoaded());
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">💞 همدل</h1>
    </header>

    <!-- 1. GLOBAL SEARCH & FILTER SECTION (IN TOP PART) -->
    <section class="flex flex-col gap-3 rounded-2xl bg-white p-3.5 sm:p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <!-- Search Input -->
      <div class="relative flex items-center">
        <span class="pointer-events-none absolute right-3 text-slate-400 dark:text-slate-500">
          <AppIcon name="search" size="sm" />
        </span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="جست‌وجوی سراسری در همه علایق، غذاها، قول‌ها، خاطرات و یادداشت‌ها..."
          class="w-full rounded-xl bg-slate-50 py-2.5 pe-9 ps-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
          title="پاک کردن جست‌وجو"
          @click="clearSearch"
        >
          ✕
        </button>
      </div>

      <!-- Global Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5 pt-1" role="radiogroup" aria-label="فیلتر دسته‌بندی">
        <button
          type="button"
          role="radio"
          :aria-checked="selectedGroupFilter === 'all'"
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95"
          :class="selectedGroupFilter === 'all'
            ? 'bg-rose-500 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'"
          @click="selectedGroupFilter = 'all'"
        >
          <span>همه</span>
          <span class="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px] dark:bg-white/15">
            {{ formatNumber(groupCounts.all ?? 0) }}
          </span>
        </button>

        <button
          v-for="gid in HAMDEL_GROUP_IDS"
          :key="gid"
          type="button"
          role="radio"
          :aria-checked="selectedGroupFilter === gid"
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95"
          :class="selectedGroupFilter === gid
            ? 'bg-rose-500 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'"
          @click="selectedGroupFilter = gid"
        >
          <span>{{ HAMDEL_GROUP_LABELS_FA[gid] }}</span>
          <span
            v-if="groupCounts[gid] > 0"
            class="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px] dark:bg-white/15"
          >
            {{ formatNumber(groupCounts[gid]) }}
          </span>
        </button>
      </div>
    </section>

    <!-- SEARCH RESULTS VIEW (when user is searching) -->
    <section v-if="searchQuery.trim()" class="flex flex-col gap-3">
      <div class="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>نتایج جست‌وجو برای «{{ searchQuery }}»</span>
        <span>{{ formatNumber(searchResults.length) }} مورد یافت شد</span>
      </div>

      <div v-if="searchResults.length > 0" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RouterLink
          v-for="item in searchResults"
          :key="item.id"
          :to="item.path"
          class="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-rose-300 active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-rose-400/60"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <span>{{ item.sectionIcon }}</span>
              <span>{{ item.sectionTitle }}</span>
            </span>
            <span v-if="item.badge" class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {{ item.badge }}
            </span>
            <span v-else-if="item.dateLabel" class="text-[10px] text-slate-400">
              {{ item.dateLabel }}
            </span>
          </div>

          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 leading-6">
            {{ item.title }}
          </h3>

          <p v-if="item.snippet" class="text-xs text-slate-500 dark:text-slate-400 leading-5 line-clamp-2">
            {{ item.snippet }}
          </p>
        </RouterLink>
      </div>

      <div v-else class="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          موردی متناسب با عبارت «{{ searchQuery }}» پیدا نشد.
        </p>
        <button
          type="button"
          class="mt-3 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          @click="clearSearch"
        >
          مشاهده تمام بخش‌ها
        </button>
      </div>
    </section>

    <!-- NORMAL SECTIONS VIEW (when not searching) -->
    <template v-else>
      <section v-for="group in filteredGroups" :key="group.id" class="flex flex-col gap-3">
        <h2 class="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">{{ group.label }}</h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <RouterLink
            v-for="card in group.cards"
            :key="card.id"
            :to="card.path"
            class="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-rose-300 active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-rose-400/60"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-xl dark:bg-rose-500/20">{{ card.icon }}</span>
            <span class="flex min-w-0 flex-col gap-0.5">
              <span class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {{ card.title }}
                <span v-if="card.count > 0" class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-normal text-slate-500 dark:bg-slate-800 dark:text-slate-400">{{ formatNumber(card.count) }}</span>
              </span>
              <span class="text-xs leading-5 text-slate-500 dark:text-slate-400">{{ card.description }}</span>
            </span>
          </RouterLink>
        </div>
      </section>
    </template>

    <!-- DEDICATED PDF EXPORT PART (MOVED TO BOTTOM AT THE END) -->
    <section class="mt-2 rounded-3xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-teal-500/10 p-4 sm:p-6 ring-1 ring-rose-500/25 dark:bg-slate-900 dark:ring-rose-500/35 shadow-xs flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-2xl text-rose-600 dark:bg-rose-500/25 dark:text-rose-300">
            📄
          </span>
          <div class="min-w-0">
            <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              خروجی PDF و سند رسمی همدل
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-5">
              خلاصه‌ی کامل علایق، اندازه‌ها، قول‌ها، هدیه‌ها، خاطرات و آمار در یک سند شکیل چاپی
            </p>
          </div>
        </div>

        <RouterLink
          to="/app/hamdel/stats"
          class="shrink-0 self-start sm:self-center rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 transition active:scale-95"
        >
          📊 آمار و نمودارها
        </RouterLink>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-rose-500/10 dark:border-slate-800">
        <label class="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input v-model="includePhotos" type="checkbox" />
          <span>عکس‌های دفترچه‌ی خاطرات هم در فایل گزارش باشد</span>
        </label>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition active:scale-95 disabled:opacity-50"
          :disabled="isExporting || totalCount === 0"
          @click="exportPdf"
        >
          <AppIcon name="print" size="xs" />
          <span>{{ isExporting ? "در حال آماده‌سازی..." : "دریافت فایل PDF همدل" }}</span>
        </button>
      </div>
    </section>
  </div>
</template>
