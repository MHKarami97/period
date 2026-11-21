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
import { DailyRotation } from "@domain/home/DailyRotation";
import { HamyarProgressSummarizer, type GuideProgress } from "@domain/home/HamyarProgressSummary";
import { PartnerDailySuggestionBuilder } from "@domain/home/PartnerDailySuggestions";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { jalaliYearlyCalendar } from "@infrastructure/calendar/JalaliYearlyCalendar";
import { usePhaseGuidance } from "@presentation/composables/usePhaseGuidance";
import { GAME_CATALOG } from "@presentation/games/gameCatalog";
import { HAMYAR_CATALOG } from "@presentation/hamyar/hamyarCatalog";

const COUPLE_GUIDE_ID = "couple_communication";
/** Not on the front page: daily challenge has its own card; positions stays inside the games area. */
const HOME_HIDDEN_GAME_IDS: ReadonlySet<string> = new Set(["daily-challenges", "positions"]);

export type ChallengeCardState =
  | { readonly kind: "no-plan" }
  | { readonly kind: "no-today" }
  | { readonly kind: "off"; readonly reason: string }
  | { readonly kind: "pending" | "completed" | "skipped"; readonly title: string; readonly description: string | null };

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
  const { guidance } = usePhaseGuidance();

  const today = shallowRef(DateOnly.today());
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

  const greeting = computed(() => {
    const name = isPartnerMode.value ? profileStore.activeProfile?.name : userProfileStore.displayName;
    const base = greetingForHour(new Date().getHours());
    return name ? `${base}، ${name}` : base;
  });

  const cycleSummary = computed(() => (hasUsableScope.value ? CycleStatusSummarizer.summarize(cycleStore.sortedCycles, today.value) : null));

  const tipHeading = computed(() => (isPartnerMode.value ? "امروز چطور کمک کنم؟" : "امروز چه کاری بکنم؟"));
  const tip = computed(() => {
    if (!hasUsableScope.value || !cycleStore.hasHistory) return null;
    const tips = isPartnerMode.value ? guidance.value.partnerTips : guidance.value.selfTips;
    return DailyRotation.forDay(today.value, "tip").pick(tips);
  });

  const needsSymptomLog = computed(() => !isPartnerMode.value && hasUsableScope.value && symptomStore.getForDate(today.value) === null);

  const partnerSuggestions = computed(() => PartnerDailySuggestionBuilder.build(hamdelStore.entries, today.value, jalaliYearlyCalendar));

  const hamdelStats = computed(() => {
    const countdown = buildCountdowns(hamdelStore.entriesOf("dates"), today.value, jalaliYearlyCalendar).find((item) => item.daysLeft !== null);
    return {
      totalEntries: hamdelStore.entries.length,
      openPromises: hamdelStore.entriesOf("promises").filter((entry) => entry.valueOf("status") === "open").length,
      nextOccasion: countdown && countdown.daysLeft !== null ? { title: countdown.entry.valueOf("title"), label: describeDaysLeft(countdown.daysLeft) } : null,
    };
  });

  const playSuggestions = computed(() => {
    const games: PlayableGame[] = GAME_CATALOG.filter(
      (game) => !HOME_HIDDEN_GAME_IDS.has(game.id) && GameVisibilityPolicy.isVisible(game.id, accessStore.isUnlocked),
    ).map((game) => ({ id: game.id, title: game.title, icon: game.icon, routeName: game.routeName }));

    return CouplePlaySuggestionBuilder.build({
      games,
      cards: DEFAULT_CONVERSATION_CARDS.filter(isHomeSafeCard),
      entries: hamdelStore.entries,
      today: today.value,
    });
  });

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

  function markChallengeDone(): void {
    challengeStore.setDayResult(challengeStore.currentWeekIso, today.value.toIsoString(), "completed");
  }

  function progressOf(id: string): GuideProgress | null {
    const meta = HAMYAR_CATALOG.find((guide) => guide.id === id);
    if (!meta) return null;
    const { completed, total } = hamyarStore.getGuideCompletion(id);
    return { id, title: meta.shortTitle, icon: meta.icon, completed, total };
  }

  const lifeStagesSummary = computed(() =>
    HamyarProgressSummarizer.summarize(
      HAMYAR_CATALOG.filter((guide) => guide.id !== COUPLE_GUIDE_ID)
        .map((guide) => progressOf(guide.id))
        .filter((item): item is GuideProgress => item !== null),
    ),
  );

  const coupleGuideSummary = computed(() => {
    const progress = progressOf(COUPLE_GUIDE_ID);
    return HamyarProgressSummarizer.summarize(progress ? [progress] : []);
  });

  return {
    isPartnerMode,
    hasUsableScope,
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
  };
}
