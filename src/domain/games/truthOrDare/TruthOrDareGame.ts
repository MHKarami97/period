import type { IRandomSource } from "../IRandomSource";
import { CardDeck } from "../shared/CardDeck";
import { fillPlayerTemplate } from "../shared/TextTemplate";
import { CardIntensity, CardType, INTENSITY_RANK, type TruthOrDareCard } from "./TruthOrDareCard";

const MAX_NAME_LENGTH = 30;

export interface DrawnCard {
  readonly id: string;
  readonly type: CardType;
  readonly intensity: CardIntensity;
  readonly playerName: string;
  /** Text with {player}/{partner} already replaced by real names. */
  readonly text: string;
}

type DeckMap = Readonly<Record<CardType, CardDeck<TruthOrDareCard>>>;

/**
 * TruthOrDareGame - Aggregate Root. Immutable: every action returns a new
 * game. Turn flow: draw (truth/dare) -> the card is shown -> finishTurn
 * (done or skipped; skipping is always allowed) -> the other player's turn.
 * Cards are not repeated until all eligible cards of that type have been seen once.
 */
export class TruthOrDareGame {
  private constructor(
    private readonly names: readonly [string, string],
    private readonly turnIndex: 0 | 1,
    private readonly decks: DeckMap,
    private readonly card: DrawnCard | null,
    private readonly seenIds: ReadonlySet<string>,
    private readonly justReset: boolean = false,
  ) {}

  public static start(input: {
    womanName: string;
    manName: string;
    intensity: CardIntensity;
    cards: readonly TruthOrDareCard[];
    random: IRandomSource;
    firstTurnIndex?: 0 | 1;
    seenCardIds?: ReadonlySet<string> | readonly string[];
  }): TruthOrDareGame {
    const names: [string, string] = [input.womanName.trim(), input.manName.trim()];
    if (names.some((name) => name.length === 0 || name.length > MAX_NAME_LENGTH)) {
      throw new Error(`Player names must be 1-${MAX_NAME_LENGTH} characters.`);
    }

    const eligible = input.cards.filter((card) => INTENSITY_RANK[card.intensity] <= INTENSITY_RANK[input.intensity]);
    const seenSet = new Set(input.seenCardIds ?? []);

    const buildDeck = (type: CardType): CardDeck<TruthOrDareCard> => {
      const typeCards = eligible.filter((card) => card.type === type);
      const unseen = typeCards.filter((card) => !seenSet.has(card.id));
      if (unseen.length === 0) {
        for (const card of typeCards) {
          seenSet.delete(card.id);
        }
      }
      const remaining = unseen.length > 0 ? unseen : typeCards;
      return CardDeck.create(typeCards, input.random, remaining);
    };

    const decks: DeckMap = {
      [CardType.Truth]: buildDeck(CardType.Truth),
      [CardType.Dare]: buildDeck(CardType.Dare),
    };
    return new TruthOrDareGame(names, input.firstTurnIndex ?? 0, decks, null, seenSet, false);
  }

  public get currentPlayerName(): string {
    return this.names[this.turnIndex];
  }

  public get partnerName(): string {
    return this.names[this.turnIndex === 0 ? 1 : 0];
  }

  public get drawnCard(): DrawnCard | null {
    return this.card;
  }

  public get seenCardIds(): ReadonlySet<string> {
    return this.seenIds;
  }

  public get wasReset(): boolean {
    return this.justReset;
  }

  public getRemainingCount(type: CardType): number {
    return this.decks[type].remainingCount;
  }

  public draw(type: CardType, random: IRandomSource): TruthOrDareGame {
    if (this.card !== null) {
      throw new Error("Finish the current card before drawing another one.");
    }
    const deck = this.decks[type];
    if (deck.isEmpty) {
      throw new Error("No cards available for this type.");
    }

    const { card, deck: nextDeck, wasReset } = deck.draw(random);
    const nextSeen = new Set(wasReset ? [] : this.seenIds);
    nextSeen.add(card.id);

    const drawn: DrawnCard = {
      id: card.id,
      type,
      intensity: card.intensity,
      playerName: this.currentPlayerName,
      text: fillPlayerTemplate(card.text, this.currentPlayerName, this.partnerName),
    };
    return new TruthOrDareGame(this.names, this.turnIndex, { ...this.decks, [type]: nextDeck }, drawn, nextSeen, wasReset);
  }

  public finishTurn(): TruthOrDareGame {
    return new TruthOrDareGame(this.names, this.turnIndex === 0 ? 1 : 0, this.decks, null, this.seenIds, false);
  }
}
