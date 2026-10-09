import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import { DualDiceSettings, type DualDiceResult } from "@domain/games/dualDice/DualDiceSettings";
import { MathRandomSource } from "@infrastructure/random/MathRandomSource";
import { createDualDiceSettingsRepository } from "@infrastructure/repositories/gameSettingsRepositories";

const repository = createDualDiceSettingsRepository();
const randomSource = new MathRandomSource();

/** dualDiceStore - dice faces are edited and auto-saved; the last roll is kept while the app is open. */
export const useDualDiceStore = defineStore("dualDice", () => {
  const settings = shallowRef<DualDiceSettings>(repository.load() ?? DualDiceSettings.defaults());
  const lastResult = shallowRef<DualDiceResult | null>(null);

  const bodyParts = computed(() => settings.value.bodyParts);
  const actions = computed(() => settings.value.actions);

  function update(next: DualDiceSettings): void {
    settings.value = next;
    repository.save(next);
  }

  function addBodyPart(text: string): void {
    update(settings.value.withBodyPart(text));
  }

  function removeBodyPart(index: number): void {
    update(settings.value.withoutBodyPart(index));
  }

  function addAction(text: string): void {
    update(settings.value.withAction(text));
  }

  function removeAction(index: number): void {
    update(settings.value.withoutAction(index));
  }

  function resetToDefaults(): void {
    update(DualDiceSettings.defaults());
  }

  function roll(): void {
    lastResult.value = settings.value.roll(randomSource);
  }

  return { bodyParts, actions, lastResult, addBodyPart, removeBodyPart, addAction, removeAction, resetToDefaults, roll };
});
