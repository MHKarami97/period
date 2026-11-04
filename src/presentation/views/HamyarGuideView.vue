<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHamyarStore } from "@application/stores/hamyarStore";
import { findHamyarGuideMeta } from "@presentation/hamyar/hamyarCatalog";
import type { HamyarGuideData, HamyarContentType } from "@domain/hamyar/HamyarGuide";
import { HamyarSearchEngine } from "@domain/hamyar/HamyarSearchEngine";
import HamyarStageCard from "@presentation/components/hamyar/HamyarStageCard.vue";

const route = useRoute();
const router = useRouter();
const hamyarStore = useHamyarStore();

const guideId = computed(() => String(route.params.guideId || ""));
const guideMeta = computed(() => findHamyarGuideMeta(guideId.value));

const guideData = ref<HamyarGuideData | null>(null);
const localSearch = ref("");
const selectedStageId = ref<number | "all">("all");
const activeContentType = ref<HamyarContentType>("all");

const contentTypeOptions: readonly { key: HamyarContentType; label: string; icon: string }[] = [
  { key: "all", label: "همه بخش‌ها", icon: "📑" },
  { key: "knowledge", label: "دانستنی‌ها", icon: "📚" },
  { key: "checklist", label: "چک‌لیست عملی", icon: "✅" },
  { key: "myths", label: "باورهای غلط", icon: "💡" },
  { key: "red_flags", label: "علائم هشدار", icon: "🚩" },
  { key: "questions", label: "پرسش از متخصص", icon: "🩺" },
  { key: "quiz", label: "کوییز", icon: "📝" },
];

async function loadData(): Promise<void> {
  if (!guideId.value) return;
  const data = await hamyarStore.loadGuide(guideId.value);
  guideData.value = data;

  // If query params specify stage or search query, apply them
  if (route.query.stage) {
    const sId = Number(route.query.stage);
    if (!Number.isNaN(sId)) {
      selectedStageId.value = sId;
    }
  }
  if (route.query.q) {
    localSearch.value = String(route.query.q);
  }
}

onMounted(() => {
  void loadData();
});

watch(guideId, () => {
  selectedStageId.value = "all";
  localSearch.value = "";
  void loadData();
});

function goBack(): void {
  void router.push({ name: "hamyar" });
}

const completion = computed(() => hamyarStore.getGuideCompletion(guideId.value));

