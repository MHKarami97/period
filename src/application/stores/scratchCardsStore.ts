import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { DEFAULT_SCRATCH_CARDS } from "@domain/games/scratchCards/defaultScratchCards";
import { ScratchCardFactory, ScratchCategory, type ScratchCard } from "@domain/games/scratchCards/ScratchCard";
import { ScratchSheet } from "@domain/games/scratchCards/ScratchSheet";
import { GameValidationError } from "@domain/games/shared/GameValidationError";
import { MathRandomSource } from "@infrastructure/random/MathRandomSource";
import { createScratchCardsSettingsRepository } from "@infrastructure/repositories/gameSettingsRepositories";

const MAX_CUSTOM_CARDS = 100;

const repository = createScratchCardsSettingsRepository();
const randomSource = new MathRandomSource();

/**
 * scratchCardsStore - keeps which cards the couple already completed (so
 * they are never dealt again), the category filter and custom cards. The
 * current sheet only lives in memory.
 */
export const useScratchCardsStore = defineStore("scratchCards", () => {
  const saved = repository.load();
  const categories = shallowRef<ScratchCategory[]>(saved?.categories ?? Object.values(ScratchCategory));
  const customCards = shallowRef<ScratchCard[]>(saved?.customCards ?? []);
  const completedIds = shallowRef<ReadonlySet<string>>(new Set(saved?.completedIds ?? []));
  const sheet = shallowRef<ScratchSheet | null>(null);
  const dealError = ref<string | null>(null);

  const allCards = computed(() => [...DEFAULT_SCRATCH_CARDS, ...customCards.value]);
  const availableCount = computed(
    () => allCards.value.filter((card) => categories.value.includes(card.category) && !completedIds.value.has(card.id)).length,
  );

  function persist(): void {
    repository.save({
      categories: categories.value,
      completedIds: [...completedIds.value],
      customCards: customCards.value,
    });
  }

  function dealSheet(): void {
    try {
      sheet.value = ScratchSheet.deal({
        pool: allCards.value,
        categories: categories.value,
        completedIds: completedIds.value,
        random: randomSource,
      });
      dealError.value = null;
    } catch (error) {
      sheet.value = null;
      dealError.value = error instanceof GameValidationError ? error.message : "ساختن ورق جدید ممکن نشد.";
    }
  }

  function toggleCategory(category: ScratchCategory): void {
    const isSelected = categories.value.includes(category);
    if (isSelected && categories.value.length === 1) {
      return;
    }
    categories.value = isSelected ? categories.value.filter((item) => item !== category) : [...categories.value, category];
    persist();
  }

  function reveal(cardId: string): void {
    sheet.value = sheet.value?.reveal(cardId) ?? null;
  }

  function complete(cardId: string): void {
    sheet.value = sheet.value?.complete(cardId) ?? null;
    completedIds.value = new Set([...completedIds.value, cardId]);
    persist();
  }

  function resetProgress(): void {
    completedIds.value = new Set();
    persist();
    dealSheet();
  }

  function addCustomCard(category: ScratchCategory, text: string): void {
    if (customCards.value.length >= MAX_CUSTOM_CARDS) {
      throw new Error(`حداکثر ${MAX_CUSTOM_CARDS} کارت سفارشی مجاز است.`);
    }
    customCards.value = [...customCards.value, ScratchCardFactory.create({ id: crypto.randomUUID(), category, text })];
    persist();
  }

  function removeCustomCard(id: string): void {
    customCards.value = customCards.value.filter((card) => card.id !== id);
    persist();
  }

  dealSheet();

  return {
    categories,
    customCards,
    sheet,
    dealError,
    availableCount,
    dealSheet,
    toggleCategory,
    reveal,
    complete,
    resetProgress,
    addCustomCard,
    removeCustomCard,
  };
});
