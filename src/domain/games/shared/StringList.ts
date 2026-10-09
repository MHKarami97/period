import { GameValidationError } from "./GameValidationError";

export interface StringListOptions {
  minItems: number;
  maxItems: number;
  maxLength: number;
}

/**
 * StringList - immutable, de-duplicated list of short texts (dice faces, etc.)
 * enforcing size limits so a bad edit can never leave a game unplayable.
 */
export class StringList {
  private constructor(
    private readonly items: readonly string[],
    private readonly options: StringListOptions,
  ) {
    if (items.length < options.minItems) {
      throw new GameValidationError(`حداقل ${options.minItems} مورد باید وجود داشته باشد.`);
    }
    if (items.length > options.maxItems) {
      throw new GameValidationError(`حداکثر ${options.maxItems} مورد مجاز است.`);
    }
  }

  public static create(rawItems: readonly string[], options: StringListOptions): StringList {
    const unique: string[] = [];
    for (const raw of rawItems) {
      const text = raw.trim();
      if (text.length === 0) continue;
      if (text.length > options.maxLength) {
        throw new GameValidationError(`هر مورد حداکثر ${options.maxLength} نویسه می‌تواند باشد.`);
      }
      if (!unique.includes(text)) unique.push(text);
    }
    return new StringList(unique, options);
  }

  public get size(): number {
    return this.items.length;
  }

  public toArray(): string[] {
    return [...this.items];
  }

  public add(rawText: string): StringList {
    const text = rawText.trim();
    if (text.length === 0) {
      throw new GameValidationError("متن نمی‌تواند خالی باشد.");
    }
    if (this.items.includes(text)) {
      throw new GameValidationError("این مورد قبلاً اضافه شده است.");
    }
    return StringList.create([...this.items, text], this.options);
  }

  public removeAt(index: number): StringList {
    if (index < 0 || index >= this.items.length) {
      return this;
    }
    return StringList.create(
      this.items.filter((_, itemIndex) => itemIndex !== index),
      this.options,
    );
  }
}
