import { defineStore } from "pinia";
import { shallowRef, computed } from "vue";
import { Symptom } from "@domain/entities/Symptom";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { Mood } from "@domain/valueObjects/Mood";
import { FlowLevel } from "@domain/valueObjects/FlowLevel";
import { DexieSymptomRepository } from "@infrastructure/repositories/DexieSymptomRepository";
import { useProfileStore } from "./profileStore";

const symptomRepository = new DexieSymptomRepository();

export interface LogSymptomInput {
  date: DateOnly;
  mood?: Mood | null;
  painLevel?: number;
  flowLevel?: FlowLevel;
  note?: string | null;
}

export const useSymptomStore = defineStore("symptom", () => {
  const symptoms = shallowRef<Symptom[]>([]);
  const isLoading = shallowRef(false);

  const byDateMap = computed<Map<string, Symptom>>(
    () => new Map(symptoms.value.map((symptom) => [symptom.date.toIsoString(), symptom])),
  );

  async function initialize(): Promise<void> {
    const profileStore = useProfileStore();
    if (!profileStore.activeProfileId) {
      symptoms.value = [];
      return;
    }

    isLoading.value = true;
    try {
      symptoms.value = await symptomRepository.getAllForProfile(profileStore.activeProfileId);
    } finally {
      isLoading.value = false;
    }
  }

  function getForDate(date: DateOnly): Symptom | null {
    return byDateMap.value.get(date.toIsoString()) ?? null;
  }

  async function logSymptom(input: LogSymptomInput): Promise<void> {
    const profileStore = useProfileStore();
    if (!profileStore.activeProfileId) {
      throw new Error("No active profile selected.");
    }

    const id = `symptom_${profileStore.activeProfileId}_${input.date.toIsoString()}`;
    const symptom = Symptom.create({
      id,
      date: input.date,
      mood: input.mood,
      painLevel: input.painLevel,
      flowLevel: input.flowLevel,
      note: input.note,
    });

    await symptomRepository.save(symptom, profileStore.activeProfileId);

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

  return { symptoms, isLoading, byDateMap, initialize, getForDate, logSymptom, deleteSymptom };
});