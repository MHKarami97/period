import { getDate, getMonth } from "date-fns-jalali";
import { computed, shallowRef } from "vue";
import { useCycleStore } from "@application/stores/cycleStore";
import { useDailyChallengesStore } from "@application/stores/dailyChallengesStore";
import { useHamdelStore } from "@application/stores/hamdelStore";
import { useHamyarStore } from "@application/stores/hamyarStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { MedicationSchedule } from "@domain/health/MedicationSchedule";
import { ChallengeScorer } from "@domain/home/ChallengeScore";
import { HamyarTipPicker, type TipSource } from "@domain/home/HamyarTipPicker";
import { SeasonalChallengeProvider } from "@domain/home/SeasonalChallenges";
import type { TodayReminder } from "@domain/home/TodayReminders";
import { CycleStatisticsCalculator } from "@domain/insights/CycleStatistics";
import { SymptomPatternAnalyzer } from "@domain/insights/SymptomPatternAnalyzer";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { useMedicationReminders } from "@presentation/composables/useMedicationReminders";
import { HAMYAR_CATALOG } from "@presentation/hamyar/hamyarCatalog";

const COUPLE_GUIDE_ID = "couple_communication";
const SEASONAL_CATEGORY = "مناسبتی";
const MAX_MEDICATION_REMINDERS = 3;
const MAX_BOOKMARKS = 3;

/** Home-page extras: pattern insights, challenge score, seasonal idea, medication/promise reminders, Hamyar bookmarks and path. */
export function useHomeExtras() {
  const cycleStore = useCycleStore();
  const symptomStore = useSymptomStore();
  const hamdelStore = useHamdelStore();
  const hamyarStore = useHamyarStore();
  const challengeStore = useDailyChallengesStore();
  const { dueNow } = useMedicationReminders();

  const today = shallowRef(DateOnly.today());

  const analysis = computed(() => SymptomPatternAnalyzer.analyze(cycleStore.sortedCycles, symptomStore.symptoms, today.value));
  const insights = computed(() => analysis.value.insights.slice(0, 2));
  const statsAlert = computed(() => CycleStatisticsCalculator.calculate(cycleStore.sortedCycles, today.value).alerts.find((alert) => alert.severity === "warning") ?? null);

  const score = computed(() => {
    const days = Object.values(challengeStore.schedules).flatMap((schedule) => schedule.days);
    return ChallengeScorer.score(days, today.value.toIsoString());
  });

  const seasonal = computed(() => {
    const [year, month, day] = today.value.toIsoString().split("-").map(Number);
    const local = new Date(year, month - 1, day);
    return SeasonalChallengeProvider.forJalaliDate(getMonth(local) + 1, getDate(local));
  });
  const seasonalAdded = computed(() => challengeStore.customPool.some((item) => item.title === seasonal.value.title));

  function addSeasonalChallenge(): void {
    if (seasonalAdded.value) return;
    challengeStore.addCustomChallenge(seasonal.value.title, seasonal.value.description, SEASONAL_CATEGORY, ["any"]);
  }

  const extraReminders = computed<TodayReminder[]>(() => {
    const medicationReminders = dueNow.value.slice(0, MAX_MEDICATION_REMINDERS).map(
      (slot): TodayReminder => ({
        id: `med:${slot.key}`,
        icon: "💊",
        tone: "sky",
        text: `دارو: ${slot.name} (ساعت ${slot.time.replace(/\d/g, (digit) => Number(digit).toLocaleString("fa-IR"))}) هنوز تیک نخورده.`,
        to: { name: "companion", query: { tab: "health" } },
      }),
    );
    const todayIso = today.value.toIsoString();
    const promiseReminders = hamdelStore
      .entriesOf("promises")
      .filter((entry) => entry.valueOf("status") === "open" && entry.valueOf("dueAt") !== "" && entry.valueOf("dueAt") <= todayIso)
      .slice(0, 2)
      .map(
        (entry): TodayReminder => ({
          id: `promise:${entry.id}`,
          icon: "🤝",
          tone: "amber",
          text: `مهلت قول «${entry.valueOf("promise")}» رسیده است.`,
          to: { name: "hamdel-section", params: { section: "promises" } },
        }),
      );
    return [...medicationReminders, ...promiseReminders];
  });

  const lifeGuides = HAMYAR_CATALOG.filter((guide) => guide.id !== COUPLE_GUIDE_ID).map((guide) => ({ id: guide.id, title: guide.shortTitle, icon: guide.icon }));

  const pathTip = computed(() => {
    const ids = [...hamyarStore.myPathGuideIds];
    if (ids.length === 0) return null;
    const sources: TipSource[] = ids.flatMap((id) => {
      const data = hamyarStore.guidesData[id];
      const meta = HAMYAR_CATALOG.find((guide) => guide.id === id);
      return data && meta ? [{ id, title: meta.shortTitle, data }] : [];
    });
    return HamyarTipPicker.pick(sources, today.value, hamyarStore.isChecklistCompleted);
  });

  const bookmarks = computed(() =>
    [...hamyarStore.bookmarkKeys].slice(-MAX_BOOKMARKS).flatMap((key) => {
      const [guideId, stageId] = key.split(":");
      const stage = hamyarStore.guidesData[guideId]?.stages.find((item) => String(item.id) === stageId);
      const meta = HAMYAR_CATALOG.find((guide) => guide.id === guideId);
      return stage && meta ? [{ key, guideId, stageId, title: stage.title, guideTitle: meta.shortTitle }] : [];
    }),
  );

  return {
    insights,
    statsAlert,
    score,
    seasonal,
    seasonalAdded,
    addSeasonalChallenge,
    extraReminders,
    lifeGuides,
    pathTip,
    bookmarks,
    isInMyPath: hamyarStore.isInMyPath,
    togglePathGuide: hamyarStore.togglePathGuide,
  };
}
