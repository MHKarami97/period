<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useHamyarStore } from "@application/stores/hamyarStore";
import type { HamyarGuideData, HamyarContentType } from "@domain/hamyar/HamyarGuide";
import { HamyarSearchEngine } from "@domain/hamyar/HamyarSearchEngine";
import HamyarStageCard from "@presentation/components/hamyar/HamyarStageCard.vue";
import AppIcon from "@presentation/components/common/AppIcon.vue";

const hamyarStore = useHamyarStore();

const guideData = ref<HamyarGuideData | null>(null);
const localSearch = ref("");
const selectedStageId = ref<number | "all">("all");
const activeContentType = ref<HamyarContentType>("all");

const stageQuickFilters = [
  { id: "all", label: "همه ۷ مرحله", iconName: "document", color: "text-slate-600 dark:text-slate-300" },
  { id: 1, label: "۱. تفاوت‌های زن و مرد", iconName: "brain", color: "text-purple-600 dark:text-purple-400" },
  { id: 2, label: "۲. ویژه آقایان", iconName: "male", color: "text-blue-600 dark:text-blue-400" },
  { id: 3, label: "۳. ویژه خانم‌ها", iconName: "female", color: "text-rose-600 dark:text-rose-400" },
  { id: 4, label: "۴. تجربه کم با جنس مخالف", iconName: "handshake", color: "text-amber-600 dark:text-amber-400" },
  { id: 5, label: "۵. گفت‌وگو و حل تعارض", iconName: "chat", color: "text-teal-600 dark:text-teal-400" },
  { id: 6, label: "۶. بایدها و نبایدها", iconName: "balance", color: "text-indigo-600 dark:text-indigo-400" },
  { id: 7, label: "۷. ابراز محبت و زبان عشق", iconName: "heart", color: "text-emerald-600 dark:text-emerald-400" },
] as const;

const contentTypeOptions: readonly { key: HamyarContentType; label: string; iconName: string }[] = [
  { key: "all", label: "همه مطالب", iconName: "document" },
  { key: "knowledge", label: "دانستنی‌ها", iconName: "book" },
  { key: "checklist", label: "اقدامات عملی", iconName: "check-circle" },
  { key: "myths", label: "باورهای غلط", iconName: "lightbulb" },
  { key: "red_flags", label: "خط قرمزها", iconName: "flag" },
  { key: "questions", label: "پرسش‌ها", iconName: "stethoscope" },
  { key: "quiz", label: "کوییز", iconName: "note" },
];

async function loadGuide(): Promise<void> {
  const data = await hamyarStore.loadGuide("couple_communication");
  guideData.value = data;
}

onMounted(() => {
  void loadGuide();
});

const completion = computed(() => hamyarStore.getGuideCompletion("couple_communication"));

const filteredStages = computed(() => {
  if (!guideData.value || !guideData.value.stages) return [];

  return guideData.value.stages.filter((stage) => {
    if (selectedStageId.value !== "all" && stage.id !== selectedStageId.value) {
      return false;
    }
    return HamyarSearchEngine.filterStage(stage, localSearch.value, activeContentType.value);
  });
});

function selectStage(id: number | "all"): void {
  selectedStageId.value = id;
}

