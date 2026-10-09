import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { DEFAULT_DURATION_MINUTES, TwoQuestionSession } from "@domain/games/twoQuestions/TwoQuestionSession";
import { MathRandomSource } from "@infrastructure/random/MathRandomSource";
import { createTwoQuestionSettingsRepository } from "@infrastructure/repositories/gameSettingsRepositories";
import { useCouplePlayersStore } from "./couplePlayersStore";

export type StepPhase = "question" | "touch";

const repository = createTwoQuestionSettingsRepository();
const randomSource = new MathRandomSource();

export const useTwoQuestionStore = defineStore("twoQuestion", () => {
  const durationMinutes = ref(repository.load()?.durationMinutes ?? DEFAULT_DURATION_MINUTES);
  const session = shallowRef<TwoQuestionSession | null>(null);
  const phase = ref<StepPhase>("question");

  const isPlaying = computed(() => session.value !== null);

  function setDuration(minutes: number): void {
    if (!TwoQuestionSession.isValidDuration(minutes)) {
      return;
    }
    durationMinutes.value = minutes;
    repository.save({ durationMinutes: minutes });
  }

  function startSession(): void {
    const players = useCouplePlayersStore();
    if (!players.areNamesComplete) {
      throw new Error("Both player names are required.");
    }
    session.value = TwoQuestionSession.start({
      womanName: players.womanName,
      manName: players.manName,
      durationMinutes: durationMinutes.value,
      firstAskerIndex: randomSource.nextInt(0, 1) === 0 ? 0 : 1,
    });
    phase.value = "question";
  }

  function beginTouch(): void {
    phase.value = "touch";
  }

  function nextStep(): void {
    session.value = session.value?.advance() ?? null;
    phase.value = "question";
  }

  function quit(): void {
    session.value = null;
    phase.value = "question";
  }

  return { durationMinutes, session, phase, isPlaying, setDuration, startSession, beginTouch, nextStep, quit };
});
