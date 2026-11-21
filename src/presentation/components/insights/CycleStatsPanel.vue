<script setup lang="ts">
import { computed } from "vue";
import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { CycleStatisticsCalculator, REGULARITY_LABELS_FA, type Regularity } from "@domain/insights/CycleStatistics";
import { SymptomPatternAnalyzer } from "@domain/insights/SymptomPatternAnalyzer";
import { tagLabel } from "@domain/insights/SymptomTags";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useJalali } from "@presentation/composables/useJalali";

const cycleStore = useCycleStore();
const symptomStore = useSymptomStore();
const { toJalaliLabel } = useJalali();

const stats = computed(() => CycleStatisticsCalculator.calculate(cycleStore.sortedCycles));
const analysis = computed(() => SymptomPatternAnalyzer.analyze(cycleStore.sortedCycles, symptomStore.symptoms));

const REGULARITY_CLASSES: Readonly<Record<Regularity, string>> = {
  unknown: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  regular: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  variable: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  irregular: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

const fa = (value: number | null, unit = ""): string => (value === null ? "—" : `${value.toLocaleString("fa-IR")}${unit ? ` ${unit}` : ""}`);

const CHART_WIDTH = 320;
const CHART_HEIGHT = 150;
const CHART_TOP = 14;
const CHART_BOTTOM = 124;
const NORMAL_MIN = 21;
const NORMAL_MAX = 35;

const barChart = computed(() => {
  const lengths = stats.value.lengths;
  const scaleMax = Math.max(45, ...lengths.map((point) => point.length + 3));
  const y = (value: number): number => CHART_BOTTOM - (value / scaleMax) * (CHART_BOTTOM - CHART_TOP);
  const step = CHART_WIDTH / Math.max(lengths.length, 1);
  return {
    bandTop: y(NORMAL_MAX),
    bandHeight: y(NORMAL_MIN) - y(NORMAL_MAX),
    bars: lengths.map((point, index) => ({
      x: index * step + step * 0.18,
      width: step * 0.64,
      y: y(point.length),
      height: CHART_BOTTOM - y(point.length),
      value: point.length,
      label: toJalaliLabel(DateOnly.fromIsoString(point.startIso), "MM/dd"),
      outOfRange: point.length < NORMAL_MIN || point.length > NORMAL_MAX,
    })),
  };
});

const temperatureLine = computed(() => {
  const points = analysis.value.temperatures;
  if (points.length < 3) return null;
  const values = points.map((point) => point.value);
  const min = Math.min(...values) - 0.1;
  const max = Math.max(...values) + 0.1;
  const step = CHART_WIDTH / Math.max(points.length - 1, 1);
  const coordinates = points.map((point, index) => ({
    x: index * step,
    y: CHART_BOTTOM - ((point.value - min) / (max - min)) * (CHART_BOTTOM - CHART_TOP),
    value: point.value,
  }));
  return { path: coordinates.map((item) => `${item.x.toFixed(1)},${item.y.toFixed(1)}`).join(" "), min, max, coordinates };
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">آمار چرخه</h2>
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="REGULARITY_CLASSES[stats.regularity]">{{ REGULARITY_LABELS_FA[stats.regularity] }}</span>
      </div>

      <p v-if="stats.cycleCount < 2" class="text-sm text-slate-500 dark:text-slate-400">برای دیدن آمار، دست‌کم دو پریود ثبت کنید.</p>
      <template v-else>
        <dl class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div class="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60">
            <dt class="text-[11px] font-bold text-slate-500 dark:text-slate-400">میانگین چرخه</dt>
            <dd class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ fa(stats.averageLength, "روز") }}</dd>
          </div>
          <div class="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60">
            <dt class="text-[11px] font-bold text-slate-500 dark:text-slate-400">کوتاه‌ترین تا بلندترین</dt>
            <dd class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ fa(stats.minLength) }} تا {{ fa(stats.maxLength) }}</dd>
          </div>
          <div class="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60">
            <dt class="text-[11px] font-bold text-slate-500 dark:text-slate-400">میانگین پریود</dt>
            <dd class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ fa(stats.averagePeriodLength, "روز") }}</dd>
          </div>
          <div class="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60">
            <dt class="text-[11px] font-bold text-slate-500 dark:text-slate-400">انحراف معیار</dt>
            <dd class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ fa(stats.standardDeviation, "روز") }}</dd>
          </div>
        </dl>

        <figure v-if="barChart.bars.length > 0" class="flex flex-col gap-1">
          <svg :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`" class="w-full text-slate-500 dark:text-slate-400" role="img" aria-label="نمودار طول چرخه‌های اخیر" dir="ltr">
            <rect x="0" :y="barChart.bandTop" :width="CHART_WIDTH" :height="barChart.bandHeight" class="fill-emerald-500/10" />
            <g v-for="bar in barChart.bars" :key="bar.label">
              <rect :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" rx="3" :class="bar.outOfRange ? 'fill-amber-500' : 'fill-rose-400 dark:fill-rose-500'" />
              <text :x="bar.x + bar.width / 2" :y="bar.y - 3" text-anchor="middle" font-size="9" fill="currentColor">{{ bar.value }}</text>
              <text :x="bar.x + bar.width / 2" :y="CHART_BOTTOM + 12" text-anchor="middle" font-size="8" fill="currentColor">{{ bar.label }}</text>
            </g>
          </svg>
          <figcaption class="text-[11px] text-slate-500 dark:text-slate-400">هر ستون طول یک چرخه (روز) است؛ نوار سبز، بازه‌ی رایج ۲۱ تا ۳۵ روز.</figcaption>
        </figure>
      </template>
    </section>

    <section v-if="stats.alerts.length > 0" class="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">نکات قابل توجه</h2>
      <ul class="flex flex-col gap-2">
        <li
          v-for="alert in stats.alerts"
          :key="alert.id"
          class="rounded-2xl p-3 text-sm leading-6 ring-1"
          :class="alert.severity === 'warning' ? 'bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/25' : 'bg-sky-50 text-sky-900 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/25'"
        >
          {{ alert.severity === "warning" ? "⚠️" : "ℹ️" }} {{ alert.text }}
        </li>
      </ul>
      <p class="text-[11px] leading-5 text-slate-400 dark:text-slate-500">این‌ها غربالگری ساده‌ی داده‌های خودتان‌اند، نه تشخیص پزشکی.</p>
    </section>

    <section class="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">الگوهای علائم</h2>
      <ul v-if="analysis.insights.length > 0" class="flex flex-col gap-2">
        <li v-for="insight in analysis.insights" :key="insight.id" class="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700/60">
          <span aria-hidden="true">{{ insight.icon }}</span>
          <span>{{ insight.text }}</span>
        </li>
      </ul>
      <p v-else class="text-sm text-slate-500 dark:text-slate-400">الگویی پیدا نشد. با ثبت علائم در چند چرخه، الگوهای تکرارشونده اینجا نمایش داده می‌شود (دست‌کم ۳ بار در ۲ چرخه).</p>

      <div v-if="analysis.topTags.length > 0" class="flex flex-wrap gap-1.5">
        <span v-for="item in analysis.topTags" :key="item.tag" class="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs text-rose-600 dark:bg-rose-500/20 dark:text-rose-200">
          {{ tagLabel(item.tag) }} · {{ item.count.toLocaleString("fa-IR") }}
        </span>
      </div>
      <p v-if="analysis.averageSleep !== null" class="text-xs text-slate-500 dark:text-slate-400">😴 میانگین خواب ۱۴ روز اخیر: {{ fa(analysis.averageSleep, "ساعت") }}</p>
    </section>

    <section v-if="temperatureLine" class="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 class="text-base font-medium text-slate-900 dark:text-slate-100">دمای پایه‌ی بدن (۴۵ روز اخیر)</h2>
      <svg :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`" class="w-full text-slate-500 dark:text-slate-400" role="img" aria-label="نمودار دمای پایه" dir="ltr">
        <polyline :points="temperatureLine.path" fill="none" stroke-width="2" stroke-linejoin="round" class="stroke-violet-500 dark:stroke-violet-400" />
        <circle v-for="(point, index) in temperatureLine.coordinates" :key="index" :cx="point.x" :cy="point.y" r="2.5" class="fill-violet-500 dark:fill-violet-400" />
        <text x="0" y="10" font-size="9" fill="currentColor">{{ temperatureLine.max.toFixed(2) }}</text>
        <text x="0" :y="CHART_BOTTOM + 12" font-size="9" fill="currentColor">{{ temperatureLine.min.toFixed(2) }}</text>
      </svg>
      <p class="text-[11px] leading-5 text-slate-500 dark:text-slate-400">افزایش کوچک و پایدار دما معمولاً بعد از تخمک‌گذاری دیده می‌شود، اما برای پیشگیری یا برنامه‌ریزی بارداری به‌تنهایی قابل اتکا نیست.</p>
    </section>
  </div>
</template>
