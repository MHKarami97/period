/**
 * IRandomSource - Port that hides the randomness source so board generation
 * and dice rolls stay deterministic and unit-testable.
 */
export interface IRandomSource {
  /** Returns an integer in the closed range [minInclusive, maxInclusive]. */
  nextInt(minInclusive: number, maxInclusive: number): number;
}
