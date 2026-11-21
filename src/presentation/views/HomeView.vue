<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useHomeDashboard } from "@presentation/composables/useHomeDashboard";
import HomeHeroCard from "@presentation/components/home/HomeHeroCard.vue";
import HomeSectionCard from "@presentation/components/home/HomeSectionCard.vue";
import HomeSuggestionList from "@presentation/components/home/HomeSuggestionList.vue";
import ProfileSwitcher from "@presentation/components/shared/ProfileSwitcher.vue";

const appModeStore = useAppModeStore();
const {
  greeting,
  cycleSummary,
  tipHeading,
  tip,
  needsSymptomLog,
  partnerSuggestions,
  hamdelStats,
  playSuggestions,
  challenge,
  challengeWeek,
  markChallengeDone,
  lifeStagesSummary,
  coupleGuideSummary,
} = useHomeDashboard();

const formatNumber = (value: number): string => value.toLocaleString("fa-IR");

const lifeProgressLabel = computed(() => {
  const summary = lifeStagesSummary.value;
  if (summary.totalItems === 0) return "در حال بارگذاری راهنماها...";
  return `${formatNumber(summary.finishedGuides)} راهنما از ${formatNumber(summary.guideCount)} کامل شده · ${formatNumber(summary.remainingItems)} مورد باقی مانده`;
});

const coupleProgressLabel = computed(() => {
  const summary = coupleGuideSummary.value;
  if (summary.totalItems === 0) return "در حال بارگذاری راهنما...";
  return `${formatNumber(summary.completedItems)} از ${formatNumber(summary.totalItems)} مورد انجام شده · ${formatNumber(summary.remainingItems)} مورد باقی مانده`;
});