function clearFilters(): void {
  localSearch.value = "";
  selectedStageId.value = "all";
  activeContentType.value = "all";
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 1. Header Banner -->
    <div class="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-amber-500/10 p-4.5 sm:p-7 ring-1 ring-rose-500/20 dark:from-rose-950/40 dark:via-slate-900 dark:to-amber-950/20 dark:ring-rose-500/25 shadow-xs">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start sm:items-center gap-3.5">
          <span class="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-300 shadow-xs">
            <AppIcon name="couple_communication" size="xl" filled />
          </span>
          <div class="flex flex-col gap-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                راهنمای جامع ارتباط، شناخت و تعامل عاطفی زوجین
              </h2>
              <span class="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                علمی و کاربردی
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-5 sm:leading-6">
              آموزش تخصصی مهارت‌های مکالمه، درک تفاوت‌های روانی زن و مرد، راهنمای ویژه افراد بدون تجربه زیستی با جنس مخالف، خطوط قرمز و زبان‌های ابراز محبت.
            </p>
          </div>
        </div>

        <!-- Completion pill -->
        <div
          v-if="completion.total > 0"
          class="inline-flex self-start sm:self-center items-center gap-2 rounded-2xl bg-white/90 px-3.5 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-800/90 dark:text-slate-200 dark:ring-slate-700/80 shadow-2xs"
        >
          <AppIcon name="check-circle" size="xs" />
          <span>اقدامات انجام‌شده:</span>
          <span class="font-bold text-teal-600 dark:text-teal-400">
            {{ completion.completed }} از {{ completion.total }} ({{ completion.percentage }}٪)
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Controls: Stage Navigator & Search -->
    <div class="flex flex-col gap-3 rounded-3xl bg-white p-4 sm:p-5 shadow-xs ring-1 ring-slate-200/90 dark:bg-slate-900 dark:ring-slate-800">
      <!-- Search inside couple communication -->
      <div class="relative w-full">
        <input
          v-model="localSearch"
          type="search"
          placeholder="جستجو در مباحث، راه‌حل‌های تعارض، غار تنهایی، زبان‌های عشق، باورها و کوییز..."
          class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pe-9 ps-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-rose-400"
        />
        <span class="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <AppIcon name="search" size="xs" />
        </span>
        <button
          v-if="localSearch"
          type="button"
          class="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:text-slate-500 dark:hover:bg-slate-700 transition"
          @click="localSearch = ''"
        >
          <AppIcon name="x" size="xs" />
        </button>
      </div>

      <!-- Quick Stage Pills (Horizontally Scrollable / Wrap on desktop) -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          v-for="st in stageQuickFilters"
          :key="st.id"
          type="button"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition active:scale-95"
          :class="selectedStageId === st.id
            ? 'bg-rose-600 text-white shadow-sm dark:bg-rose-500'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'"
          @click="selectStage(st.id)"
        >
          <AppIcon :name="st.iconName" size="xs" />
          <span>{{ st.label }}</span>
        </button>
      </div>

      <!-- Content Type Filters -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-t border-slate-100 pt-2.5 dark:border-slate-800">
        <span class="text-slate-400 ms-1 shrink-0 font-medium text-[11px]">دسته‌بندی محتوا:</span>
        <button
          v-for="opt in contentTypeOptions"
          :key="opt.key"
          type="button"
          class="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition active:scale-95"
          :class="activeContentType === opt.key
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'"
          @click="activeContentType = opt.key"
        >
          <AppIcon :name="opt.iconName" size="xs" />
          <span>{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <!-- 3. Results Status / Clear filters -->
    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
      <span>
        نمایش <strong>{{ filteredStages.length }}</strong> بخش از <strong>۷</strong> بخش راهنمای ارتباط
      </span>

      <button
        v-if="localSearch || selectedStageId !== 'all' || activeContentType !== 'all'"
        type="button"
        class="font-semibold text-rose-600 hover:underline dark:text-rose-400 active:scale-95 transition"
        @click="clearFilters"
      >
        حذف فیلترها و مشاهده همه
      </button>
    </div>

    <!-- 4. Loading State -->
    <div
      v-if="hamyarStore.loading && !guideData"
      class="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">در حال بارگذاری راهنمای ارتباط زوجین…</p>
    </div>

    <!-- 5. Empty State -->
    <div
      v-else-if="filteredStages.length === 0"
      class="flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
    >
      <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
        <AppIcon name="search" size="lg" />
      </span>
      <p class="text-sm font-bold text-slate-800 dark:text-slate-200">
        موردی مطابق با فیلتر یا عبارت جستجو در راهنمای ارتباط پیدا نشد.
      </p>
      <button
        type="button"
        class="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
        @click="clearFilters"
      >
        پاک کردن فیلترها و نمایش همه مراحل
      </button>
    </div>

    <!-- 6. Stages List -->
    <div v-else class="space-y-4">
      <HamyarStageCard
        v-for="stage in filteredStages"
        :key="stage.id"
        guide-id="couple_communication"
        :stage="stage"
        :active-content-type="activeContentType"
        :search-query="localSearch"
        :is-open-default="filteredStages.length <= 2 || selectedStageId !== 'all'"
      />
    </div>
  </div>
</template>