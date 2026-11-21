import { ConversationCategory, type ConversationCard } from "../games/conversation/ConversationCard";
import type { HamdelEntry } from "../hamdel/HamdelEntry";
import type { DateOnly } from "../valueObjects/DateOnly";
import { DailyRotation } from "./DailyRotation";
import type { DailySuggestion } from "./DailySuggestion";

export interface PlayableGame {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly routeName: string;
}

export interface CouplePlayInput {
  readonly games: readonly PlayableGame[];
  readonly cards: readonly ConversationCard[];
  readonly entries: readonly HamdelEntry[];
  readonly today: DateOnly;
  /** Route name of the conversation-cards game, so the question links to it. */
  readonly questionRouteName: string | null;
}

const OUTFIT_CATEGORIES: ReadonlySet<string> = new Set(["style", "color", "perfume"]);
const DEFAULT_LIMIT = 4;

const QUICK_IDEAS: readonly string[] = [
  "۲۰ دقیقه بدون گوشی کنار هم بنشینید و فقط حرف بزنید.",
  "یک چای یا قهوه‌ی دونفره بسازید و روی بالکن یا کنار پنجره بنوشید.",
  "هرکدام سه چیز که امروز از دیگری ممنونید را بگویید.",
  "یک آهنگ مشترک پیدا کنید و امشب با هم گوشش بدهید.",
  "یک عکس قدیمی از خودتان پیدا کنید و خاطره‌اش را تعریف کنید.",
  "۱۰ دقیقه پیاده‌روی دونفره بعد از شام.",
  "امشب یک دسر ساده را با هم درست کنید.",
  "برای آخر هفته یک برنامه‌ی کوچک و جدید انتخاب کنید.",
  "یک پیام کوتاه و عاشقانه بدون هیچ دلیل خاصی بفرستید.",
  "درباره‌ی بهترین لحظه‌ی این هفته‌تان حرف بزنید.",
];

/** The intimate card category stays inside the game; it is never shown on the front page. */
export function isHomeSafeCard(card: ConversationCard): boolean {
  return card.category !== ConversationCategory.Intimacy;
}

/** Domain Service behind the "Hamraz" card: game, question, style, meal and a tiny shared activity - rotating daily. */
export class CouplePlaySuggestionBuilder {
  public static build(input: CouplePlayInput, limit = DEFAULT_LIMIT): DailySuggestion[] {
    const rotation = DailyRotation.forDay(input.today, "couple");
    const available = [
      CouplePlaySuggestionBuilder.game(input, rotation),
      CouplePlaySuggestionBuilder.question(input, rotation),
      CouplePlaySuggestionBuilder.quickIdea(rotation),
      CouplePlaySuggestionBuilder.outfit(input, rotation),
      CouplePlaySuggestionBuilder.meal(input, rotation),
    ].filter((item): item is DailySuggestion => item !== null);

    return rotation.rotate(available).slice(0, limit);
  }

  private static game(input: CouplePlayInput, rotation: DailyRotation): DailySuggestion | null {
    const game = rotation.pick(input.games, 1);
    return game ? { id: `game:${game.id}`, icon: game.icon, text: `امروز «${game.title}» را با هم بازی کنید.`, to: { name: game.routeName } } : null;
  }

  private static question(input: CouplePlayInput, rotation: DailyRotation): DailySuggestion | null {
    const card = rotation.pick(input.cards, 2);
    if (!card || !input.questionRouteName) {
      return null;
    }
    return { id: `question:${card.id}`, icon: "💬", text: `این سؤال را از او بپرس: «${card.text}»`, to: { name: input.questionRouteName } };
  }

  private static quickIdea(rotation: DailyRotation): DailySuggestion | null {
    const idea = rotation.pick(QUICK_IDEAS, 3);
    return idea ? { id: `idea:${idea}`, icon: "✨", text: idea, to: { name: "games" } } : null;
  }

  private static outfit(input: CouplePlayInput, rotation: DailyRotation): DailySuggestion | null {
    const likes = input.entries.filter((entry) => entry.section === "interests" && OUTFIT_CATEGORIES.has(entry.valueOf("category")));
    const like = rotation.pick(likes, 4);
    return like
      ? {
          id: `outfit:${like.id}`,
          icon: "👗",
          text: `سلیقه‌ی او: «${like.valueOf("value")}» - امروز همین سبک را برای قرارتان امتحان کن.`,
          to: { name: "hamdel-section", params: { section: "interests" } },
        }
      : null;
  }

  private static meal(input: CouplePlayInput, rotation: DailyRotation): DailySuggestion | null {
    const meals = input.entries.filter((entry) => entry.section === "foods" || (entry.section === "interests" && entry.valueOf("category") === "food"));
    const meal = rotation.pick(meals, 5);
    if (!meal) {
      return null;
    }
    const name = meal.section === "foods" ? meal.valueOf("name") : meal.valueOf("value");
    return {
      id: `meal:${meal.id}`,
      icon: "🍽",
      text: `او «${name}» را دوست دارد - امشب همین را سر میز بگذار.`,
      to: { name: "hamdel-section", params: { section: meal.section } },
    };
  }
}
