import { defineStore } from "pinia";
import { shallowRef, computed } from "vue";
import { Cycle } from "@domain/entities/Cycle";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { CyclePredictionService } from "@domain/services/CyclePredictionService";
import { DexieCycleRepository } from "@infrastructure/repositories/DexieCycleRepository";

/**
 * cycleStore - Application Service orchestrating the Cycle aggregate with
 * the persistence port.
 *
 * Implemented as a Pinia SETUP store (not the options-API store) and backed
 * by `shallowRef` rather than a plain `reactive()` array. This is a
 * deliberate choice, not a style preference:
 *
 *  - `Cycle`/`DateOnly` are immutable domain objects with a private
 *    backing field (`props` / `timestampUtcMidnight`). Vue's `reactive()`
 *    (used internally by Pinia's options-API `state()`) deep-proxies every
 *    nested object and its type-level `UnwrapRef<T>` mapped type does not
 *    preserve TypeScript's private-field brand, which made `Cycle[]`
 *    un-assignable to itself after a round trip through the store
 *    (TS2322 "Property 'props' is missing in type ... but required in
 *    type 'Cycle'"). `shallowRef` never recurses into the object graph, so
 *    the class identity — and its encapsulation — survives untouched.
 *  - Every mutation on `Cycle` already returns a brand-new instance
 *    (see Cycle.endPeriod/correctStartDate/correctEndDate), so the store
 *    never needs to mutate an existing array in place; it always assigns a
 *    new array to `cycles.value`, which is exactly what `shallowRef` is
 *    designed for and is also the cheapest reactivity shape performance-wise.
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
    isLoading.value = true;
    try {
      cycles.value = await cycleRepository.getAll();
    } finally {
      isLoading.value = false;
    }
  }

  async function mutateCycle(cycleId: string, mutate: (cycle: Cycle) => Cycle): Promise<void> {
    const index = cycles.value.findIndex((cycle) => cycle.id === cycleId);
    if (index === -1) {
      throw new Error(`Cycle ${cycleId} not found.`);
    }
    const updated = mutate(cycles.value[index]);
    await cycleRepository.save(updated);

    const next = [...cycles.value];
    next.splice(index, 1, updated);
    cycles.value = next;
  }

  async function startPeriod(startDate: DateOnly = DateOnly.today()): Promise<void> {
    const cycle = Cycle.start({ id: generateId(), startDate });
    await cycleRepository.save(cycle);
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

  async function clearAll(): Promise<void> {
    await cycleRepository.clear();
    cycles.value = [];
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
    clearAll,
  };
});
