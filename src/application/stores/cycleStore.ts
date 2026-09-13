import { defineStore } from "pinia";
import { Cycle } from "@domain/entities/Cycle";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { CyclePredictionService, type CyclePrediction } from "@domain/services/CyclePredictionService";
import { CyclePhase } from "@domain/valueObjects/CyclePhase";
import { DexieCycleRepository } from "@infrastructure/repositories/DexieCycleRepository";

/**
 * cycleStore - Application Service orchestrating the Cycle aggregate with
 * the persistence port. Pinia here plays the role Application Services
 * play in DDD: it never contains business rules itself, it only
 * sequences calls into the domain (Cycle, CyclePredictionService) and the
 * repository (DexieCycleRepository, injected as a concrete adapter since
 * this is a small local-first SPA with a single implementation — a DI
 * container would be introduced only if a second adapter appeared).
 */
const cycleRepository = new DexieCycleRepository();

function generateId(): string {
  return crypto.randomUUID();
}

export const useCycleStore = defineStore("cycle", {
  state: () => ({
    cycles: [] as Cycle[],
    isLoading: false,
  }),
  getters: {
    sortedCycles(state): Cycle[] {
      return [...state.cycles].sort((a, b) => a.startDate.diffInDays(b.startDate));
    },
    currentCycle(): Cycle | null {
      const sorted = this.sortedCycles;
      return sorted.length > 0 ? sorted[sorted.length - 1] : null;
    },
    hasHistory(state): boolean {
      return state.cycles.length > 0;
    },
    prediction(): CyclePrediction | null {
      return this.hasHistory ? CyclePredictionService.predictNextCycle(this.sortedCycles) : null;
    },
    currentPhase(): CyclePhase {
      return CyclePredictionService.resolveCurrentPhase(this.sortedCycles);
    },
    currentCycleDayNumber(): number | null {
      return this.hasHistory ? CyclePredictionService.currentCycleDayNumber(this.sortedCycles) : null;
    },
    daysUntilNextPeriod(): number | null {
      return this.hasHistory ? CyclePredictionService.daysUntilNextPeriod(this.sortedCycles) : null;
    },
  },
  actions: {
    async initialize(): Promise<void> {
      this.isLoading = true;
      try {
        this.cycles = await cycleRepository.getAll();
      } finally {
        this.isLoading = false;
      }
    },

    async startPeriod(startDate: DateOnly = DateOnly.today()): Promise<void> {
      const cycle = Cycle.start({ id: generateId(), startDate });
      await cycleRepository.save(cycle);
      this.cycles.push(cycle);
    },

    async endPeriod(cycleId: string, endDate: DateOnly = DateOnly.today()): Promise<void> {
      await this.mutateCycle(cycleId, (cycle) => cycle.endPeriod(endDate));
    },

    async correctStartDate(cycleId: string, newStartDate: DateOnly): Promise<void> {
      await this.mutateCycle(cycleId, (cycle) => cycle.correctStartDate(newStartDate));
    },

    async correctEndDate(cycleId: string, newEndDate: DateOnly): Promise<void> {
      await this.mutateCycle(cycleId, (cycle) => cycle.correctEndDate(newEndDate));
    },

    async deleteCycle(cycleId: string): Promise<void> {
      await cycleRepository.delete(cycleId);
      this.cycles = this.cycles.filter((cycle) => cycle.id !== cycleId);
    },

    async clearAll(): Promise<void> {
      await cycleRepository.clear();
      this.cycles = [];
    },

    async mutateCycle(cycleId: string, mutate: (cycle: Cycle) => Cycle): Promise<void> {
      const index = this.cycles.findIndex((cycle) => cycle.id === cycleId);
      if (index === -1) {
        throw new Error(`Cycle ${cycleId} not found.`);
      }
      const updated = mutate(this.cycles[index]);
      await cycleRepository.save(updated);
      this.cycles.splice(index, 1, updated);
    },
  },
});
