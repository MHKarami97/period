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

/**
 * symptomStore - Application Service for the daily Symptom log, scoped to
 * whichever Profile is currently active (see profileStore), the same way
 * cycleStore is. One Symptom per (profile, calendar day): the id is
 * deterministically derived from the profile id + ISO date so `save`
 * naturally upserts without an extra lookup round-trip.
 */
export const useSymptomStore = defineStore("symptom", () => {
  const symptoms = shallowRef<Symptom[]>([]);
  const isLoading = shallowRef(false);

  const byDateMap = computed<Map<string, Symptom>>(
    () => new Map(symptoms.value.map((symptom) => [symptom.date.toIsoString(), symptom])),
  );

  async function initialize(): Promise<void> {
    const profileStore = useProfileStore();
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
