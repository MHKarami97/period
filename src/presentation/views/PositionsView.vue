<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { useAccessStore } from "@application/stores/accessStore";
import { usePositionsStore } from "@application/stores/positionsStore";
import type { Position } from "@domain/positions/Position";
import { useInfiniteScroll } from "@presentation/composables/useInfiniteScroll";
import PositionCard from "@presentation/components/positions/PositionCard.vue";
import PositionDetailDialog from "@presentation/components/positions/PositionDetailDialog.vue";
import GamePageHeader from "@presentation/components/games/GamePageHeader.vue";
import PositionFilterPanel from "@presentation/components/positions/PositionFilterPanel.vue";
import PositionRandomSettingsPanel from "@presentation/components/positions/PositionRandomSettingsPanel.vue";
import AccessGate from "@presentation/components/shared/AccessGate.vue";

const SEARCH_DEBOUNCE_MS = 200;

const accessStore = useAccessStore();
const store = usePositionsStore();

const searchText = ref(store.query);
const isFilterOpen = ref(false);
const isRandomSettingsOpen = ref(false);
// The auto-advance timer only runs for positions reached through the random button.
const isRandomSession = ref(false);
const selectedPosition = shallowRef<Position | null>(null);
let searchTimeoutId: number | null = null;

watch(
  () => accessStore.isUnlocked,
  (isUnlocked) => {
    if (isUnlocked) void store.ensureLoaded();
  },
  { immediate: true },
);

watch(searchText, (text) => {
  if (searchTimeoutId !== null) window.clearTimeout(searchTimeoutId);
  searchTimeoutId = window.setTimeout(() => store.setQuery(text), SEARCH_DEBOUNCE_MS);
});

const { sentinel } = useInfiniteScroll(() => store.loadMore(), () => store.visible.length);

const autoAdvanceSeconds = computed(() => (isRandomSession.value && store.autoAdvance.enabled ? store.autoAdvance.seconds : null));

function openRandomPosition(): void {
  const picked = store.pickRandom(selectedPosition.value?.id ?? null);
  if (!picked) return;
  isRandomSession.value = true;
  selectedPosition.value = picked;
}

function openPosition(position: Position): void {
  isRandomSession.value = false;
  selectedPosition.value = position;
}

function closePosition(): void {
  isRandomSession.value = false;
  selectedPosition.value = null;
}

function relock(): void {
  closePosition();
  accessStore.lock();
}

onBeforeUnmount(() => {
  if (searchTimeoutId !== null) window.clearTimeout(searchTimeoutId);
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-4">
    <GamePageHeader title="📖 پوزیشن‌ها" />

    <AccessGate v-if="!accessStore.isUnlocked" message="برای دیدن پوزیشن‌ها، رمز را وارد کنید." />

    <template v-else>
      <div v-if="store.status === 'loading' || store.status === 'idle'" class="py-10 text-center text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
        در حال بازگشایی اطلاعات…
      </div>

      <div v-else-if="store.status === 'error'" class="flex flex-col items-center gap-3 p-6 text-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" role="alert">
        <p class="text-sm text-rose-600 dark:text-rose-300">
          {{
            store.errorKind === "password"
              ? "فایل‌ها با رمز فعلی باز نشدند. احتمالاً با رمز دیگری رمزگذاری شده‌اند."
              : "فایل‌های پوزیشن‌ها پیدا یا خوانده نشد. اتصال را بررسی کنید."
          }}
        </p>
        <div class="flex gap-2">
          <button type="button" class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="store.retry()">تلاش دوباره</button>
          <button v-if="store.errorKind === 'password'" type="button" class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="relock">ورود با رمز دیگر</button>
        </div>
      </div>

      <template v-else>
        <div class="flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <input
            v-model="searchText"
            type="search"
            placeholder="جستجو در عنوان، تگ‌ها و متن…"
            class="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          />
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-sm transition"
              :class="isFilterOpen || store.filter.activeCount > 0 ? 'bg-teal-500/10 text-teal-600 ring-1 ring-teal-500 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
              :aria-expanded="isFilterOpen"
              @click="isFilterOpen = !isFilterOpen"
            >
              فیلتر<span v-if="store.filter.activeCount > 0"> ({{ store.filter.activeCount }})</span>
            </button>
            <button
              type="button"
              class="rounded-lg bg-rose-500/90 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="store.randomCandidates.length === 0"
              @click="openRandomPosition"
            >
              🎲 پوزیشن تصادفی
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-sm transition"
              :class="isRandomSettingsOpen || store.randomExclusions.count > 0 || store.autoAdvance.enabled ? 'bg-rose-500/10 text-rose-600 ring-1 ring-rose-400 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
              :aria-expanded="isRandomSettingsOpen"
              @click="isRandomSettingsOpen = !isRandomSettingsOpen"
            >
              ⚙️ تنظیمات تصادفی
            </button>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {{ store.results.length }} مورد از {{ store.totalCount }}
              <template v-if="store.randomCandidates.length !== store.results.length"> · {{ store.randomCandidates.length }} مورد در انتخاب تصادفی</template>
            </span>
            <button v-if="store.filter.activeCount > 0" type="button" class="text-rose-500 hover:underline" @click="store.clearFilters()">
              پاک کردن فیلترها
            </button>
          </div>
        </div>

        <PositionFilterPanel v-if="isFilterOpen" />
        <PositionRandomSettingsPanel v-if="isRandomSettingsOpen" />

        <p v-if="store.results.length === 0" class="py-10 text-center text-sm text-slate-500 dark:text-slate-400">موردی پیدا نشد.</p>

        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <PositionCard v-for="position in store.visible" :key="position.id" :position="position" @open="openPosition" />
        </div>

        <div v-if="store.hasMore" ref="sentinel" class="py-6 text-center text-xs text-slate-400" aria-hidden="true">در حال بارگذاری بیشتر…</div>

        <button type="button" class="mx-auto rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" @click="relock">قفل کردن (فراموش کردن رمز)</button>
      </template>
    </template>

    <PositionDetailDialog
      :position="selectedPosition"
      :can-pick-random="store.randomCandidates.length > 0"
      :auto-advance-seconds="autoAdvanceSeconds"
      @close="closePosition"
      @random="openRandomPosition"
    />
  </div>
</template>
