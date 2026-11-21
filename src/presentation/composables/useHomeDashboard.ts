import { computed, onBeforeUnmount, onMounted, shallowRef } from "vue";
import { useAccessStore } from "@application/stores/accessStore";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useCycleStore } from "@application/stores/cycleStore";
import { useDailyChallengesStore } from "@application/stores/dailyChallengesStore";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useHamyarStore } from "@application/stores/hamyarStore";
import { useProfileStore } from "@application/stores/profileStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { useUserProfileStore } from "@application/stores/userProfileStore";
import { DEFAULT_CONVERSATION_CARDS } from "@domain/games/conversation/defaultConversationCards";
import { GameVisibilityPolicy } from "@domain/games/GameVisibilityPolicy";
import { buildCountdowns, describeDaysLeft } from "@domain/hamdel/importantDates";
import { CouplePlaySuggestionBuilder, isHomeSafeCard, type PlayableGame } from "@domain/home/CouplePlaySuggestions";
import { CycleStatusSummarizer } from "@domain/home/CycleStatusSummary";
import { HamyarProgressSummarizer, type GuideProgress } from "@domain/home/HamyarProgressSummary";
import { HamyarTipPicker, type TipSource } from "@domain/home/HamyarTipPicker";
import { PartnerDailySuggestionBuilder } from "@domain/home/PartnerDailySuggestions";
import { TodayReminderBuilder } from "@domain/home/TodayReminders";
import { CyclePredictionService } from "@domain/services/CyclePredictionService";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { jalaliYearlyCalendar } from "@infrastructure/calendar/JalaliYearlyCalendar";
import { useJalali } from "@presentation/composables/useJalali";
import { usePhaseCare } from "@presentation/composables/usePhaseCare";
import { GAME_CATALOG } from "@presentation/games/gameCatalog";
import { HAMYAR_CATALOG } from "@presentation/hamyar/hamyarCatalog";

const COUPLE_GUIDE_ID = "couple_communication";
const CONVERSATION_GAME_ID = "conversation-cards";
const CHALLENGES_GAME_ID = "daily-challenges";
/** Not on the front page: daily challenge has its own card; positions stays inside the games area. */
const HOME_HIDDEN_GAME_IDS: ReadonlySet<string> = new Set([CHALLENGES_GAME_ID, "positions"]);
const OCCASION_REMINDER_DAYS = 3;

export type ChallengeCardState =
  | { readonly kind: "no-plan" }
  | { readonly kind: "no-today" }
  | { readonly kind: "off"; readonly reason: string }
  | { readonly kind: "pending" | "completed" | "skipped"; readonly title: string; readonly description: string | null };

export interface CycleFact {
  readonly icon: string;
  readonly label: string;
  readonly value: string;
}

export interface WeekDot {
  readonly date: string;
  readonly label: string;
  readonly status: string;
  readonly isToday: boolean;
}

function greetingForHour(hour: number): string {
  if (hour < 5) return "شب بخیر";
  if (hour < 12) return "صبح بخیر";
  if (hour < 17) return "ظهر بخیر";
  if (hour < 20) return "عصر بخیر";
  return "شب بخیر";
}

