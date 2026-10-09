import { GameValidationError } from "../shared/GameValidationError";

export enum CardType {
  Truth = "TRUTH",
  Dare = "DARE",
}

export enum CardIntensity {
  Soft = "SOFT",
  Medium = "MEDIUM",
  Bold = "BOLD",
}

export const CARD_TYPE_LABELS_FA: Record<CardType, string> = {
  [CardType.Truth]: "حقیقت",
  [CardType.Dare]: "جرئت",
};

export const INTENSITY_LABELS_FA: Record<CardIntensity, string> = {
  [CardIntensity.Soft]: "ملایم",
  [CardIntensity.Medium]: "متوسط",
  [CardIntensity.Bold]: "جسورانه",
};

/** A selected intensity includes every card at that level or below. */
export const INTENSITY_RANK: Record<CardIntensity, number> = {
  [CardIntensity.Soft]: 1,
  [CardIntensity.Medium]: 2,
  [CardIntensity.Bold]: 3,
};

export const MAX_CARD_TEXT_LENGTH = 200;

export interface TruthOrDareCard {
  readonly id: string;
  readonly type: CardType;
  readonly intensity: CardIntensity;
  readonly text: string;
}

export class TruthOrDareCardFactory {
  public static create(input: { id: string; type: CardType; intensity: CardIntensity; text: string }): TruthOrDareCard {
    const text = input.text.trim();
    if (text.length === 0) {
      throw new GameValidationError("متن کارت نمی‌تواند خالی باشد.");
    }
    if (text.length > MAX_CARD_TEXT_LENGTH) {
      throw new GameValidationError(`متن کارت حداکثر ${MAX_CARD_TEXT_LENGTH} نویسه می‌تواند باشد.`);
    }
    if (!Object.values(CardType).includes(input.type) || !Object.values(CardIntensity).includes(input.intensity)) {
      throw new GameValidationError("نوع یا شدت کارت نامعتبر است.");
    }
    return { id: input.id, type: input.type, intensity: input.intensity, text };
  }
}
