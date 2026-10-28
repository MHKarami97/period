import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { DEFAULT_CARDS } from "@domain/games/truthOrDare/defaultCards";
import {
  CardIntensity,
  CardType,
  INTENSITY_RANK,
  TruthOrDareCardFactory,
  type TruthOrDareCard,
} from "@domain/games/truthOrDare/TruthOrDareCard";
import { TruthOrDareGame } from "@domain/games/truthOrDare/TruthOrDareGame";
import { MathRandomSource } from "@infrastructure/random/MathRandomSource";
import { createTruthOrDareSettingsRepository } from "@infrastructure/repositories/gameSettingsRepositories";
import { useCouplePlayersStore } from "./couplePlayersStore";

const MAX_CUSTOM_CARDS = 100;

const repository = createTruthOrDareSettingsRepository();
const randomSource = new MathRandomSource();

export const useTruthOrDareStore = defineStore("truthOrDare", () => {
  const saved = repository.load();
  const intensity = ref<CardIntensity>(saved?.intensity ?? CardIntensity.Medium);
  const customCards = shallowRef<TruthOrDareCard[]>(saved?.customCards ?? []);
  const seenCardIds = shallowRef<ReadonlySet<string>>(new Set(saved?.seenCardIds ?? []));
  const game = shallowRef<TruthOrDareGame | null>(null);

  const isPlaying = computed(() => game.value !== null);
  const allCards = computed(() => [...DEFAULT_CARDS, ...customCards.value]);
  const activeCardCount = computed(
    () => allCards.value.filter((card) => INTENSITY_RANK[card.intensity] <= INTENSITY_RANK[intensity.value]).length,
  );

  const remainingTruthCount = computed(() =>
    game.value ? game.value.getRemainingCount(CardType.Truth) : allCards.value.filter((c) => c.type === CardType.Truth && INTENSITY_RANK[c.intensity] <= INTENSITY_RANK[intensity.value] && !seenCardIds.value.has(c.id)).length,
  );

  const remainingDareCount = computed(() =>
    game.value ? game.value.getRemainingCount(CardType.Dare) : allCards.value.filter((c) => c.type === CardType.Dare && INTENSITY_RANK[c.intensity] <= INTENSITY_RANK[intensity.value] && !seenCardIds.value.has(c.id)).length,
  );

  function persist(): void {
    repository.save({
      intensity: intensity.value,
      customCards: customCards.value,
      seenCardIds: [...seenCardIds.value],
    });
  }

  function setIntensity(next: CardIntensity): void {
    intensity.value = next;
    persist();
  }

  function addCustomCard(type: CardType, cardIntensity: CardIntensity, text: string): void {
    if (customCards.value.length >= MAX_CUSTOM_CARDS) {
      throw new Error(`حداکثر ${MAX_CUSTOM_CARDS} کارت سفارشی مجاز است.`);
    }
    const card = TruthOrDareCardFactory.create({ id: crypto.randomUUID(), type, intensity: cardIntensity, text });
    customCards.value = [...customCards.value, card];
    persist();
  }

  function removeCustomCard(id: string): void {
    customCards.value = customCards.value.filter((card) => card.id !== id);
    persist();
  }

  function startGame(): void {
    const players = useCouplePlayersStore();
    if (!players.areNamesComplete) {
      throw new Error("Both player names are required.");
    }
    game.value = TruthOrDareGame.start({
      womanName: players.womanName,
      manName: players.manName,
      intensity: intensity.value,
      cards: allCards.value,
      random: randomSource,
      firstTurnIndex: randomSource.nextInt(0, 1) === 0 ? 0 : 1,
      seenCardIds: seenCardIds.value,
    });
    seenCardIds.value = game.value.seenCardIds;
    persist();
  }

  function draw(type: CardType): void {
    if (!game.value) return;
    game.value = game.value.draw(type, randomSource);
    seenCardIds.value = game.value.seenCardIds;
    persist();
  }

  function finishTurn(): void {
    game.value = game.value?.finishTurn() ?? null;
  }

  function resetSeenCards(): void {
    seenCardIds.value = new Set();
    persist();
    if (isPlaying.value) {
      startGame();
    }
  }

  function quitGame(): void {
    game.value = null;
  }

  return {
    intensity,
    customCards,
    seenCardIds,
    game,
    isPlaying,
    activeCardCount,
    remainingTruthCount,
    remainingDareCount,
    setIntensity,
    addCustomCard,
    removeCustomCard,
    startGame,
    draw,
    finishTurn,
    resetSeenCards,
    quitGame,
  };
});