/** Reads the existing stores and reshapes them into view-ready summaries. Decision logic lives in domain/home. */
export function useHomeDashboard() {
  const cycleStore = useCycleStore();
  const appModeStore = useAppModeStore();
  const profileStore = useProfileStore();
  const userProfileStore = useUserProfileStore();
  const symptomStore = useSymptomStore();
  const hamdelStore = useHamdelStore();
  const hamyarStore = useHamyarStore();
  const challengeStore = useDailyChallengesStore();
  const accessStore = useAccessStore();
  const { toJalaliLabel } = useJalali();

  const today = shallowRef(DateOnly.today());
  const { items: careItems, heading: careHeading } = usePhaseCare(today);

  const refreshToday = (): void => {
    if (document.visibilityState === "visible") {
      today.value = DateOnly.today();
    }
  };

  onMounted(() => {
    document.addEventListener("visibilitychange", refreshToday);
    void hamdelStore.ensureLoaded();
    void hamyarStore.loadAllGuides();
  });
  onBeforeUnmount(() => document.removeEventListener("visibilitychange", refreshToday));

  const isPartnerMode = computed(() => appModeStore.isPartnerMode);
  const hasUsableScope = computed(() => !appModeStore.isPartnerMode || profileStore.activeProfileId !== null);

  /** Only the time of day; in partner mode the tracked person is shown separately so we never call the user by her name. */
  const greeting = computed(() => {
    const base = greetingForHour(new Date().getHours());
    const name = userProfileStore.displayName;
    return !isPartnerMode.value && name ? `${base}، ${name}` : base;
  });
  const careTarget = computed(() => (isPartnerMode.value ? (profileStore.activeProfile?.name ?? null) : null));

  const cycleSummary = computed(() => (hasUsableScope.value ? CycleStatusSummarizer.summarize(cycleStore.sortedCycles, today.value) : null));
  const heroTip = computed(() => careItems.value[0] ?? null);

  const todaySymptom = computed(() => (hasUsableScope.value ? symptomStore.getForDate(today.value) : null));
  const needsSymptomLog = computed(() => !isPartnerMode.value && hasUsableScope.value && todaySymptom.value === null);

  const cycleFacts = computed<CycleFact[]>(() => {
    if (!hasUsableScope.value || !cycleStore.hasHistory) return [];
    const prediction = CyclePredictionService.predictNextCycle(cycleStore.sortedCycles);
    const fa = (value: number): string => value.toLocaleString("fa-IR");
    const label = (day: DateOnly): string => toJalaliLabel(day, "d MMMM");
    return [
      { icon: "🩸", label: "پریود بعدی", value: label(prediction.nextPeriodStartDate) },
      { icon: "🥚", label: "تخمک‌گذاری برآوردی", value: label(prediction.ovulationDate) },
      { icon: "🌸", label: "بازه باروری", value: `${label(prediction.fertileWindowStart)} تا ${label(prediction.fertileWindowEnd)}` },
      { icon: "🔁", label: "میانگین چرخه", value: `${fa(prediction.predictedCycleLengthInDays)} روز` },
      { icon: "⏱", label: "مدت پریود", value: `${fa(prediction.predictedPeriodLengthInDays)} روز` },
    ];
  });

  const symptomLine = computed(() => {
    const symptom = todaySymptom.value;
    if (!symptom) return null;
    return `امروز ثبت شده: شدت درد ${symptom.painLevel.toLocaleString("fa-IR")} از ۴`;
  });

  const partnerSuggestions = computed(() =>
    PartnerDailySuggestionBuilder.build(hamdelStore.entries, today.value, jalaliYearlyCalendar, cycleStore.hasHistory ? cycleStore.currentPhase : null),
  );

  const upcomingOccasions = computed(() =>
    buildCountdowns(hamdelStore.entriesOf("dates"), today.value, jalaliYearlyCalendar)
      .filter((item) => item.daysLeft !== null)
      .slice(0, 3)
      .map((item) => ({ id: item.entry.id, title: item.entry.valueOf("title"), label: describeDaysLeft(item.daysLeft ?? 0), daysLeft: item.daysLeft ?? 0 })),
  );

  const hamdelStats = computed(() => ({
    totalEntries: hamdelStore.entries.length,
    openPromises: hamdelStore.entriesOf("promises").filter((entry) => entry.valueOf("status") === "open").length,
    openHints: hamdelStore.entriesOf("hints").filter((entry) => entry.valueOf("status") === "noted").length,
    giftIdeas: hamdelStore.entriesOf("gifts").filter((entry) => entry.valueOf("status") === "idea").length,
  }));

  const visibleGames = computed<PlayableGame[]>(() =>
    GAME_CATALOG.filter((game) => !HOME_HIDDEN_GAME_IDS.has(game.id) && GameVisibilityPolicy.isVisible(game.id, accessStore.isUnlocked)).map((game) => ({
      id: game.id,
      title: game.title,
      icon: game.icon,
      routeName: game.routeName,
    })),
  );

  const playSuggestions = computed(() =>
    CouplePlaySuggestionBuilder.build({
      games: visibleGames.value,
      cards: DEFAULT_CONVERSATION_CARDS.filter(isHomeSafeCard),
      entries: hamdelStore.entries,
      today: today.value,
      questionRouteName: GAME_CATALOG.find((game) => game.id === CONVERSATION_GAME_ID)?.routeName ?? null,
    }),
  );

  const challenge = computed<ChallengeCardState>(() => {
    if (!challengeStore.currentWeekPlan) return { kind: "no-plan" };
    const plan = challengeStore.todayPlan;
    if (!plan) return { kind: "no-today" };
    if (plan.isOff || plan.status === "off") return { kind: "off", reason: plan.offReason ?? "روز آف و استراحت دونفره" };
    return { kind: plan.status, title: plan.challengeTitle, description: plan.challengeDescription ?? null };
  });

  const challengeWeek = computed(() => {
    const days = (challengeStore.currentWeekPlan?.days ?? []).filter((day) => !day.isOff && day.status !== "off");
    return { total: days.length, completed: days.filter((day) => day.status === "completed").length };
  });

  const weekDots = computed<WeekDot[]>(() =>
    (challengeStore.currentWeekPlan?.days ?? []).map((day) => ({
      date: day.date,
      label: day.dayName.slice(0, 1),
      status: day.isOff ? "off" : day.status,
      isToday: day.date === today.value.toIsoString(),
    })),
  );

  function markChallengeDone(): void {
    challengeStore.setDayResult(challengeStore.currentWeekIso, today.value.toIsoString(), "completed");
  }

  function progressOf(id: string): GuideProgress | null {
    const meta = HAMYAR_CATALOG.find((guide) => guide.id === id);
    if (!meta) return null;
    const { completed, total } = hamyarStore.getGuideCompletion(id);
    return { id, title: meta.shortTitle, icon: meta.icon, completed, total };
  }

  const lifeStageIds = HAMYAR_CATALOG.filter((guide) => guide.id !== COUPLE_GUIDE_ID).map((guide) => guide.id);

  const lifeStagesSummary = computed(() =>
    HamyarProgressSummarizer.summarize(lifeStageIds.map((id) => progressOf(id)).filter((item): item is GuideProgress => item !== null)),
  );
  const coupleGuideSummary = computed(() => {
    const progress = progressOf(COUPLE_GUIDE_ID);
    return HamyarProgressSummarizer.summarize(progress ? [progress] : []);
  });

  function tipSources(ids: readonly string[]): TipSource[] {
    return ids.flatMap((id) => {
      const data = hamyarStore.guidesData[id];
      const meta = HAMYAR_CATALOG.find((guide) => guide.id === id);
      return data && meta ? [{ id, title: meta.shortTitle, data }] : [];
    });
  }

  const coupleTip = computed(() => HamyarTipPicker.pick(tipSources([COUPLE_GUIDE_ID]), today.value, hamyarStore.isChecklistCompleted));
  const lifeStageTip = computed(() => HamyarTipPicker.pick(tipSources(lifeStageIds), today.value, hamyarStore.isChecklistCompleted));

  const reminders = computed(() =>
    TodayReminderBuilder.build({
      periodDueOrLate: cycleSummary.value?.kind === "period-due" || cycleSummary.value?.kind === "period-late",
      isPartnerMode: isPartnerMode.value,
      symptomMissing: needsSymptomLog.value,
      challengePending: challenge.value.kind === "pending",
      callsToday: hamdelStore
        .entriesOf("calls")
        .filter((entry) => entry.valueOf("status") === "pending" && entry.valueOf("date") === today.value.toIsoString())
        .map((entry) => entry.valueOf("title")),
      occasionsSoon: upcomingOccasions.value.filter((item) => item.daysLeft <= OCCASION_REMINDER_DAYS).map((item) => ({ title: item.title, label: item.label })),
      openPromises: hamdelStats.value.openPromises,
    }),
  );

  return {
    isPartnerMode,
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
  };
}
