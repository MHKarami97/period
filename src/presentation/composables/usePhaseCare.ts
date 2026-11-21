import { computed, shallowRef, type Ref } from "vue";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { PhaseCareAdvisor } from "@domain/home/PhaseCareAdvisor";
import { DateOnly } from "@domain/valueObjects/DateOnly";

/** Builds the "what to do today" list of the active person from the cycle phase and today's logged symptoms. */
export function usePhaseCare(today: Ref<DateOnly> = shallowRef(DateOnly.today())) {
  const cycleStore = useCycleStore();
  const appModeStore = useAppModeStore();
  const symptomStore = useSymptomStore();

  const items = computed(() => {
    if (!cycleStore.hasHistory) return [];
    const symptom = symptomStore.getForDate(today.value);
    return PhaseCareAdvisor.advise({
      phase: cycleStore.currentPhase,
      audience: appModeStore.isPartnerMode ? "partner" : "self",
      today: today.value,
      daysUntilPeriod: cycleStore.daysUntilNextPeriod ?? null,
      painLevel: symptom?.painLevel ?? null,
      mood: symptom?.mood ?? null,
      flow: symptom?.flowLevel ?? null,
    });
  });

  const heading = computed(() => (appModeStore.isPartnerMode ? "امروز چطور کمک کنم؟" : "امروز چه کاری بکنم؟"));

  return { items, heading };
}
