<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useDisplayPreferencesStore } from "@application/stores/displayPreferencesStore";
import { useHomeDashboard } from "@presentation/composables/useHomeDashboard";
import { useHomeExtras } from "@presentation/composables/useHomeExtras";
import CareItemList from "@presentation/components/dashboard/CareItemList.vue";
import HomeHeroCard from "@presentation/components/home/HomeHeroCard.vue";
import HomeQuickLinks from "@presentation/components/home/HomeQuickLinks.vue";
import HomeSectionCard from "@presentation/components/home/HomeSectionCard.vue";
import HomeSuggestionList from "@presentation/components/home/HomeSuggestionList.vue";
import HomeTipCard from "@presentation/components/home/HomeTipCard.vue";
import HomeTodayReminders from "@presentation/components/home/HomeTodayReminders.vue";
import ProfileSwitcher from "@presentation/components/shared/ProfileSwitcher.vue";

const appModeStore = useAppModeStore();
const preferences = useDisplayPreferencesStore();
const {
  greeting,
  careTarget,
  cycleSummary,
  careHeading,
  careItems,
  heroTip,
  needsSymptomLog,
  cycleFacts,
  symptomLine,
  partnerSuggestions,
  upcomingOccasions,
  hamdelStats,
  visibleGames,
  playSuggestions,
  challenge,
  challengeWeek,
  weekDots,
  markChallengeDone,
  lifeStagesSummary,
  coupleGuideSummary,
  coupleTip,
  lifeStageTip,
  reminders,
} = useHomeDashboard();
const { insights, statsAlert, score, seasonal, seasonalAdded, addSeasonalChallenge, extraReminders, lifeGuides, pathTip, bookmarks, isInMyPath, togglePathGuide } = useHomeExtras();

const allReminders = computed(() => [...reminders.value, ...extraReminders.value]);
const visibleLifeTip = computed(() => pathTip.value ?? lifeStageTip.value);

const formatNumber = (value: number): string => value.toLocaleString("fa-IR");

