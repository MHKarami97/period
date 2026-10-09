import type { IRandomSource } from "../IRandomSource";
import { shuffle } from "./shuffle";

/**
 * CardDeck - immutable shuffled deck. Draws every card once before any card
 * repeats; when the deck runs out it is reshuffled from the source list.
 */
export class CardDeck<T> {
  private constructor(
    private readonly source: readonly T[],
    private readonly remaining: readonly T[],
  ) {}

  public static create<T>(items: readonly T[], random: IRandomSource): CardDeck<T> {
    return new CardDeck(items, shuffle(items, random));
  }

  public get isEmpty(): boolean {
    return this.source.length === 0;
  }

  public draw(random: IRandomSource): { card: T; deck: CardDeck<T> } {
    if (this.isEmpty) {
      throw new Error("Cannot draw from an empty deck.");
    }
    const pool = this.remaining.length > 0 ? this.remaining : shuffle(this.source, random);
    const [card, ...rest] = pool;
    return { card, deck: new CardDeck(this.source, rest) };
  }
}
