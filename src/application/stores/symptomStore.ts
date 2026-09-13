import { defineStore } from "pinia";
import { shallowRef, computed } from "vue";
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
 * Implemented as a Pinia setup store with `shallowRef<Symptom[]>` for the
 * same reason as cycleStore: `Symptom`/`DateOnly` carry private fields, and
 * Vue's deep `reactive()` (used by options-API stores) strips that private
 * brand at the type level, breaking assignability back to `Symptom[]`.
 * `shallowRef` + whole-array reassignment keeps both the domain model's
 * encapsulation and its exact TypeScript type intact.
 */
export const useSymptomStore = defineStore("symptom", () => {
  const symptoms = shallowRef<Symptom[]>([]);
  const isLoading = shallowRef(false);

  const byDateMap = computed<Map<string, Symptom>>(
    () => new Map(symptoms.value.map((symptom) => [symptom.date.toIsoString(), symptom])),
  );

  async function initialize(): Promise<void> {
    isLoading.value = true;
    try {
      symptoms.value = await symptomRepository.getAll();
    } finally {
      isLoading.value = false;
    }
  }

  function getForDate(date: DateOnly): Symptom | null {
    return byDateMap.value.get(date.toIsoString()) ?? null;
  }

  async function logSymptom(input: LogSymptomInput): Promise<void> {
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

    const next = [...symptoms.value];
    const index = next.findIndex((existing) => existing.id === id);
    if (index === -1) {
      next.push(symptom);
    } else {
      next.splice(index, 1, symptom);
    }
    symptoms.value = next;
  }

  async function deleteSymptom(id: string): Promise<void> {
    await symptomRepository.delete(id);
    symptoms.value = symptoms.value.filter((symptom) => symptom.id !== id);
  }

  async function clearAll(): Promise<void> {
    await symptomRepository.clear();
    symptoms.value = [];
  }

  return { symptoms, isLoading, byDateMap, initialize, getForDate, logSymptom, deleteSymptom, clearAll };
});