const DOT_CLASSES: Readonly<Record<string, string>> = {
  completed: "bg-emerald-500 text-white",
  pending: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  skipped: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
  off: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",
};

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

    <HomeHeroCard :greeting="greeting" :care-target="careTarget" :summary="cycleSummary" :tip-heading="careHeading" :tip="heroTip" :needs-symptom-log="needsSymptomLog" />

    <HomeTodayReminders v-if="preferences.isWidgetVisible('reminders')" :reminders="allReminders" />
    <HomeQuickLinks v-if="preferences.isWidgetVisible('quickLinks')" :is-partner-mode="appModeStore.isPartnerMode" />

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <HomeSectionCard
        v-if="cycleFacts.length > 0 && preferences.isWidgetVisible('companion')"
        class="md:col-span-2"
        title="همراه"
        :subtitle="appModeStore.isPartnerMode ? 'پیش‌بینی‌ها و راهنمای امروز برای حمایت' : 'پیش‌بینی‌ها و راهنمای امروز برای خودت'"
        icon="🩸"
        tone="rose"
        :to="{ name: 'companion', query: { tab: 'stats' } }"
        cta-label="آمار و تحلیل کامل"
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <dl class="grid grid-cols-2 gap-2 self-start">
            <div v-for="fact in cycleFacts" :key="fact.label" class="flex flex-col gap-0.5 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60" :class="fact.label === 'بازه باروری' ? 'col-span-2' : ''">
              <dt class="text-[11px] font-bold text-slate-500 dark:text-slate-400"><span aria-hidden="true">{{ fact.icon }}</span> {{ fact.label }}</dt>
              <dd class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ fact.value }}</dd>
            </div>
            <p v-if="symptomLine" class="col-span-2 text-xs text-slate-500 dark:text-slate-400">{{ symptomLine }}</p>
          </dl>
          <div class="flex flex-col gap-2">
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ careHeading }}</p>
            <CareItemList :items="careItems.slice(0, 4)" />
          </div>
        </div>
        <ul v-if="insights.length > 0 || statsAlert" class="flex flex-col gap-1.5">
          <li v-for="insight in insights" :key="insight.id" class="flex items-start gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-900 ring-1 ring-violet-200/70 dark:bg-violet-500/10 dark:text-violet-100 dark:ring-violet-500/25">
            <span aria-hidden="true">{{ insight.icon }}</span>{{ insight.text }}
          </li>
          <li v-if="statsAlert" class="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/25">
            <span aria-hidden="true">⚠️</span>{{ statsAlert.text }}
          </li>
        </ul>
      </HomeSectionCard>

      <HomeSectionCard
        v-if="preferences.isWidgetVisible('challenge')"
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
        <div v-if="score.completedTotal > 0" class="flex flex-wrap gap-2 text-xs">
          <span class="rounded-full bg-orange-100 px-2.5 py-1 font-bold text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">🔥 {{ formatNumber(score.streak) }} روز پیاپی</span>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">⭐ {{ formatNumber(score.points) }} امتیاز</span>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">رکورد {{ formatNumber(score.bestStreak) }} روز</span>
        </div>
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
        <ol v-if="weekDots.length > 0" class="flex items-center justify-between gap-1" aria-label="وضعیت چالش‌های هفته">
          <li v-for="dot in weekDots" :key="dot.date" class="flex flex-1 flex-col items-center gap-1">
            <span class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold" :class="[DOT_CLASSES[dot.status] ?? DOT_CLASSES.pending, dot.isToday ? 'ring-2 ring-amber-500' : '']">
              {{ dot.status === "completed" ? "✓" : dot.status === "off" ? "☾" : dot.status === "skipped" ? "×" : "·" }}
            </span>
            <span class="text-[10px] text-slate-500 dark:text-slate-400">{{ dot.label }}</span>
          </li>
        </ol>
        <div class="flex flex-col gap-1.5 rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-200/70 dark:bg-violet-500/10 dark:ring-violet-500/25">
          <p class="text-[11px] font-bold text-violet-700 dark:text-violet-300">✨ چالش مناسبتی: {{ seasonal.occasion }}</p>
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ seasonal.title }}</p>
          <p class="text-xs leading-5 text-slate-600 dark:text-slate-300">{{ seasonal.description }}</p>
          <button type="button" class="self-start rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700 active:scale-95 disabled:opacity-60" :disabled="seasonalAdded" @click="addSeasonalChallenge">
            {{ seasonalAdded ? "به فهرست چالش‌ها اضافه شد ✓" : "افزودن به فهرست چالش‌ها" }}
          </button>
        </div>
      </HomeSectionCard>

      <HomeSectionCard v-if="preferences.isWidgetVisible('hamdel')" title="همدل" subtitle="دفترچه‌ی شناخت او" icon="💞" tone="rose" :to="{ name: 'hamdel' }" cta-label="رفتن به همدل">
        <div class="flex flex-wrap gap-2 text-xs">
          <span class="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ formatNumber(hamdelStats.totalEntries) }} یادداشت</span>
          <span v-if="hamdelStats.openPromises > 0" class="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">{{ formatNumber(hamdelStats.openPromises) }} قول باز</span>
          <span v-if="hamdelStats.openHints > 0" class="rounded-full bg-sky-100 px-2.5 py-1 font-medium text-sky-800 dark:bg-sky-500/20 dark:text-sky-300">{{ formatNumber(hamdelStats.openHints) }} اشاره‌ی تهیه‌نشده</span>
          <span v-if="hamdelStats.giftIdeas > 0" class="rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-800 dark:bg-rose-500/20 dark:text-rose-300">{{ formatNumber(hamdelStats.giftIdeas) }} ایده‌ی هدیه</span>
        </div>

        <ul v-if="upcomingOccasions.length > 0" class="flex flex-col gap-1.5">
          <li v-for="occasion in upcomingOccasions" :key="occasion.id" class="flex items-center justify-between gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs ring-1 ring-rose-200/70 dark:bg-rose-500/10 dark:ring-rose-500/25">
            <span class="truncate font-bold text-rose-900 dark:text-rose-100">📅 {{ occasion.title }}</span>
            <span class="shrink-0 text-rose-700 dark:text-rose-300">{{ occasion.label }}</span>
          </li>
        </ul>

        <p class="text-xs font-bold text-slate-500 dark:text-slate-400">امروز با این کار خوشحالش کن</p>
        <HomeSuggestionList :suggestions="partnerSuggestions" />
        <div class="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          <RouterLink :to="{ name: 'hamdel-weekly-plan' }" class="rounded-full bg-rose-50 px-2.5 py-1 text-rose-800 ring-1 ring-rose-200/70 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/25">🗓 برنامه‌ی هفتگی</RouterLink>
          <RouterLink :to="{ name: 'hamdel-gift-finder' }" class="rounded-full bg-rose-50 px-2.5 py-1 text-rose-800 ring-1 ring-rose-200/70 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/25">🎁 ایده‌ی هدیه</RouterLink>
        </div>
      </HomeSectionCard>

      <HomeSectionCard v-if="preferences.isWidgetVisible('play')" title="همراز" subtitle="بازی و گفت‌وگوی دونفره" icon="🎲" tone="violet" :to="{ name: 'games' }" cta-label="رفتن به همراز">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400">پیشنهاد امروز برای شما دو نفر</p>
        <HomeSuggestionList :suggestions="playSuggestions" />
        <div v-if="visibleGames.length > 0" class="flex flex-wrap gap-1.5">
          <RouterLink
            v-for="game in visibleGames"
            :key="game.id"
            :to="{ name: game.routeName }"
            class="inline-flex max-w-full items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-800 ring-1 ring-violet-200/70 transition hover:bg-violet-100 active:scale-95 dark:bg-violet-500/10 dark:text-violet-200 dark:ring-violet-500/25"
          >
            <span aria-hidden="true">{{ game.icon }}</span>
            <span class="max-w-[160px] truncate">{{ game.title }}</span>
          </RouterLink>
        </div>
      </HomeSectionCard>

      <HomeSectionCard
        v-if="preferences.isWidgetVisible('hamyarLife')"
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

        <HomeTipCard :tip="visibleLifeTip" />

        <ul v-if="bookmarks.length > 0" class="flex flex-col gap-1">
          <li v-for="bookmark in bookmarks" :key="bookmark.key">
            <RouterLink :to="{ name: 'hamyar-guide', params: { guideId: bookmark.guideId }, query: { stage: bookmark.stageId } }" class="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/25">
              <span aria-hidden="true">🔖</span>
              <span class="min-w-0 flex-1 truncate font-bold">{{ bookmark.title }}</span>
              <span class="shrink-0 opacity-70">{{ bookmark.guideTitle }}</span>
            </RouterLink>
          </li>
        </ul>

        <details class="rounded-2xl bg-slate-50 p-3 text-xs ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:ring-slate-700/60">
          <summary class="cursor-pointer font-bold text-slate-700 dark:text-slate-200">🧭 مسیر من (راهنماهایی که دنبال می‌کنم)</summary>
          <div class="mt-2 flex flex-col gap-1.5">
            <label v-for="guide in lifeGuides" :key="guide.id" class="flex cursor-pointer items-center gap-2 text-slate-700 dark:text-slate-200">
              <input type="checkbox" class="h-4 w-4 accent-teal-500" :checked="isInMyPath(guide.id)" @change="togglePathGuide(guide.id)" />
              <span aria-hidden="true">{{ guide.icon }}</span>{{ guide.title }}
            </label>
            <p class="text-[11px] leading-5 text-slate-500 dark:text-slate-400">نکته‌ی روز فقط از راهنماهای انتخاب‌شده می‌آید؛ اگر چیزی انتخاب نکنید از همه‌ی راهنماها می‌آید.</p>
          </div>
        </details>
      </HomeSectionCard>

      <HomeSectionCard
        v-if="preferences.isWidgetVisible('hamyarCouple')"
        title="همیار · ارتباط زوجین"
        subtitle="مهارت‌های گفت‌وگو و صمیمیت"
        icon="💑"
        tone="sky"
        :to="{ name: 'hamyar', query: { tab: 'couple' } }"
        cta-label="ادامه‌ی راهنما"
        :progress="coupleGuideSummary.totalItems > 0 ? coupleGuideSummary.percent : null"
        :progress-label="coupleProgressLabel"
      >
        <HomeTipCard :tip="coupleTip" />
        <p v-if="!coupleTip" class="text-sm leading-6 text-slate-600 dark:text-slate-300">
          {{ coupleGuideSummary.totalItems === 0 ? "در حال بارگذاری راهنما..." : "چک‌لیست این راهنما کامل شده است؛ هر وقت خواستید مرورش کنید." }}
        </p>
      </HomeSectionCard>
    </div>
  </div>
</template>
