import { defineStore } from "pinia";
import { Symptom } from "@domain/entities/Symptom";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { Mood } from "@domain/valueObjects/Mood";
import { FlowLevel } from "@domain/valueObjects/FlowLevel";
import { DexieSymptomRepository } from "@infrastructure/repositories/DexieSymptomRepository";

const symptomRepository = new DexieSymptomRepository();

export interface LogSymptomInput {
  date: DateOnly;
  mood?: Mood | null;
  painLevel?: number;
  flowLevel?: FlowLevel;
  note?: string | null;
}

/**
 * symptomStore - Application Service for the daily Symptom log.
 * One Symptom per calendar day: the id is deterministically derived from
 * the ISO date so `save` naturally upserts (create-or-update) without an
 * extra lookup round-trip.
 */
export const useSymptomStore = defineStore("symptom", {
  state: () => ({
    symptoms: [] as Symptom[],
    isLoading: false,
  }),
  getters: {
    byDateMap(state): Map<string, Symptom> {
      return new Map(state.symptoms.map((symptom) => [symptom.date.toIsoString(), symptom]));
    },
  },
  actions: {
    async initialize(): Promise<void> {
      this.isLoading = true;
      try {
        this.symptoms = await symptomRepository.getAll();
      } finally {
        this.isLoading = false;
      }
    },

    getForDate(date: DateOnly): Symptom | null {
      return this.byDateMap.get(date.toIsoString()) ?? null;
    },

    async logSymptom(input: LogSymptomInput): Promise<void> {
      const id = `symptom_${input.date.toIsoString()}`;
      const symptom = Symptom.create({
        id,
        date: input.date,
        mood: input.mood,
        painLevel: input.painLevel,
        flowLevel: input.flowLevel,
        note: input.note,
      });

      await symptomRepository.save(symptom);

      const index = this.symptoms.findIndex((existing) => existing.id === id);
      if (index === -1) {
        this.symptoms.push(symptom);
      } else {
        this.symptoms.splice(index, 1, symptom);
      }
    },

    async deleteSymptom(id: string): Promise<void> {
      await symptomRepository.delete(id);
      this.symptoms = this.symptoms.filter((symptom) => symptom.id !== id);
    },

    async clearAll(): Promise<void> {
      await symptomRepository.clear();
      this.symptoms = [];
    },
  },
});
