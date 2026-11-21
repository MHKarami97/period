import type { HamdelEntry } from "../hamdel/HamdelEntry";

export type GiftSource = "hint" | "wishlist" | "gift" | "interest";

export interface GiftIdea {
  readonly id: string;
  readonly source: GiftSource;
  readonly icon: string;
  readonly text: string;
  readonly cost: number | null;
}

const GIFT_INTEREST_CATEGORIES: ReadonlySet<string> = new Set(["flower", "perfume", "book", "music", "drink", "food", "hobby", "brand", "style", "movie", "color"]);
const FINISHED_STATUSES: ReadonlySet<string> = new Set(["done", "bought", "given", "achieved", "skipped", "cancelled"]);
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const MAX_IDEAS = 12;

/** "۲٬۵۰۰٬۰۰۰ تومان" -> 2500000, anything without digits -> null. */
export function parseAmount(text: string): number | null {
  const digits = [...text].map((char) => (PERSIAN_DIGITS.includes(char) ? String(PERSIAN_DIGITS.indexOf(char)) : char)).filter((char) => /\d/.test(char)).join("");
  return digits === "" ? null : Number(digits);
}

/** Domain Service: turns hints, wishlist, gift ideas and interests into gift ideas that fit a budget. */
export class GiftIdeaFinder {
  public static find(entries: readonly HamdelEntry[], budget: number | null): GiftIdea[] {
    const within = (cost: number | null): boolean => budget === null || cost === null || cost <= budget;
    const ideas: GiftIdea[] = [];

    for (const entry of entries) {
      const status = entry.valueOf("status");
      if (entry.section === "hints" && status === "noted") {
        ideas.push({ id: entry.id, source: "hint", icon: "💡", text: `او اشاره کرده بود: «${entry.valueOf("hint")}»`, cost: null });
      } else if (entry.section === "wishlist" && !FINISHED_STATUSES.has(status)) {
        const cost = parseAmount(entry.valueOf("cost"));
        if (within(cost)) ideas.push({ id: entry.id, source: "wishlist", icon: "🪄", text: `از لیست آرزوهای مشترک: «${entry.valueOf("title")}»`, cost });
      } else if (entry.section === "gifts" && status === "idea") {
        ideas.push({ id: entry.id, source: "gift", icon: "🎁", text: `ایده‌ی ثبت‌شده‌ی شما: «${entry.valueOf("title")}»`, cost: null });
      } else if (entry.section === "interests" && GIFT_INTEREST_CATEGORIES.has(entry.valueOf("category"))) {
        ideas.push({ id: entry.id, source: "interest", icon: "🎯", text: `هدیه‌ای در راستای علاقه‌اش: «${entry.valueOf("value")}»`, cost: null });
      }
    }

    const order: Readonly<Record<GiftSource, number>> = { hint: 0, wishlist: 1, gift: 2, interest: 3 };
    return ideas.sort((left, right) => order[left.source] - order[right.source]).slice(0, MAX_IDEAS);
  }
}
