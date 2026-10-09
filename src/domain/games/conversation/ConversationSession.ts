import type { IRandomSource } from "../IRandomSource";
import { CardDeck } from "../shared/CardDeck";
import { GameValidationError } from "../shared/GameValidationError";
import type { ConversationCard, ConversationCategory } from "./ConversationCard";

/**
 * ConversationSession - immutable deck of conversation cards limited to the
 * chosen categories. Every card is shown once before any card repeats.
 */
export class ConversationSession {
  private constructor(
    private readonly deck: CardDeck<ConversationCard>,
    private readonly card: ConversationCard | null,
    private readonly drawnCount: number,
  ) {}

  public static start(
    cards: readonly ConversationCard[],
    categories: readonly ConversationCategory[],
    random: IRandomSource,
  ): ConversationSession {
    const eligible = cards.filter((card) => categories.includes(card.category));
    return new ConversationSession(CardDeck.create(eligible, random), null, 0);
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

  public draw(random: IRandomSource): ConversationSession {
    if (!this.hasCards) {
      throw new GameValidationError("در دسته‌های انتخاب‌شده کارتی وجود ندارد.");
    }
    const { card, deck } = this.deck.draw(random);
    return new ConversationSession(deck, card, this.drawnCount + 1);
  }
}
