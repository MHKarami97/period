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
  const saved = repository.load();
  const durationMinutes = ref(saved?.durationMinutes ?? DEFAULT_DURATION_MINUTES);
  const seenQuestionTemplates = shallowRef<ReadonlySet<string>>(new Set(saved?.seenQuestionTemplates ?? []));
  const session = shallowRef<TwoQuestionSession | null>(null);
  const phase = ref<StepPhase>("question");

  const isPlaying = computed(() => session.value !== null);

  function persist(): void {
    repository.save({
      durationMinutes: durationMinutes.value,
      seenQuestionTemplates: [...seenQuestionTemplates.value],
    });
  }

  function setDuration(minutes: number): void {
    if (!TwoQuestionSession.isValidDuration(minutes)) {
      return;
    }
    durationMinutes.value = minutes;
    persist();
  }

  function startSession(): void {
    const players = useCouplePlayersStore();
    if (!players.areNamesComplete) {
      throw new Error("Both player names are required.");
    }
    const nextSession = TwoQuestionSession.start({
      womanName: players.womanName,
      manName: players.manName,
      durationMinutes: durationMinutes.value,
      firstAskerIndex: randomSource.nextInt(0, 1) === 0 ? 0 : 1,
      random: randomSource,
      seenTemplates: seenQuestionTemplates.value,
    });
    session.value = nextSession;
    seenQuestionTemplates.value = nextSession.seenTemplates;
    persist();
    phase.value = "question";
  }

  function resetSeenQuestions(): void {
    seenQuestionTemplates.value = new Set();
    persist();
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

  return {
    durationMinutes,
    seenQuestionTemplates,
    session,
    phase,
    isPlaying,
    setDuration,
    startSession,
    resetSeenQuestions,
    beginTouch,
    nextStep,
    quit,
  };
});