/** Filtered stages based on selectedStageId, content type and search query */
const filteredStages = computed(() => {
  if (!guideData.value || !guideData.value.stages) return [];

  return guideData.value.stages.filter((stage) => {
    // 1. Stage ID filter
    if (selectedStageId.value !== "all" && stage.id !== selectedStageId.value) {
      return false;
    }

    // 2. Content type & text search filter
    return HamyarSearchEngine.filterStage(stage, localSearch.value, activeContentType.value);
  });
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <!-- Back to Hamyar Catalog button -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800 dark:hover:bg-slate-800"
        @click="goBack"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
        </svg>
        بازگشت به همه راهنماها
      </button>

      <!-- Completion pill -->
      <div v-if="completion.total > 0" class="flex items-center gap-2 text-xs">
        <span class="text-slate-500 dark:text-slate-400">پیشرفت چک‌لیست:</span>
        <span class="rounded-lg bg-teal-100 px-2 py-0.5 font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
          {{ completion.completed }} از {{ completion.total }} ({{ completion.percentage }}٪)
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="hamyarStore.loading && !guideData"
      class="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      <p class="text-sm text-slate-600 dark:text-slate-300">در حال بارگذاری راهنما…</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="hamyarStore.error || !guideMeta"
      class="rounded-2xl bg-rose-50 p-6 text-center text-rose-800 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900"
    >
      <p class="text-sm font-semibold">{{ hamyarStore.error || "راهنما پیدا نشد." }}</p>
      <button
        type="button"
        class="mt-3 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
        @click="loadData"
      >
        تلاش مجدد
      </button>
    </div>

    <!-- Guide Content -->
    <template v-else-if="guideData">
      <!-- Guide Title Header -->
      <div class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div class="flex items-start gap-4">
          <span
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
            :class="[guideMeta.colorClass.bg, guideMeta.colorClass.text]"
          >
            {{ guideMeta.icon }}
          </span>

          <div class="flex flex-1 flex-col gap-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="rounded-md px-2 py-0.5 text-xs font-semibold"
                :class="guideMeta.colorClass.badge"
              >
                {{ guideMeta.tag }}
              </span>
              <span class="text-xs text-slate-400 dark:text-slate-500">
                {{ guideData.stages.length }} مرحله آموزشی
              </span>
            </div>

            <h1 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {{ guideData.title }}
            </h1>

            <p class="text-xs sm:text-sm leading-6 text-slate-600 dark:text-slate-300">
              {{ guideMeta.summary }}
            </p>
          </div>
        </div>

        <!-- Medical/Legal disclaimer note -->
        <div v-if="guideData.disclaimer" class="mt-2 rounded-xl bg-amber-500/10 p-3 text-xs leading-5 text-amber-900 dark:text-amber-200 border-r-2 border-amber-500">
          ⚖️ <strong>سلب مسئولیت آموزشی:</strong> {{ guideData.disclaimer }}
        </div>
      </div>

      <!-- Controls: In-Guide Search & Filters -->
      <div class="sticky top-2 z-10 flex flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-md backdrop-blur ring-1 ring-slate-200 dark:bg-slate-900/95 dark:ring-slate-800">
        <!-- Search within guide -->
        <div class="relative w-full">
          <input
            v-model="localSearch"
            type="search"
            placeholder="جستجو در مراحل، مباحث علمی، چک‌لیست و هشدارهای این راهنما…"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-9 ps-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400"
          />
          <svg
            class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
          <button
            v-if="localSearch"
            type="button"
            class="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            @click="localSearch = ''"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <!-- Filter 1: Stage Selector -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span class="text-slate-400 ms-1 shrink-0 font-medium">مرحله:</span>
          <button
            type="button"
            class="shrink-0 rounded-lg px-2.5 py-1 font-medium transition"
            :class="selectedStageId === 'all'
              ? 'bg-teal-600 text-white dark:bg-teal-500'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'"
            @click="selectedStageId = 'all'"
          >
            همه مراحل ({{ guideData.stages.length }})
          </button>

          <button
            v-for="s in guideData.stages"
            :key="s.id"
            type="button"
            class="shrink-0 rounded-lg px-2.5 py-1 font-medium transition"
            :class="selectedStageId === s.id
              ? 'bg-teal-600 text-white dark:bg-teal-500'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'"
            @click="selectedStageId = s.id"
          >
            مرحله {{ s.id }}
          </button>
        </div>

        <!-- Filter 2: Content Type Selector -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span class="text-slate-400 ms-1 shrink-0 font-medium">محتوا:</span>
          <button
            v-for="opt in contentTypeOptions"
            :key="opt.key"
            type="button"
            class="shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition"
            :class="activeContentType === opt.key
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'"
            @click="activeContentType = opt.key"
          >
            <span>{{ opt.icon }}</span>
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <!-- Stage Results Count -->
      <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          نمایش <strong>{{ filteredStages.length }}</strong> از <strong>{{ guideData.stages.length }}</strong> مرحله
        </span>

        <button
          v-if="localSearch || selectedStageId !== 'all' || activeContentType !== 'all'"
          type="button"
          class="text-teal-600 hover:underline dark:text-teal-400"
          @click="
            localSearch = '';
            selectedStageId = 'all';
            activeContentType = 'all';
          "
        >
          پاک کردن فیلترها
        </button>
      </div>

      <!-- No Matches -->
      <div
        v-if="filteredStages.length === 0"
        class="flex flex-col items-center gap-2 rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
      >
        <span class="text-2xl">🔎</span>
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">
          موردی مطابق با فیلترها یا عبارت جستجو پیدا نشد.
        </p>
        <button
          type="button"
          class="mt-2 text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
          @click="
            localSearch = '';
            selectedStageId = 'all';
            activeContentType = 'all';
          "
        >
          حذف فیلترها و مشاهده همه مراحل
        </button>
      </div>

      <!-- Stages List -->
      <div v-else class="space-y-4">
        <HamyarStageCard
          v-for="stage in filteredStages"
          :key="stage.id"
          :guide-id="guideId"
          :stage="stage"
          :active-content-type="activeContentType"
          :search-query="localSearch"
          :is-open-default="filteredStages.length <= 2 || selectedStageId !== 'all'"
        />
      </div>
    </template>
  </div>
</template>
