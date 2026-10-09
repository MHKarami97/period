import type { IRandomSource } from "../IRandomSource";
import { GameValidationError } from "../shared/GameValidationError";
import { shuffle } from "../shared/shuffle";
import type { ScratchCard, ScratchCategory } from "./ScratchCard";

export type SlotStatus = "hidden" | "revealed" | "done";

export interface ScratchSlot {
  readonly card: ScratchCard;
  readonly status: SlotStatus;
}

export const DEFAULT_SHEET_SIZE = 6;

/**
 * ScratchSheet - immutable "sheet" of cards dealt from the pool. Each slot
 * moves hidden -> revealed (scratched) -> done (the couple did it).
 * Cards already completed in earlier sheets are never dealt again.
 */
export class ScratchSheet {
  private constructor(private readonly slotList: readonly ScratchSlot[]) {}

  public static deal(input: {
    pool: readonly ScratchCard[];
    categories: readonly ScratchCategory[];
    completedIds: ReadonlySet<string>;
    random: IRandomSource;
    size?: number;
  }): ScratchSheet {
    const candidates = input.pool.filter(
      (card) => input.categories.includes(card.category) && !input.completedIds.has(card.id),
    );
    if (candidates.length === 0) {
      throw new GameValidationError("کارت انجام‌نشده‌ای در این دسته‌ها نمانده؛ پیشرفت را بازنشانی کنید یا کارت جدید اضافه کنید.");
    }
    const chosen = shuffle(candidates, input.random).slice(0, input.size ?? DEFAULT_SHEET_SIZE);
    return new ScratchSheet(chosen.map((card) => ({ card, status: "hidden" as const })));
  }

  public get slots(): readonly ScratchSlot[] {
    return this.slotList;
  }

  public get doneCount(): number {
    return this.slotList.filter((slot) => slot.status === "done").length;
  }

  public reveal(cardId: string): ScratchSheet {
    return this.transition(cardId, "hidden", "revealed");
  }

  public complete(cardId: string): ScratchSheet {
    return this.transition(cardId, "revealed", "done");
  }

  private transition(cardId: string, from: SlotStatus, to: SlotStatus): ScratchSheet {
    return new ScratchSheet(
      this.slotList.map((slot) => (slot.card.id === cardId && slot.status === from ? { ...slot, status: to } : slot)),
    );
  }
}
