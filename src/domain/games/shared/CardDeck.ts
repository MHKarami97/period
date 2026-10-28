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

  public static create<T>(items: readonly T[], random: IRandomSource, remaining?: readonly T[]): CardDeck<T> {
    const pool = remaining && remaining.length > 0 ? shuffle(remaining, random) : shuffle(items, random);
    return new CardDeck(items, pool);
  }

  public get isEmpty(): boolean {
    return this.source.length === 0;
  }

  public get remainingCount(): number {
    return this.remaining.length;
  }

  public draw(random: IRandomSource): { card: T; deck: CardDeck<T>; wasReset: boolean } {
    if (this.isEmpty) {
      throw new Error("Cannot draw from an empty deck.");
    }
    const wasReset = this.remaining.length === 0;
    const pool = wasReset ? shuffle(this.source, random) : this.remaining;
    const [card, ...rest] = pool;
    return { card, deck: new CardDeck(this.source, rest), wasReset };
  }
}
