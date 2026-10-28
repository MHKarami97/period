import {
  ConversationCardFactory,
  ConversationCategory,
  type ConversationCard,
} from "@domain/games/conversation/ConversationCard";
import { DualDiceSettings, type DualDiceSnapshot } from "@domain/games/dualDice/DualDiceSettings";
import { ScratchCardFactory, ScratchCategory, type ScratchCard } from "@domain/games/scratchCards/ScratchCard";
import type { IGameSettingsRepository } from "@domain/games/shared/IGameSettingsRepository";
import { CardIntensity, TruthOrDareCardFactory, type TruthOrDareCard } from "@domain/games/truthOrDare/TruthOrDareCard";
import { DEFAULT_DURATION_MINUTES, TwoQuestionSession } from "@domain/games/twoQuestions/TwoQuestionSession";
import { LocalStorageJsonRepository } from "./LocalStorageJsonRepository";

const KEY_PREFIX = "period-tracker:games";

export interface TruthOrDareSettings {
  intensity: CardIntensity;
  customCards: TruthOrDareCard[];
  seenCardIds?: string[];
}

export interface TwoQuestionSettings {
  durationMinutes: number;
  seenQuestionTemplates?: string[];
}

export interface ConversationSettings {
  categories: ConversationCategory[];
  customCards: ConversationCard[];
  seenCardIds?: string[];
}

export interface ScratchCardsSettings {
  categories: ScratchCategory[];
  completedIds: string[];
  customCards: ScratchCard[];
}

/** Keeps only the values that are valid members of the given enum. */
function pickEnumValues<T extends string>(raw: unknown, allowed: readonly T[]): T[] {
  return Array.isArray(raw) ? raw.filter((value): value is T => allowed.includes(value as T)) : [];
}

/** Rebuilds cards through their factory, silently dropping invalid entries. */
function pickCards<T>(raw: unknown, build: (item: unknown) => T): T[] {
  const cards: T[] = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    try {
      cards.push(build(item));
    } catch {
      // Skip corrupted entries instead of failing the whole document.
    }
  }
  return cards;
}

export function createDualDiceSettingsRepository(): IGameSettingsRepository<DualDiceSettings> {
  return new LocalStorageJsonRepository<DualDiceSettings>(
    `${KEY_PREFIX}:dual-dice`,
    (raw) => DualDiceSettings.fromSnapshot(raw as DualDiceSnapshot),
    (settings) => settings.toSnapshot(),
  );
}

export function createTruthOrDareSettingsRepository(): IGameSettingsRepository<TruthOrDareSettings> {
  return new LocalStorageJsonRepository<TruthOrDareSettings>(
    `${KEY_PREFIX}:truth-or-dare`,
    (raw) => {
      const stored = raw as Partial<{ intensity: CardIntensity; customCards: unknown; seenCardIds: unknown }>;
      const intensity = Object.values(CardIntensity).includes(stored.intensity as CardIntensity)
        ? (stored.intensity as CardIntensity)
        : CardIntensity.Medium;
      return {
        intensity,
        customCards: pickCards(stored.customCards, (item) => TruthOrDareCardFactory.create(item as TruthOrDareCard)),
        seenCardIds: Array.isArray(stored.seenCardIds)
          ? stored.seenCardIds.filter((id): id is string => typeof id === "string")
          : [],
      };
    },
    (settings) => settings,
  );
}

export function createTwoQuestionSettingsRepository(): IGameSettingsRepository<TwoQuestionSettings> {
  return new LocalStorageJsonRepository<TwoQuestionSettings>(
    `${KEY_PREFIX}:two-questions`,
    (raw) => {
      const stored = raw as Partial<{ durationMinutes: unknown; seenQuestionTemplates: unknown }>;
      const minutes = stored.durationMinutes;
      return {
        durationMinutes: TwoQuestionSession.isValidDuration(minutes as number) ? (minutes as number) : DEFAULT_DURATION_MINUTES,
        seenQuestionTemplates: Array.isArray(stored.seenQuestionTemplates)
          ? stored.seenQuestionTemplates.filter((item): item is string => typeof item === "string")
          : [],
      };
    },
    (settings) => settings,
  );
}

export function createConversationSettingsRepository(): IGameSettingsRepository<ConversationSettings> {
  const allCategories = Object.values(ConversationCategory);
  return new LocalStorageJsonRepository<ConversationSettings>(
    `${KEY_PREFIX}:conversation`,
    (raw) => {
      const stored = raw as Partial<Record<keyof ConversationSettings, unknown>>;
      const categories = pickEnumValues(stored.categories, allCategories);
      return {
        categories: categories.length > 0 ? categories : allCategories,
        customCards: pickCards(stored.customCards, (item) => ConversationCardFactory.create(item as ConversationCard)),
        seenCardIds: Array.isArray(stored.seenCardIds)
          ? stored.seenCardIds.filter((id): id is string => typeof id === "string")
          : [],
      };
    },
    (settings) => settings,
  );
}

export function createScratchCardsSettingsRepository(): IGameSettingsRepository<ScratchCardsSettings> {
  const allCategories = Object.values(ScratchCategory);
  return new LocalStorageJsonRepository<ScratchCardsSettings>(
    `${KEY_PREFIX}:scratch-cards`,
    (raw) => {
      const stored = raw as Partial<Record<keyof ScratchCardsSettings, unknown>>;
      const categories = pickEnumValues(stored.categories, allCategories);
      return {
        categories: categories.length > 0 ? categories : allCategories,
        completedIds: Array.isArray(stored.completedIds)
          ? stored.completedIds.filter((id): id is string => typeof id === "string")
          : [],
        customCards: pickCards(stored.customCards, (item) => ScratchCardFactory.create(item as ScratchCard)),
      };
    },
    (settings) => settings,
  );
}
