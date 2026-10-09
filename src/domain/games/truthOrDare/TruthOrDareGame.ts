import type { IRandomSource } from "../IRandomSource";
import { CardDeck } from "../shared/CardDeck";
import { fillPlayerTemplate } from "../shared/TextTemplate";
import { CardIntensity, CardType, INTENSITY_RANK, type TruthOrDareCard } from "./TruthOrDareCard";

const MAX_NAME_LENGTH = 30;

export interface DrawnCard {
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
 */
export class TruthOrDareGame {
  private constructor(
    private readonly names: readonly [string, string],
    private readonly turnIndex: 0 | 1,
    private readonly decks: DeckMap,
    private readonly card: DrawnCard | null,
  ) {}

  public static start(input: {
    womanName: string;
    manName: string;
    intensity: CardIntensity;
    cards: readonly TruthOrDareCard[];
    random: IRandomSource;
    firstTurnIndex?: 0 | 1;
  }): TruthOrDareGame {
    const names: [string, string] = [input.womanName.trim(), input.manName.trim()];
    if (names.some((name) => name.length === 0 || name.length > MAX_NAME_LENGTH)) {
      throw new Error(`Player names must be 1-${MAX_NAME_LENGTH} characters.`);
    }

    const eligible = input.cards.filter((card) => INTENSITY_RANK[card.intensity] <= INTENSITY_RANK[input.intensity]);
    const decks: DeckMap = {
      [CardType.Truth]: CardDeck.create(eligible.filter((card) => card.type === CardType.Truth), input.random),
      [CardType.Dare]: CardDeck.create(eligible.filter((card) => card.type === CardType.Dare), input.random),
    };
    return new TruthOrDareGame(names, input.firstTurnIndex ?? 0, decks, null);
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

  public draw(type: CardType, random: IRandomSource): TruthOrDareGame {
    if (this.card !== null) {
      throw new Error("Finish the current card before drawing another one.");
    }
    const deck = this.decks[type];
    if (deck.isEmpty) {
      throw new Error("No cards available for this type.");
    }

    const { card, deck: nextDeck } = deck.draw(random);
    const drawn: DrawnCard = {
      type,
      intensity: card.intensity,
      playerName: this.currentPlayerName,
      text: fillPlayerTemplate(card.text, this.currentPlayerName, this.partnerName),
    };
    return new TruthOrDareGame(this.names, this.turnIndex, { ...this.decks, [type]: nextDeck }, drawn);
  }

  public finishTurn(): TruthOrDareGame {
    return new TruthOrDareGame(this.names, this.turnIndex === 0 ? 1 : 0, this.decks, null);
  }
}
