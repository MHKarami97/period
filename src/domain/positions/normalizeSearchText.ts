const ARABIC_TO_PERSIAN: Readonly<Record<string, string>> = { "ي": "ی", "ى": "ی", "ك": "ک", "ة": "ه", "ۀ": "ه" };
const DIGIT_ZERO_PERSIAN = 0x06f0;
const DIGIT_ZERO_ARABIC = 0x0660;

/**
 * Normalises text for forgiving Persian search: unifies Arabic/Persian letter
 * variants, converts Persian/Arabic digits to ASCII, drops diacritics and
 * tatweel, and treats "_" and ZWNJ as spaces.
 */
export function normalizeSearchText(value: string): string {
  return value
    .replace(/[يىكةۀ]/g, (char) => ARABIC_TO_PERSIAN[char])
    .replace(/[\u06f0-\u06f9]/g, (digit) => String(digit.charCodeAt(0) - DIGIT_ZERO_PERSIAN))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - DIGIT_ZERO_ARABIC))
    .replace(/[\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/[_\u200c]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
