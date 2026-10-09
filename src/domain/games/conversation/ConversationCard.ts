import { GameValidationError } from "../shared/GameValidationError";

export enum ConversationCategory {
  Individual = "INDIVIDUAL",
  Couple = "COUPLE",
  Family = "FAMILY",
  Intimacy = "INTIMACY",
  PastFuture = "PAST_FUTURE",
}

export const CONVERSATION_CATEGORY_LABELS_FA: Record<ConversationCategory, string> = {
  [ConversationCategory.Individual]: "فردی",
  [ConversationCategory.Couple]: "زوج",
  [ConversationCategory.Family]: "خانواده",
  [ConversationCategory.Intimacy]: "صمیمیت",
  [ConversationCategory.PastFuture]: "گذشته و آینده",
};

export const MAX_CONVERSATION_TEXT_LENGTH = 200;

export interface ConversationCard {
  readonly id: string;
  readonly category: ConversationCategory;
  readonly text: string;
}

export class ConversationCardFactory {
  public static create(input: { id: string; category: ConversationCategory; text: string }): ConversationCard {
    const text = input.text.trim();
    if (text.length === 0) {
      throw new GameValidationError("متن کارت نمی‌تواند خالی باشد.");
    }
    if (text.length > MAX_CONVERSATION_TEXT_LENGTH) {
      throw new GameValidationError(`متن کارت حداکثر ${MAX_CONVERSATION_TEXT_LENGTH} نویسه می‌تواند باشد.`);
    }
    if (!Object.values(ConversationCategory).includes(input.category)) {
      throw new GameValidationError("دسته‌ی کارت نامعتبر است.");
    }
    return { id: input.id, category: input.category, text };
  }
}
