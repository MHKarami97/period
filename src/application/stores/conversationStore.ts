import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import {
  ConversationCardFactory,
  ConversationCategory,
  type ConversationCard,
} from "@domain/games/conversation/ConversationCard";
import { ConversationSession } from "@domain/games/conversation/ConversationSession";
import { DEFAULT_CONVERSATION_CARDS } from "@domain/games/conversation/defaultConversationCards";
import { MathRandomSource } from "@infrastructure/random/MathRandomSource";
import { createConversationSettingsRepository } from "@infrastructure/repositories/gameSettingsRepositories";

const MAX_CUSTOM_CARDS = 100;

const repository = createConversationSettingsRepository();
const randomSource = new MathRandomSource();

/** conversationStore - category selection and custom cards are auto-saved; the deck lives in memory. */
export const useConversationStore = defineStore("conversation", () => {
  const saved = repository.load();
  const categories = shallowRef<ConversationCategory[]>(saved?.categories ?? Object.values(ConversationCategory));
  const customCards = shallowRef<ConversationCard[]>(saved?.customCards ?? []);

  const allCards = computed(() => [...DEFAULT_CONVERSATION_CARDS, ...customCards.value]);
  const activeCardCount = computed(() => allCards.value.filter((card) => categories.value.includes(card.category)).length);
  const session = shallowRef<ConversationSession>(ConversationSession.start(allCards.value, categories.value, randomSource));

  function rebuildSession(): void {
    session.value = ConversationSession.start(allCards.value, categories.value, randomSource);
  }

  function persist(): void {
    repository.save({ categories: categories.value, customCards: customCards.value });
  }

  function toggleCategory(category: ConversationCategory): void {
    const isSelected = categories.value.includes(category);
    if (isSelected && categories.value.length === 1) {
      return;
    }
    categories.value = isSelected ? categories.value.filter((item) => item !== category) : [...categories.value, category];
    persist();
    rebuildSession();
  }

  function addCustomCard(category: ConversationCategory, text: string): void {
    if (customCards.value.length >= MAX_CUSTOM_CARDS) {
      throw new Error(`حداکثر ${MAX_CUSTOM_CARDS} کارت سفارشی مجاز است.`);
    }
    const card = ConversationCardFactory.create({ id: crypto.randomUUID(), category, text });
    customCards.value = [...customCards.value, card];
    persist();
    rebuildSession();
  }

  function removeCustomCard(id: string): void {
    customCards.value = customCards.value.filter((card) => card.id !== id);
    persist();
    rebuildSession();
  }

  function drawNext(): void {
    session.value = session.value.draw(randomSource);
  }

  return { categories, customCards, session, activeCardCount, toggleCategory, addCustomCard, removeCustomCard, drawNext };
});
