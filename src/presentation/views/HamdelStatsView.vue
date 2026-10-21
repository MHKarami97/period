<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useProfileStore } from "@application/stores/profileStore";
import { buildHamdelStats, buildTrend, type TrendGranularity } from "@domain/hamdel/hamdelStats";
import { buildCountdowns, describeDaysLeft } from "@domain/hamdel/importantDates";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { jalaliPeriodBucketer } from "@infrastructure/calendar/JalaliPeriodBucketer";
import { jalaliYearlyCalendar } from "@infrastructure/calendar/JalaliYearlyCalendar";
import { HamdelReportService } from "@infrastructure/pdf/HamdelReportService";
import DistributionBars from "@presentation/components/hamdel/DistributionBars.vue";
import TrendBars from "@presentation/components/hamdel/TrendBars.vue";
import { useToast } from "@presentation/composables/useToast";

const GRANULARITY_OPTIONS: readonly { id: TrendGranularity; label: string }[] = [
  { id: "week", label: "هفتگی" },
  { id: "month", label: "ماهانه" },
];
const TREND_POINTS: Readonly<Record<TrendGranularity, number>> = { week: 8, month: 6 };

const store = useHamdelStore();
const profileStore = useProfileStore();
const { showToast } = useToast();

const granularity = ref<TrendGranularity>("week");
const includePhotos = ref(false);
const isExporting = ref(false);

const today = computed(() => DateOnly.today());
const stats = computed(() => buildHamdelStats(store.entries, today.value));
const trend = computed(() => buildTrend(store.entries, today.value, jalaliPeriodBucketer, granularity.value, TREND_POINTS[granularity.value]));
const upcoming = computed(() =>
  buildCountdowns(store.entriesOf("dates"), today.value, jalaliYearlyCalendar).filter((item) => item.daysLeft !== null).slice(0, 3),
);
const filledSections = computed(() => stats.value.sectionCounts.filter((item) => item.count > 0));
const hasTrendData = computed(() => trend.value.some((point) => point.happiness + point.sadness > 0));

const formatNumber = (value: number): string => value.toLocaleString("fa-IR");
const positivePercent = computed(() => (stats.value.mood.positiveRatio === null ? null : Math.round(stats.value.mood.positiveRatio * 100)));

async function exportPdf(): Promise<void> {
  if (isExporting.value) return;
  isExporting.value = true;
  try {
    await HamdelReportService.openFullReport(store.entries, {
      profileName: profileStore.activeProfile?.name ?? "",
      includePhotos: includePhotos.value,
    });
  } catch {
    showToast("باز نشد؛ اجازه‌ی پنجره‌ی بازشو (popup) را بدهید.", 2500);
  } finally {
    isExporting.value = false;
  }
}

