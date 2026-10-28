import type { IRandomSource } from "../IRandomSource";
import { CardDeck } from "../shared/CardDeck";
import { GameValidationError } from "../shared/GameValidationError";
import type { ConversationCard, ConversationCategory } from "./ConversationCard";

function inputSeenCards(seenCardIds?: ReadonlySet<string> | readonly string[]): Set<string> {
  return new Set(seenCardIds ?? []);
}

/**
 * ConversationSession - immutable deck of conversation cards limited to the
 * chosen categories. Every card is shown once before any card repeats.
 * Resets automatically once all eligible cards have been shown.
 */
export class ConversationSession {
  private constructor(
    private readonly cards: readonly ConversationCard[],
    private readonly categories: readonly ConversationCategory[],
    private readonly deck: CardDeck<ConversationCard>,
    private readonly card: ConversationCard | null,
    private readonly drawnCount: number,
    private readonly seenIds: ReadonlySet<string>,
    private readonly justReset: boolean = false,
  ) {}

  public static start(
    cards: readonly ConversationCard[],
    categories: readonly ConversationCategory[],
    random: IRandomSource,
    seenCardIds?: ReadonlySet<string> | readonly string[],
  ): ConversationSession {
    const eligible = cards.filter((card) => categories.includes(card.category));
    const seenSet = inputSeenCards(seenCardIds);
    const unseen = eligible.filter((card) => !seenSet.has(card.id));
    if (unseen.length === 0 && eligible.length > 0) {
      for (const card of eligible) {
        seenSet.delete(card.id);
      }
    }
    const remaining = unseen.length > 0 ? unseen : eligible;
    const deck = CardDeck.create(eligible, random, remaining);
    return new ConversationSession(cards, categories, deck, null, 0, seenSet, false);
  }

  public get hasCards(): boolean {
    return !this.deck.isEmpty;
  }

  public get currentCard(): ConversationCard | null {
    return this.card;
  }

  public get drawnNumber(): number {
    return this.drawnCount;
  }

  public get remainingCount(): number {
    return this.deck.remainingCount;
  }

  public get seenCardIds(): ReadonlySet<string> {
    return this.seenIds;
  }

  public get wasReset(): boolean {
    return this.justReset;
  }

  public draw(random: IRandomSource): ConversationSession {
    if (!this.hasCards) {
      throw new GameValidationError("در دسته‌های انتخاب‌شده کارتی وجود ندارد.");
    }
    const { card, deck, wasReset } = this.deck.draw(random);
    const nextSeen = new Set(wasReset ? [] : this.seenIds);
    nextSeen.add(card.id);

    return new ConversationSession(this.cards, this.categories, deck, card, this.drawnCount + 1, nextSeen, wasReset);
  }
}
