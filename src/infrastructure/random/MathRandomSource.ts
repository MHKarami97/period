import type { IRandomSource } from "@domain/games/IRandomSource";

/** Adapter for IRandomSource backed by Math.random (sufficient for a party game, not for security). */
export class MathRandomSource implements IRandomSource {
  public nextInt(minInclusive: number, maxInclusive: number): number {
    return minInclusive + Math.floor(Math.random() * (maxInclusive - minInclusive + 1));
  }
}