onMounted(() => void store.ensureLoaded());
watch(() => profileStore.activeProfileId, () => void store.ensureLoaded());
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">📊 آمار و گزارش PDF</h1>
      <RouterLink :to="{ name: 'hamdel' }" class="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800">همدل ←</RouterLink>
    </div>

    <p v-if="stats.totalEntries === 0" class="rounded-2xl bg-white p-6 text-center text-sm leading-7 text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
      هنوز یادداشتی ثبت نشده. با ثبت خوشحالی‌ها، ناراحتی‌ها و بقیه‌ی موارد، اینجا نمودار و آمار می‌بینی.
    </p>

    <template v-else>
      <section class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">روحیه در ۳۰ روز اخیر</h2>
        <template v-if="positivePercent !== null">
          <div class="flex items-end justify-between">
            <span class="text-3xl font-bold text-emerald-500">{{ formatNumber(positivePercent) }}٪</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">روزهای خوب از میان ثبت‌شده‌ها</span>
          </div>
          <div class="flex h-2 w-full overflow-hidden rounded-full bg-rose-200 dark:bg-rose-500/30" dir="ltr">
            <div class="h-full bg-emerald-400" :style="{ width: `${positivePercent}%` }" />
          </div>
          <p class="text-xs leading-6 text-slate-600 dark:text-slate-300">
            {{ formatNumber(stats.mood.happiness) }} خوشحالی
            <template v-if="stats.mood.averageHappinessIntensity !== null">(میانگین شدت {{ formatNumber(stats.mood.averageHappinessIntensity) }})</template>
            و {{ formatNumber(stats.mood.sadness) }} ناراحتی
            <template v-if="stats.mood.averageSadnessIntensity !== null">(میانگین شدت {{ formatNumber(stats.mood.averageSadnessIntensity) }})</template>
          </p>
        </template>
        <p v-else class="text-xs text-slate-500 dark:text-slate-400">در ۳۰ روز اخیر خوشحالی یا ناراحتی ثبت نشده.</p>
      </section>

      <section class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">روند خوشحالی و ناراحتی</h2>
          <div class="flex gap-1" role="group" aria-label="بازه">
            <button
              v-for="option in GRANULARITY_OPTIONS"
              :key="option.id"
              type="button"
              :aria-pressed="granularity === option.id"
              class="rounded-full px-3 py-1 text-xs"
              :class="granularity === option.id ? 'bg-teal-500/15 text-teal-700 ring-1 ring-teal-500 dark:text-teal-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
              @click="granularity = option.id"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <TrendBars v-if="hasTrendData" :points="trend" />
        <p v-else class="py-6 text-center text-xs text-slate-500 dark:text-slate-400">در این بازه داده‌ای ثبت نشده.</p>
      </section>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DistributionBars title="واکنش به هدیه و قرار" :items="stats.reactions" bar-class="bg-rose-400" />
        <DistributionBars title="قول‌ها" :items="stats.promises" bar-class="bg-teal-400" />
        <DistributionBars title="هدیه‌ها" :items="stats.gifts" bar-class="bg-amber-400" />
        <DistributionBars title="آرزوها" :items="stats.wishlist" bar-class="bg-sky-400" />
        <DistributionBars title="اشاره‌ها (کاش داشتم)" :items="stats.hints" bar-class="bg-violet-400" />
      </div>

      <section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article class="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <span class="text-2xl font-bold text-rose-500">{{ formatNumber(stats.messagesSaidLast30Days) }}</span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">پیام محبت‌آمیز در ۳۰ روز اخیر</span>
        </article>
        <article class="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <span class="text-2xl font-bold text-teal-500">{{ formatNumber(stats.challenges.active) }}</span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">چالش در جریان ({{ formatNumber(stats.challenges.completed) }} کامل‌شده)</span>
        </article>
        <article class="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <span class="text-2xl font-bold text-amber-500">{{ formatNumber(stats.pendingCalls) }}</span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">تماس یا پیام در انتظار</span>
        </article>
        <article class="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <span class="text-2xl font-bold text-slate-700 dark:text-slate-200">{{ formatNumber(stats.totalEntries) }}</span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">کل یادداشت‌ها</span>
        </article>
      </section>

      <section v-if="upcoming.length > 0" class="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">تاریخ‌های مهم پیش‌رو</h2>
        <ul class="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
          <li v-for="item in upcoming" :key="item.entry.id">{{ item.entry.valueOf("title") }} - {{ describeDaysLeft(item.daysLeft ?? 0) }}</li>
        </ul>
      </section>

      <section class="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">تعداد یادداشت در هر بخش</h2>
        <ul class="flex flex-wrap gap-2">
          <li v-for="item in filledSections" :key="item.section">
            <RouterLink :to="`/app/hamdel/${item.section}`" class="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
              {{ item.icon }} {{ item.title }} <span class="text-slate-400">{{ formatNumber(item.count) }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </template>

    <section class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">خروجی PDF همه‌ی همدل</h2>
      <p class="text-xs leading-6 text-slate-500 dark:text-slate-400">
        خلاصه‌ی آمار و همه‌ی بخش‌ها در یک سند. در پنجره‌ی چاپ سیستم «Save as PDF» را انتخاب کن. فایل شامل اطلاعات خصوصی است.
      </p>
      <label class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <input v-model="includePhotos" type="checkbox" class="h-4 w-4 accent-teal-500" />
        عکس‌های دفترچه هم در گزارش باشد (حجم بیشتر)
      </label>
      <button
        type="button"
        class="rounded-xl bg-rose-500/90 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isExporting || store.entries.length === 0"
        @click="exportPdf"
      >
        {{ isExporting ? "در حال آماده‌سازی..." : "ساخت گزارش PDF" }}
      </button>
    </section>
  </div>
</template>
