import type { IRandomSource } from "../IRandomSource";

/** Fisher-Yates shuffle returning a new array (the input is never mutated). */
export function shuffle<T>(items: readonly T[], random: IRandomSource): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = random.nextInt(0, index);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
