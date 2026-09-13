import { defineStore } from "pinia";
import { shallowRef, computed } from "vue";
import { Cycle } from "@domain/entities/Cycle";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { CyclePredictionService } from "@domain/services/CyclePredictionService";
import { DexieCycleRepository } from "@infrastructure/repositories/DexieCycleRepository";
import { useProfileStore } from "./profileStore";

/**
 * cycleStore - Application Service orchestrating the Cycle aggregate with
 * the persistence port, scoped to whichever Profile is currently active
 * (see profileStore). Every read/write forwards `profileStore.activeProfileId`
 * to the repository, so switching the active profile and calling
 * `initialize()` again transparently swaps in a different person's data.
 *
 * Implemented as a Pinia SETUP store backed by `shallowRef` rather than a
 * plain `reactive()` array: `Cycle`/`DateOnly` are immutable domain objects
 * with a private backing field, and Vue's `reactive()` type-level
 * `UnwrapRef<T>` does not preserve TypeScript's private-field brand, which
 * breaks assignability back to `Cycle[]`. `shallowRef` never recurses into
 * the object graph, so the class identity — and its encapsulation — is
 * preserved, and every mutation already returns a brand-new instance
 * anyway (see Cycle.endPeriod/correctStartDate/correctEndDate).
 */
const cycleRepository = new DexieCycleRepository();

function generateId(): string {
  return crypto.randomUUID();
}

export const useCycleStore = defineStore("cycle", () => {
  const cycles = shallowRef<Cycle[]>([]);
  const isLoading = shallowRef(false);

  const sortedCycles = computed<Cycle[]>(() =>
    [...cycles.value].sort((a, b) => a.startDate.diffInDays(b.startDate)),
  );

  const currentCycle = computed<Cycle | null>(() => {
    const sorted = sortedCycles.value;
    return sorted.length > 0 ? sorted[sorted.length - 1] : null;
  });

  const hasHistory = computed<boolean>(() => cycles.value.length > 0);

  const prediction = computed(() =>
    hasHistory.value ? CyclePredictionService.predictNextCycle(sortedCycles.value) : null,
  );

  const currentPhase = computed(() => CyclePredictionService.resolveCurrentPhase(sortedCycles.value));

  const currentCycleDayNumber = computed<number | null>(() =>
    hasHistory.value ? CyclePredictionService.currentCycleDayNumber(sortedCycles.value) : null,
  );

  const daysUntilNextPeriod = computed<number | null>(() =>
    hasHistory.value ? CyclePredictionService.daysUntilNextPeriod(sortedCycles.value) : null,
  );

    async function initialize(): Promise<void> {
    const profileStore = useProfileStore();
    if (!profileStore.activeProfileId) {
      cycles.value = [];
      return;
    }

    isLoading.value = true;
    try {
      cycles.value = await cycleRepository.getAllForProfile(profileStore.activeProfileId);
    } finally {
      isLoading.value = false;
    }
  }

  async function mutateCycle(cycleId: string, mutate: (cycle: Cycle) => Cycle): Promise<void> {
    const profileStore = useProfileStore();
    if (!profileStore.activeProfileId) {
      throw new Error("No active profile selected.");
    }

    const index = cycles.value.findIndex((cycle) => cycle.id === cycleId);
    if (index === -1) {
      throw new Error(`Cycle ${cycleId} not found.`);
    }
    const updated = mutate(cycles.value[index]);
    await cycleRepository.save(updated, profileStore.activeProfileId);

    const next = [...cycles.value];
    next.splice(index, 1, updated);
    cycles.value = next;
  }

  async function startPeriod(startDate: DateOnly = DateOnly.today()): Promise<void> {
    const profileStore = useProfileStore();
    if (!profileStore.activeProfileId) {
      throw new Error("No active profile selected.");
    }

    const cycle = Cycle.start({ id: generateId(), startDate });
    await cycleRepository.save(cycle, profileStore.activeProfileId);
    cycles.value = [...cycles.value, cycle];
  }

  async function endPeriod(cycleId: string, endDate: DateOnly = DateOnly.today()): Promise<void> {
    await mutateCycle(cycleId, (cycle) => cycle.endPeriod(endDate));
  }

  async function correctStartDate(cycleId: string, newStartDate: DateOnly): Promise<void> {
    await mutateCycle(cycleId, (cycle) => cycle.correctStartDate(newStartDate));
  }

  async function correctEndDate(cycleId: string, newEndDate: DateOnly): Promise<void> {
    await mutateCycle(cycleId, (cycle) => cycle.correctEndDate(newEndDate));
  }

  async function deleteCycle(cycleId: string): Promise<void> {
    await cycleRepository.delete(cycleId);
    cycles.value = cycles.value.filter((cycle) => cycle.id !== cycleId);
  }

  return {
    cycles,
    isLoading,
    sortedCycles,
    currentCycle,
    hasHistory,
    prediction,
    currentPhase,
    currentCycleDayNumber,
    daysUntilNextPeriod,
    initialize,
    startPeriod,
    endPeriod,
    correctStartDate,
    correctEndDate,
    deleteCycle,
  };
});
