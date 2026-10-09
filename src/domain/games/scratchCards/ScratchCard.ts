import { GameValidationError } from "../shared/GameValidationError";

export enum ScratchCategory {
  Outing = "OUTING",
  Adventure = "ADVENTURE",
  AtHome = "AT_HOME",
  Intimate = "INTIMATE",
}

export const SCRATCH_CATEGORY_LABELS_FA: Record<ScratchCategory, string> = {
  [ScratchCategory.Outing]: "قرار بیرون",
  [ScratchCategory.Adventure]: "ماجراجویی",
  [ScratchCategory.AtHome]: "عاشقانه در خانه",
  [ScratchCategory.Intimate]: "صمیمی",
};

export const MAX_SCRATCH_TEXT_LENGTH = 200;

export interface ScratchCard {
  readonly id: string;
  readonly category: ScratchCategory;
  readonly text: string;
}

export class ScratchCardFactory {
  public static create(input: { id: string; category: ScratchCategory; text: string }): ScratchCard {
    const text = input.text.trim();
    if (text.length === 0) {
      throw new GameValidationError("متن کارت نمی‌تواند خالی باشد.");
    }
    if (text.length > MAX_SCRATCH_TEXT_LENGTH) {
      throw new GameValidationError(`متن کارت حداکثر ${MAX_SCRATCH_TEXT_LENGTH} نویسه می‌تواند باشد.`);
    }
    if (!Object.values(ScratchCategory).includes(input.category)) {
      throw new GameValidationError("دسته‌ی کارت نامعتبر است.");
    }
    return { id: input.id, category: input.category, text };
  }
}