const weekLabel = computed(() =>
  challengeWeek.value.total === 0 ? "" : `${formatNumber(challengeWeek.value.completed)} از ${formatNumber(challengeWeek.value.total)} چالش این هفته انجام شده`,
);
const weekPercent = computed(() => (challengeWeek.value.total === 0 ? 0 : Math.round((challengeWeek.value.completed / challengeWeek.value.total) * 100)));
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-4">
    <ProfileSwitcher v-if="appModeStore.isPartnerMode" />

    <HomeHeroCard :greeting="greeting" :summary="cycleSummary" :tip-heading="tipHeading" :tip="tip" :needs-symptom-log="needsSymptomLog" />

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <HomeSectionCard
        class="md:col-span-2"
        title="چالش امروز"
        subtitle="چالش‌های روزانه و هفتگی دونفره"
        icon="🎯"
        tone="amber"
        :to="{ name: 'game-daily-challenges' }"
        :cta-label="challenge.kind === 'no-plan' ? 'ساخت برنامه‌ی هفته' : 'رفتن به چالش‌ها'"
        :progress="challengeWeek.total > 0 ? weekPercent : null"
        :progress-label="weekLabel"
      >
        <p v-if="challenge.kind === 'no-plan'" class="text-sm leading-6 text-slate-600 dark:text-slate-300">برنامه‌ی این هفته هنوز ساخته نشده است. با یک لمس برای هر روز یک چالش دونفره بگیرید.</p>
        <p v-else-if="challenge.kind === 'no-today'" class="text-sm leading-6 text-slate-600 dark:text-slate-300">برای امروز چالشی در برنامه نیست.</p>
        <p v-else-if="challenge.kind === 'off'" class="text-sm leading-6 text-slate-600 dark:text-slate-300">🏖 امروز روز آف است: {{ challenge.reason }}</p>
        <template v-else>
          <div class="rounded-2xl bg-amber-50 p-3.5 ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:ring-amber-500/20">
            <p v-if="challenge.kind === 'pending'" class="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">⏰ امروز یادتان نرود انجام بدهید</p>
            <p v-else-if="challenge.kind === 'completed'" class="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">✅ انجام شد؛ دستتان درد نکند</p>
            <p v-else class="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">این چالش رد شد</p>
            <p class="text-sm font-bold leading-6 text-slate-900 dark:text-slate-100">{{ challenge.title }}</p>
            <p v-if="challenge.description" class="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{{ challenge.description }}</p>
          </div>
          <button v-if="challenge.kind === 'pending'" type="button" class="self-start rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-600 active:scale-95" @click="markChallengeDone">
            انجامش دادیم ✓
          </button>
        </template>
      </HomeSectionCard>

      <HomeSectionCard title="همدل" subtitle="دفترچه‌ی شناخت او" icon="💞" tone="rose" :to="{ name: 'hamdel' }" cta-label="رفتن به همدل">
        <div class="flex flex-wrap gap-2 text-xs">
          <span class="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ formatNumber(hamdelStats.totalEntries) }} یادداشت</span>
          <span v-if="hamdelStats.openPromises > 0" class="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">{{ formatNumber(hamdelStats.openPromises) }} قول باز</span>
          <span v-if="hamdelStats.nextOccasion" class="rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-800 dark:bg-rose-500/20 dark:text-rose-300">{{ hamdelStats.nextOccasion.title }}: {{ hamdelStats.nextOccasion.label }}</span>
        </div>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400">امروز با این کار خوشحالش کن</p>
        <HomeSuggestionList :suggestions="partnerSuggestions" />
      </HomeSectionCard>

      <HomeSectionCard title="همراز" subtitle="بازی و گفت‌وگوی دونفره" icon="🎲" tone="violet" :to="{ name: 'games' }" cta-label="رفتن به همراز">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400">پیشنهاد امروز برای شما دو نفر</p>
        <HomeSuggestionList :suggestions="playSuggestions" />
      </HomeSectionCard>

      <HomeSectionCard
        title="همیار · مراحل زندگی"
        subtitle="راهنماهای علمی هر مرحله"
        icon="🌱"
        tone="teal"
        :to="{ name: 'hamyar' }"
        cta-label="رفتن به همیار"
        :progress="lifeStagesSummary.totalItems > 0 ? lifeStagesSummary.percent : null"
        :progress-label="lifeProgressLabel"
      >
        <RouterLink
          v-if="lifeStagesSummary.recommended"
          :to="{ name: 'hamyar-guide', params: { guideId: lifeStagesSummary.recommended.id } }"
          class="flex items-center gap-3 rounded-2xl bg-teal-50 p-3 ring-1 ring-teal-200/70 transition hover:bg-teal-100/70 active:scale-[0.99] dark:bg-teal-500/10 dark:ring-teal-500/20"
        >
          <span class="text-2xl" aria-hidden="true">{{ lifeStagesSummary.recommended.icon }}</span>
          <span class="flex min-w-0 flex-col">
            <span class="text-[11px] font-bold text-teal-700 dark:text-teal-300">{{ lifeStagesSummary.recommendation === "continue" ? "ادامه بده" : "پیشنهاد خواندن" }}</span>
            <span class="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{{ lifeStagesSummary.recommended.title }}</span>
          </span>
        </RouterLink>
        <p v-else-if="lifeStagesSummary.totalItems > 0" class="text-sm text-emerald-700 dark:text-emerald-300">همه‌ی راهنماها را کامل کرده‌اید 🎉</p>
      </HomeSectionCard>

      <HomeSectionCard
        title="همیار · ارتباط زوجین"
        subtitle="مهارت‌های گفت‌وگو و صمیمیت"
        icon="💑"
        tone="sky"
        :to="{ name: 'hamyar', query: { tab: 'couple' } }"
        cta-label="ادامه‌ی راهنما"
        :progress="coupleGuideSummary.totalItems > 0 ? coupleGuideSummary.percent : null"
        :progress-label="coupleProgressLabel"
      >
        <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
          {{
            coupleGuideSummary.totalItems > 0 && coupleGuideSummary.remainingItems === 0
              ? "چک‌لیست این راهنما کامل شده است؛ هر وقت خواستید مرورش کنید."
              : "هر روز یک مورد از چک‌لیست را انجام بدهید؛ تغییرهای کوچک، رابطه را کم‌کم عوض می‌کنند."
          }}
        </p>
      </HomeSectionCard>
    </div>
  </div>
</template>
