<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useHamyarStore } from "@application/stores/hamyarStore";
import { HAMYAR_CATEGORIES } from "@presentation/hamyar/hamyarCatalog";
import type { HamyarGuideMeta, HamyarSearchResult } from "@domain/hamyar/HamyarGuide";
import HamyarCard from "@presentation/components/hamyar/HamyarCard.vue";

const router = useRouter();
const hamyarStore = useHamyarStore();

const searchInputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  // Preload all guides in the background so global search is instant
  void hamyarStore.loadAllGuides();
});

function openGuide(guide: HamyarGuideMeta): void {
  void router.push({ name: "hamyar-guide", params: { guideId: guide.id } });
}

function openSearchResult(result: HamyarSearchResult): void {
  void router.push({
    name: "hamyar-guide",
    params: { guideId: result.guideId },
    query: {
      stage: result.stageId ? String(result.stageId) : undefined,
      q: hamyarStore.searchQuery || undefined,
    },
  });
}

function clearSearch(): void {
  hamyarStore.searchQuery = "";
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <!-- Header banner -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-2xl text-teal-600 dark:bg-teal-500/20 dark:text-teal-300">
            🌱
          </span>
          <div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">
              همیار مراحل زندگی
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              راهنماهای جامع و شواهد‌محور برای مهم‌ترین دوره‌های زندگی مشترک و خانواده
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search bar & filters -->
    <div class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <!-- Search input -->
      <div class="relative w-full">
        <input
          ref="searchInputRef"
          v-model="hamyarStore.searchQuery"
          type="search"
          placeholder="جستجو در کل همیار (مباحث، چک‌لیست‌ها، باورهای غلط، هشدارها، کوییز...)"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pe-10 ps-11 text-sm text-slate-900 placeholder-slate-400 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400 dark:focus:bg-slate-900"
        />
        <svg
          class="absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clip-rule="evenodd"
          />
        </svg>

        <button
          v-if="hamyarStore.searchQuery"
          type="button"
          class="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:text-slate-500 dark:hover:bg-slate-700"
          @click="clearSearch"
        >
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <!-- Categories Filter (when not searching or with search) -->
      <div v-if="!hamyarStore.searchQuery" class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          v-for="cat in HAMYAR_CATEGORIES"
          :key="cat.key"
          type="button"
          class="shrink-0 rounded-xl px-3 py-1.5 font-medium transition"
          :class="hamyarStore.selectedCategory === cat.key
            ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
          @click="hamyarStore.selectedCategory = cat.key"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Search content-type filter (when searching) -->
      <div v-else class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span class="text-slate-400 ms-1 shrink-0 font-medium">فیلتر نتایج:</span>
        <button
          type="button"
          class="shrink-0 rounded-lg px-2.5 py-1 transition"
          :class="hamyarStore.selectedResultType === 'all'
            ? 'bg-teal-600 text-white dark:bg-teal-500'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          @click="hamyarStore.selectedResultType = 'all'"
        >
          همه نتایج ({{ hamyarStore.globalSearchResults.length }})
        </button>
        <button
          type="button"
          class="shrink-0 rounded-lg px-2.5 py-1 transition"
          :class="hamyarStore.selectedResultType === 'checklist'
            ? 'bg-teal-600 text-white dark:bg-teal-500'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          @click="hamyarStore.selectedResultType = 'checklist'"
        >
          اقدامات و چک‌لیست
        </button>
        <button
          type="button"
          class="shrink-0 rounded-lg px-2.5 py-1 transition"
          :class="hamyarStore.selectedResultType === 'myth'
            ? 'bg-teal-600 text-white dark:bg-teal-500'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          @click="hamyarStore.selectedResultType = 'myth'"
        >
          باورهای غلط
        </button>
        <button
          type="button"
          class="shrink-0 rounded-lg px-2.5 py-1 transition"
          :class="hamyarStore.selectedResultType === 'red_flag'
            ? 'bg-teal-600 text-white dark:bg-teal-500'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          @click="hamyarStore.selectedResultType = 'red_flag'"
        >
          علائم هشدار
        </button>
        <button
          type="button"
          class="shrink-0 rounded-lg px-2.5 py-1 transition"
          :class="hamyarStore.selectedResultType === 'knowledge'
            ? 'bg-teal-600 text-white dark:bg-teal-500'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          @click="hamyarStore.selectedResultType = 'knowledge'"
        >
          دانستنی‌ها و شواهد
        </button>
      </div>
    </div>

    <!-- Mode A: Global Search Results -->
    <div v-if="hamyarStore.searchQuery" class="flex flex-col gap-3">
      <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          یافته‌ها برای «{{ hamyarStore.searchQuery }}»:
          <strong class="text-teal-600 dark:text-teal-400">{{ hamyarStore.globalSearchResults.length }}</strong> مورد
        </span>
        <button type="button" class="text-teal-600 hover:underline dark:text-teal-400" @click="clearSearch">
          پاک کردن جستجو
        </button>
      </div>

      <!-- Empty results -->
      <div
        v-if="hamyarStore.globalSearchResults.length === 0"
        class="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
      >
        <span class="text-3xl">🔍</span>
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">
          موردی با این عبارت در راهنماها پیدا نشد.
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          کلمات دیگری مثل «ازدواج»، «تعارض»، «بارداری»، «کودک»، «لانه خالی» یا «مالی» را جستجو کنید.
        </p>
      </div>

      <!-- Results List -->
      <div v-else class="space-y-3">
        <button
          v-for="(res, idx) in hamyarStore.globalSearchResults"
          :key="idx"
          type="button"
          class="group flex w-full flex-col gap-2 rounded-2xl bg-white p-4 text-right shadow-sm ring-1 ring-slate-200 transition hover:ring-teal-400/60 active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-teal-500/50"
          @click="openSearchResult(res)"
        >
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                {{ res.guideTitle }}
              </span>
              <span v-if="res.stageTitle" class="text-xs text-slate-500 dark:text-slate-400">
                • {{ res.stageTitle }}
              </span>
            </div>

            <span class="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {{ res.contentTypeLabel }}
            </span>
          </div>

          <h4 class="text-sm font-bold text-slate-900 group-hover:text-teal-600 dark:text-slate-100 dark:group-hover:text-teal-400">
            {{ res.title }}
          </h4>

          <p class="text-xs leading-6 text-slate-600 dark:text-slate-300">
            {{ res.snippet }}
          </p>

          <div class="flex justify-end pt-1">
            <span class="flex items-center gap-1 text-xs font-medium text-teal-600 group-hover:underline dark:text-teal-400">
              مشاهده در راهنما ←
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Mode B: Catalog Grid -->
    <div v-else class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-700 dark:text-slate-300">
          راهنماهای در دسترس ({{ hamyarStore.visibleGuides.length }})
        </h2>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HamyarCard
          v-for="guide in hamyarStore.visibleGuides"
          :key="guide.id"
          :guide="guide"
          @open="openGuide"
        />
      </div>

      <!-- Info note -->
      <div class="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 dark:bg-slate-900/50 dark:border-slate-800">
        <div class="flex items-start gap-3">
          <span class="text-xl">🛡️</span>
          <div class="flex flex-col gap-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            <span class="font-bold text-slate-800 dark:text-slate-200">
              سیاست علمی و حفظ حریم خصوصی همیار
            </span>
            <p>
              تمام این راهنماها بر پایه مرور شواهد بالینی و پژوهشی بین‌المللی گردآوری شده‌اند
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
