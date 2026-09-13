import { computed } from "vue";
import { useCycleStore } from "@application/stores/cycleStore";
import { CyclePhase, CYCLE_PHASE_LABELS_FA } from "@domain/valueObjects/CyclePhase";

/**
 * useCycleDashboard - Presentation-layer composable that reshapes the
 * cycleStore's state into view-ready primitives (labels, percentages),
 * keeping that formatting logic out of both the Pinia store and the
 * dumb/presentational Vue components.
 */
export function useCycleDashboard() {
  const cycleStore = useCycleStore();

  const currentPhase = computed<CyclePhase>(() => cycleStore.currentPhase);
  const currentPhaseLabel = computed(() => CYCLE_PHASE_LABELS_FA[currentPhase.value]);

  const currentCycleDay = computed(() => cycleStore.currentCycleDayNumber ?? 1);
  const predictedCycleLength = computed(() => cycleStore.prediction?.predictedCycleLengthInDays ?? 28);

  const progressRatio = computed(() =>
    Math.min(1, currentCycleDay.value / Math.max(predictedCycleLength.value, 1)),
  );

  const daysUntilNextPeriod = computed(() => cycleStore.daysUntilNextPeriod ?? null);

  const phaseAccentClass = computed<string>(() => {
    switch (currentPhase.value) {
      case CyclePhase.Menstrual:
        return "text-rose-400 stroke-rose-400";
      case CyclePhase.Follicular:
        return "text-teal-400 stroke-teal-400";
      case CyclePhase.Ovulation:
        return "text-violet-300 stroke-violet-300";
      case CyclePhase.Luteal:
      default:
        return "text-indigo-300 stroke-indigo-300";
    }
  });

  return {
    cycleStore,
    currentPhase,
    currentPhaseLabel,
    currentCycleDay,
    predictedCycleLength,
    progressRatio,
    daysUntilNextPeriod,
    phaseAccentClass,
  };
}
