import type { DateOnly } from "../valueObjects/DateOnly";

/**
 * DailyRotation - deterministic "random" choice that stays stable for a whole day and changes the next day.
 * No persistence needed and no flicker on re-render.
 */
export class DailyRotation {
  private constructor(private readonly seed: number) {}

  public static forDay(day: DateOnly, salt = ""): DailyRotation {
    return new DailyRotation(DailyRotation.hash(`${day.toIsoString()}|${salt}`));
  }

  public pick<T>(items: readonly T[], offset = 0): T | null {
    if (items.length === 0) {
      return null;
    }
    return items[(this.seed + offset) % items.length];
  }

  public startIndex(length: number): number {
    return length === 0 ? 0 : this.seed % length;
  }

  /** FNV-1a 32-bit. */
  private static hash(text: string): number {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
}
